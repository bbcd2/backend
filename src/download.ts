import { sources, Status } from "./lib";
import { WEBDAV_URL, WEBDAV_USERNAME, WEBDAV_PASSWORD, DEBUG } from "./index";

import axios from "axios";
import fs from "fs";
import { spawn, execSync } from "child_process";
import { SupabaseClient } from "@supabase/supabase-js";

/** Helper function for a sequential `Promise.all` */
function sequentialPromiseResolving<T>(promises: Promise<void | T>[]) {
  return promises.reduce(
    (currentChain, tail) => currentChain.then(() => tail),
    Promise.resolve()
  );
}

/** Convert the timestamp to a segment index (referred to in the digest as $Number$) */
function calculateSegmentIdx(timestamp: number) {
  // <SegmentTemplate ... timescale="50" duration="192" />
  // 192 frames / 50 frames per second = 3.84 seconds
  // fixme: kat claims the epsilon 7.4E-8 is "needed"
  return Math.floor(timestamp / 3.840000074);
}

/** Download a segment by sending a GET request to `url` and saving to `filename` */
async function downloadSegment(url: string, filename: string) {
  // We download the entire segment before we write to a file. The segments should
  // be "relatively" small in filesize, so it's "fine" to not, say, pipe a partial
  // response.
  const resp = await axios
    .get(url, {
      maxContentLength: 32768 * 1024, // empirical; 32MiB
      responseType: "arraybuffer",
    })
    .catch((e) => {
      throw new Error(`Downloading segment failed: ${e}`);
    });
  try {
    fs.writeFileSync(filename, resp.data);
  } catch (e) {
    throw new Error(`Saving segment failed: ${e}`);
  }
}

interface DownloadSegmentsArguments {
  channelId: number;
  jobUuid: string;
  segmentIdxRange: number[];
}
/** Download audio and video segments. Returns the initial video and audio filenames respectively. */
async function downloadSegments(
  { channelId, jobUuid, segmentIdxRange }: DownloadSegmentsArguments // (fmt)
): Promise<string[]> {
  const urlPrefix = sources[channelId].urlPrefix;

  const videoInitUrl = `${urlPrefix}v=pv14/b=5070016/segment.init`;
  const audioInitUrl = `${urlPrefix}a=pa3/al=en-GB/ap=main/b=96000/segment.init`;

  const [videoInitFilename, audioInitFilename] = ["video", "audio"].map(
    (type) => `temp/${jobUuid}/${type}_init.m4s`
  );

  const videoDownloadJobs = [downloadSegment(videoInitUrl, videoInitFilename)];
  const audioDownloadJobs = [downloadSegment(audioInitUrl, audioInitFilename)];

  for (
    let segmentIdx = segmentIdxRange[0];
    segmentIdx <= segmentIdxRange[1];
    segmentIdx++
  ) {
    // Video job
    // timescale=50, duration=192
    const videoUrl = `${urlPrefix}t=3840/v=pv14/b=5070016/${segmentIdx}.m4s`;
    const videoFilename = `temp/${jobUuid}/video_${segmentIdx}.m4s`;
    videoDownloadJobs.push(downloadSegment(videoUrl, videoFilename));
    // Audio job
    // timescale=50, duration=192
    const audioUrl = `${urlPrefix}t=3840/a=pa3/al=en-GB/ap=main/b=96000/${segmentIdx}.m4s`;
    const audioFilename = `temp/${jobUuid}/audio_${segmentIdx}.m4s`;
    audioDownloadJobs.push(downloadSegment(audioUrl, audioFilename));
  }

  await Promise.all([
    sequentialPromiseResolving(videoDownloadJobs),
    sequentialPromiseResolving(audioDownloadJobs),
  ]);

  return [videoInitFilename, audioInitFilename];
}

interface CombineSegmentsArguments {
  filenames: { audioInit: string; videoInit: string; output: string };
  range: number[];
  jobUuid: string;
}
/** Combine audio and video segments */
async function combineSegments(
  { filenames, range, jobUuid }: CombineSegmentsArguments // (fmt)
) {
  // Find files to concatenate
  const [
    [videoFiles, concatenatedVideoFilename],
    [audioFiles, concatenatedAudioFilename],
  ] = [
    ["video", filenames.videoInit],
    ["audio", filenames.audioInit],
  ].map(([type, initFilename]) => {
    let files = `concat:${initFilename}`;
    for (let number = range[0]; number <= range[1]; number++) {
      files += `|temp/${jobUuid}/${type}_${number}.m4s`;
    }
    return [files, `temp/${jobUuid}/${type}_full.mp4`];
  });

  // Concatenate audio and video files simultaneously
  const concatCommands = [
    `ffmpeg -i "${videoFiles}" -c copy ${concatenatedVideoFilename}`,
    `ffmpeg -i "${audioFiles}" -c copy ${concatenatedAudioFilename}`,
  ];
  concatCommands.map(
    (command) =>
      new Promise<void>((resolve, reject) => {
        const process = spawn(command, { shell: true, stdio: undefined });
        process.on("close", (exit) => {
          exit ? reject(`${exit}`) : resolve();
        });
      })
  );
  await Promise.all(concatCommands);

  // Splice together audio and video
  await new Promise((r) => setTimeout(r, 1000));
  execSync(
    `ffmpeg -i ${concatenatedVideoFilename} -i ${concatenatedAudioFilename} -c:v libx264 -c:a copy ${filenames.output}`
  );

  // Clean up
  fs.unlinkSync(concatenatedVideoFilename);
  fs.unlinkSync(concatenatedAudioFilename);
}

export interface ClipArguments {
  range: number[];
  jobUuid: string;
  client: SupabaseClient;
  channelId: number;
}
/** Create a clip */
export async function clip(
  { range, jobUuid, client, channelId }: ClipArguments // (fmt)
) {
  const outputFilename = `temp/${jobUuid}/${jobUuid}.mp4`;
  try {
    console.info(
      `Starting clip from channel ${channelId} from ${range[0]}-${range[1]} with UUID ${jobUuid}`
    );

    // Helper to change the status
    const changeStatus = async (status: Status) => {
      if (!DEBUG)
        await client.from("recordings").update({ status }).eq("uuid", jobUuid);
    };

    // Timestamps are accepted in UTC-1 yet downloaded in UTC. Shift the range over by +1hr.
    range = range.map((bound) => bound + 60 * 60);
    if (!DEBUG)
      await client.from("recordings").insert([
        {
          uuid: jobUuid,
          rec_start: range[0],
          rec_end: range[1],
          status: Status["Initialising"],
          user: 1, // todo
          channel: channelId,
        },
      ]);

    // Find the segment index range
    // FIXME: We shift the range over by +38s (empirical value!) because *that's* how off each segment is
    // See https://discord.com/channels/1237748599606083605/1243530737194373151
    const segmentIdxRange = range.map((bound) =>
      calculateSegmentIdx(bound + 38)
    );

    // Download video and audio segments
    await changeStatus(Status["Downloading"]);
    if (!fs.existsSync(`temp/${jobUuid}`)) {
      fs.mkdirSync(`temp/${jobUuid}`, { recursive: true });
    }
    const [videoInitFilename, audioInitFilename] = await downloadSegments({
      channelId,
      jobUuid,
      segmentIdxRange,
    });

    // Combine audio and video segments
    await changeStatus(Status["Encoding"]);
    await combineSegments({
      filenames: {
        videoInit: videoInitFilename,
        audioInit: audioInitFilename,
        output: outputFilename,
      },
      range: [segmentIdxRange[0], segmentIdxRange[1]],
      jobUuid: jobUuid,
    });

    // Upload
    await changeStatus(Status["Uploading Result"]);
    // Upload the MP4 file to the WebDAV server
    // Safety: The output filename cannot contain any special characters (UUIDv4-derived)
    if (!DEBUG)
      execSync(
        `curl -T '${outputFilename}' -u ${WEBDAV_USERNAME}:${WEBDAV_PASSWORD} ${WEBDAV_URL}/bbcd/${outputFilename}`
      );
    await changeStatus(Status["Complete"]);
  } finally {
    // Cleanup
    if (!DEBUG) {
      fs.unlinkSync(outputFilename);
      fs.rmSync(`temp/${jobUuid}`, { recursive: true });
    }
  }
}

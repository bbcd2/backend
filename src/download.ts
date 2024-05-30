import { SOURCES, Status } from "./lib";
import {
  WEBDAV_URL,
  WEBDAV_USERNAME,
  WEBDAV_PASSWORD,
  DEBUG,
  TEMP_DIRECTORY,
} from "./index";

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
  channel: string;
  jobUuid: string;
  segmentIdxRange: number[];
}
/** Download audio and video segments. Returns the initial video and audio filenames respectively. */
async function downloadSegments(
  { channel, jobUuid, segmentIdxRange }: DownloadSegmentsArguments // (fmt)
): Promise<string[]> {
  const urlPrefix = SOURCES[channel].urlPrefix;

  const videoInitUrl = `${urlPrefix}v=pv14/b=5070016/segment.init`;
  const audioInitUrl = `${urlPrefix}a=pa3/al=en-GB/ap=main/b=96000/segment.init`;

  const [videoInitFilename, audioInitFilename] = ["video", "audio"].map(
    (type) => `${TEMP_DIRECTORY}/${jobUuid}/${type}_init.m4s`
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
    const videoFilename = `${TEMP_DIRECTORY}/${jobUuid}/video_${segmentIdx}.m4s`;
    videoDownloadJobs.push(downloadSegment(videoUrl, videoFilename));
    // Audio job
    // timescale=50, duration=192
    const audioUrl = `${urlPrefix}t=3840/a=pa3/al=en-GB/ap=main/b=96000/${segmentIdx}.m4s`;
    const audioFilename = `${TEMP_DIRECTORY}/${jobUuid}/audio_${segmentIdx}.m4s`;
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
      files += `|${TEMP_DIRECTORY}/${jobUuid}/${type}_${number}.m4s`;
    }
    return [files, `${TEMP_DIRECTORY}/${jobUuid}/${type}_full.mp4`];
  });

  // Concatenate audio and video files simultaneously
  const concatCommands = [
    `ffmpeg -i "${videoFiles}" -c copy ${concatenatedVideoFilename}`,
    `ffmpeg -i "${audioFiles}" -c copy ${concatenatedAudioFilename}`,
  ];
  concatCommands.map(
    (command) =>
      new Promise<void>((resolve, reject) => {
        const process = spawn(command, {
          shell: true,
          stdio: [undefined, undefined, undefined],
        });
        process.on("close", (exit) => {
          exit ? reject(`${exit}`) : resolve();
        });
      })
  );
  await Promise.all(concatCommands);

  // Splice together audio and video
  await new Promise((r) => setTimeout(r, 1000));
  execSync(
    `ffmpeg -i ${concatenatedVideoFilename} -i ${concatenatedAudioFilename} -c:v libx264 -c:a copy ${filenames.output}`,
    { stdio: [undefined, undefined, undefined] }
  );

  // Clean up
  fs.unlinkSync(concatenatedVideoFilename);
  fs.unlinkSync(concatenatedAudioFilename);
}

export interface ClipArguments {
  range: number[];
  jobUuid: string;
  client: SupabaseClient;
  channel: string;
}
/** Create a clip */
export async function clip(
  { range, jobUuid, client, channel }: ClipArguments // (fmt)
) {
  const outputFilename = `${TEMP_DIRECTORY}/${jobUuid}/${jobUuid}.mp4`;
  try {
    console.info(
      `Starting clip from channel ${channel} from ${range[0]}-${range[1]} with UUID ${jobUuid}`
    );

    // Helper to change the status
    const changeStatus = async (status: Status) => {
      if (!DEBUG)
        await client.from("recordings").update({ status }).eq("uuid", jobUuid);
    };

    if (!DEBUG)
      await client.from("recordings").insert([
        {
          uuid: jobUuid,
          rec_start: range[0],
          rec_end: range[1],
          status: Status.Initialising,
          user: 1, // todo
          channel: SOURCES[channel].id,
        },
      ]);

    // Find the segment index range
    // FIXME: We shift the range over by +38s (empirical value!) because *that's* how off each segment is
    // See https://discord.com/channels/1237748599606083605/1243530737194373151
    const segmentIdxRange = range.map((bound) =>
      calculateSegmentIdx(bound + 38)
    );

    // Download video and audio segments
    await changeStatus(Status.Downloading);
    console.debug(`${jobUuid}: Downloading`);
    try {
      if (!fs.existsSync(`${TEMP_DIRECTORY}/${jobUuid}`)) {
        fs.mkdirSync(`${TEMP_DIRECTORY}/${jobUuid}`, { recursive: true });
      }
      var [videoInitFilename, audioInitFilename] = await downloadSegments({
        channel,
        jobUuid,
        segmentIdxRange,
      });
    } catch (e) {
      await changeStatus(Status["Downloading Failed"]);
      throw e;
    }

    // Combine audio and video segments
    console.debug(`${jobUuid}: Combining`);
    await changeStatus(Status.Combining);
    try {
      await combineSegments({
        filenames: {
          videoInit: videoInitFilename,
          audioInit: audioInitFilename,
          output: outputFilename,
        },
        range: [segmentIdxRange[0], segmentIdxRange[1]],
        jobUuid: jobUuid,
      });
    } catch (e) {
      await changeStatus(Status["Encoding Failed"]);
      throw e;
    }

    // Upload
    await changeStatus(Status["Uploading Result"]);
    // Upload the MP4 file to the WebDAV server
    // Safety: The output filename cannot contain any special characters (UUIDv4-derived)
    try {
      const uploadCommand = `curl -T '${outputFilename}' -u ${WEBDAV_USERNAME}:${WEBDAV_PASSWORD} ${WEBDAV_URL}/bbcd/${jobUuid}.mp4`;
      console.debug(`${jobUuid}: Uploading with ${uploadCommand}`);
      if (!DEBUG)
        execSync(uploadCommand, { stdio: [undefined, undefined, undefined] });
      await changeStatus(Status.Complete);
    } catch (e) {
      await changeStatus(Status["Uploading Failed"]);
      throw e;
    }
  } finally {
    // Cleanup
    if (!DEBUG) {
      fs.unlinkSync(outputFilename);
      fs.rmSync(`${TEMP_DIRECTORY}/${jobUuid}`, { recursive: true });
    }
  }
}

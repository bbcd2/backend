const axios = require("axios");
const fs = require("fs");
const moment = require("moment");
const { execSync } = require("child_process");
const { start } = require("repl");
const prompt = require("prompt-sync")();
// Function to calculate $Number$
function calculateNumber(timestamp) {
  return Math.floor(timestamp / 3.840000074);
}

// Function to download segment
async function downloadSegment(url, filename) {
  try {
    const response = await axios.get(url, { responseType: "arraybuffer" });
    fs.writeFileSync(filename, response.data);
  } catch (error) {
    console.error("Error occurred while downloading segment:", error);
    throw new Error("Error occurred while downloading segment");

  }
}

// Function to combine audio and video segments
function combineSegments(
  audioInitFilename,
  videoInitFilename,
  outputFilename,
  startNumber,
  endNumber,
  jobId
) {
  let videoFiles = "concat:" + videoInitFilename;
  for (let number = startNumber; number <= endNumber; number++) {
    videoFiles += `|temp/${jobId}/video_${number}.m4s`;
  }
  const videoFullFilename = "video_full.mp4";
  execSync(`ffmpeg -i "${videoFiles}" -c copy ${videoFullFilename}`);

  let audioFiles = "concat:" + audioInitFilename;
  for (let number = startNumber; number <= endNumber; number++) {
    audioFiles += `|temp/${jobId}/audio_${number}.m4s`;
  }
  const audioFullFilename = "audio_full.mp4";
  execSync(`ffmpeg -i "${audioFiles}" -c copy ${audioFullFilename}`);

  execSync(
    `ffmpeg -i ${videoFullFilename} -i ${audioFullFilename} -c:v libx264 -c:a copy ${outputFilename}`
  );
  fs.unlinkSync(videoFullFilename);
  fs.unlinkSync(audioFullFilename);
}

// Wrap the main logic in an async function to use await
async function main(startTimestamp, endTimestamp, jobId, client, channel) {
  // Add one hour to start and end timestamp
  startTimestamp += 3600;
  endTimestamp += 3600;
  await client.from("recordings").insert([
    {
      uuid: jobId,
      rec_start: startTimestamp,
      rec_end: endTimestamp,
      status: 1,
      user: 1,
      channel: channel,
    },
  ]);
  // Add 38 seconds to start and end timestamps to account for my bad code
  startTimestamp += 38;
  endTimestamp += 38;
  console.log(startTimestamp, endTimestamp, jobId, channel);
  startTimestamp = parseInt(startTimestamp);
  endTimestamp = parseInt(endTimestamp);


  // Calculate $Number$
  const startNumber = calculateNumber(startTimestamp);
  const endNumber = calculateNumber(endTimestamp);
  channel = parseInt(channel);
  // URL prefix
  const urlPrefixes = [
    "https://vs-cmaf-push-uk.live.fastly.md.bbci.co.uk/x=4/i=urn:bbc:pips:service:bbc_news_channel_hd/",
    "https://vs-cmaf-pushb-ntham-gcomm-live.akamaized.net/x=4/i=urn:bbc:pips:service:bbc_world_news_north_america/",
    "https://vs-cmaf-push-uk.live.fastly.md.bbci.co.uk/x=4/i=urn:bbc:pips:service:bbc_one_hd/",
    "https://vs-cmaf-pushb-uk-live.akamaized.net/x=4/i=urn:bbc:pips:service:bbc_one_wales_hd/",
    "https://vs-cmaf-pushb-uk-live.akamaized.net/x=4/i=urn:bbc:pips:service:bbc_one_scotland_hd/",
    "https://vs-cmaf-pushb-uk-live.akamaized.net/x=4/i=urn:bbc:pips:service:bbc_one_northern_ireland_hd/",
    "https://vs-cmaf-pushb-uk-live.akamaized.net/x=4/i=urn:bbc:pips:service:bbc_one_channel_islands/",
    "https://vs-cmaf-pushb-uk-live.akamaized.net/x=4/i=urn:bbc:pips:service:bbc_one_east/",
    "https://vs-cmaf-pushb-uk-live.akamaized.net/x=4/i=urn:bbc:pips:service:bbc_one_east_midlands/",
    "https://vs-cmaf-pushb-uk-live.akamaized.net/x=4/i=urn:bbc:pips:service:bbc_one_east_yorkshire/",
    "https://vs-cmaf-push-uk-live.akamaized.net/x=4/i=urn:bbc:pips:service:bbc_one_london/",
    "https://vs-cmaf-pushb-uk.live.cf.md.bbci.co.uk/x=4/i=urn:bbc:pips:service:bbc_one_north_east/",
    "https://vs-cmaf-pushb-uk.live.cf.md.bbci.co.uk/x=4/i=urn:bbc:pips:service:bbc_one_north_west/",
    "https://vs-cmaf-pushb-uk-live.akamaized.net/x=4/i=urn:bbc:pips:service:bbc_one_south/",
    "https://vs-cmaf-pushb-uk.live.cf.md.bbci.co.uk/x=4/i=urn:bbc:pips:service:bbc_one_south_east/",
    "https://vs-cmaf-pushb-uk-live.akamaized.net/x=4/i=urn:bbc:pips:service:bbc_one_south_west/",
    "https://vs-cmaf-pushb-uk.live.cf.md.bbci.co.uk/x=4/i=urn:bbc:pips:service:bbc_one_west/",
    "https://vs-cmaf-pushb-uk-live.akamaized.net/x=4/i=urn:bbc:pips:service:bbc_one_west_midlands/",
    "https://vs-cmaf-pushb-uk.live.cf.md.bbci.co.uk/x=4/i=urn:bbc:pips:service:bbc_one_yorks/",
    "https://vs-cmaf-push-uk-live.akamaized.net/x=4/i=urn:bbc:pips:service:bbc_two_hd/",
    "https://vs-cmaf-pushb-uk-live.akamaized.net/x=4/i=urn:bbc:pips:service:bbc_two_northern_ireland_hd/",
    "https://vs-cmaf-pushb-uk.live.fastly.md.bbci.co.uk/x=4/i=urn:bbc:pips:service:bbc_two_wales_digital/",
    "https://vs-cmaf-pushb-uk-live.akamaized.net/x=4/i=urn:bbc:pips:service:bbc_three_hd/",
    "https://vs-cmaf-pushb-uk.live.cf.md.bbci.co.uk/x=4/i=urn:bbc:pips:service:bbc_four_hd/",
    "https://b2-hobir-sky.live.bidi.net.uk/vs-cmaf-pushb-uk/x=4/i=urn:bbc:pips:service:cbbc_hd/",
    "https://vs-cmaf-pushb-uk-live.akamaized.net/x=4/i=urn:bbc:pips:service:cbeebies_hd/",
    "https://vs-cmaf-pushb-uk-live.akamaized.net/x=4/i=urn:bbc:pips:service:bbc_scotland_hd/",
    "https://vs-cmaf-pushb-uk-live.akamaized.net/x=4/i=urn:bbc:pips:service:bbc_parliament/",
    "https://vs-cmaf-pushb-uk-live.akamaized.net/x=4/i=urn:bbc:pips:service:bbc_alba/",
    "https://vs-cmaf-pushb-uk-live.akamaized.net/x=4/i=urn:bbc:pips:service:s4cpbs/"
  ];
  const urlPrefix = urlPrefixes[channel];
  const audioInitUrl = `${urlPrefix}a=pa3/al=en-GB/ap=main/b=96000/segment.init`;
  const videoInitUrl = `${urlPrefix}v=pv14/b=5070016/segment.init`;
  // Create a directory to store downloaded segments
  if (!fs.existsSync(`temp/${jobId}`)) {
    fs.mkdirSync(`temp/${jobId}`, { recursive: true });
  }
  const audioInitFilename = "temp/" + jobId + "/audio_init.m4s";
  const videoInitFilename = "temp/" + jobId + "/video_init.m4s";
  await downloadSegment(audioInitUrl, audioInitFilename);
  await downloadSegment(videoInitUrl, videoInitFilename);
  // Update status to 2
  await client.from("recordings").update({ status: 2 }).eq("uuid", jobId);
  // Loop through each $Number$ and download video segments
  for (let number = startNumber; number <= endNumber; number++) {
    const videoUrl = `${urlPrefix}t=3840/v=pv14/b=5070016/${number}.m4s`;
    const videoFilename = `temp/${jobId}/video_${number}.m4s`;
    await downloadSegment(videoUrl, videoFilename);
  }
  //Update status to 3
  await client.from("recordings").update({ status: 3 }).eq("uuid", jobId);
  // Loop through each $Number$ and download audio segments
  for (let number = startNumber; number <= endNumber; number++) {
    const audioUrl = `${urlPrefix}t=3840/a=pa3/al=en-GB/ap=main/b=96000/${number}.m4s`;
    const audioFilename = `temp/${jobId}/audio_${number}.m4s`;
    await downloadSegment(audioUrl, audioFilename);
  }
  // Update status to 4
  await client.from("recordings").update({ status: 4 }).eq("uuid", jobId);
  // Combine audio and video segments
  const outputFilename = jobId + ".mp4";
  combineSegments(
    audioInitFilename,
    videoInitFilename,
    outputFilename,
    startNumber,
    endNumber,
    jobId
  );
  // Update status to 5
  await client.from("recordings").update({ status: 5 }).eq("uuid", jobId);
  // Clean up downloaded segments
  for (let number = startNumber; number <= endNumber; number++) {
    fs.unlinkSync(`temp/${jobId}/video_${number}.m4s`);
    fs.unlinkSync(`temp/${jobId}/audio_${number}.m4s`);
  }
  // Clean  up folder
  fs.rmSync(`temp/${jobId}`, { recursive: true });
  // Update status to 6
  await client.from("recordings").update({ status: 6 }).eq("uuid", jobId);
  // Upload the MP4 file to the WebDAV server
  const webdavUrl = process.env.WEBDAV_URL;
  const webdavUsername = process.env.WEBDAV_USERNAME;
  const webdavPassword = process.env.WEBDAV_PASSWORD;
  execSync(
    `curl -T ${outputFilename} -u ${webdavUsername}:${webdavPassword} ${webdavUrl}/bbcd/${outputFilename}`
  );
  // Delete the local file
  fs.unlinkSync(outputFilename);
  // Update status to 7
  await client.from("recordings").update({ status: 7 }).eq("uuid", jobId);
}

module.exports = main;

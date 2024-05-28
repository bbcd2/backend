const express = require("express");
const app = express();
const port = 3001;
const main = require("./download");
const { v4: uuidv4 } = require("uuid");
const cors = require("cors");
const bodyParser = require("body-parser");
const sb = require("@supabase/supabase-js");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
// get webdav details from .env.local
require("dotenv").config();
const webdavUrl = process.env.WEBDAV_URL;
const webdavUsername = process.env.WEBDAV_USERNAME;
const webdavPassword = process.env.WEBDAV_PASSWORD;
// get supabase details
const supabaseUrl = process.env.PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.PUBLIC_SUPABASE_ANON_KEY;

const client = sb.createClient(supabaseUrl, supabaseKey);

app.use(cors());
app.use(bodyParser.json());

app.post("/downloadVideo", async (req, res) => {
  // Extract start and end timestamps from the request query parameters
  const startTimestamp = parseInt(req.body.startTimestamp);
  const endTimestamp = parseInt(req.body.endTimestamp);
  channel = parseInt(req.body.channel);
  const jobId = uuidv4();
  main(startTimestamp, endTimestamp, jobId, client, channel)
    .then((outputFilename) => {
    })
    .catch((error) => {
      console.error("Error occurred in main process:", error);
    });

  res.send(jobId);
});

/* // Download route
app.get("/download/:jobId", (req, res) => {
  const jobId = req.params.jobId;

  // Download the MP4 file from the WebDAV server
  axios({
    method: "get",
    url: `${webdavUrl}/bbcd/${jobId}.mp4`,
    responseType: "stream",
    auth: {
      username: webdavUsername,
      password: webdavPassword,
    },
  })
    .then((response) => {
      res.setHeader("Content-Disposition", `attachment`);
      response.data.pipe(res);
    })
    .catch((error) => {
      console.error("Error downloading file:", error);
      res.status(500).send("Error downloading file");
    });
}); */
app.get("/download/:jobId", (req, res) => {
  const videosDirectory = "Z:\\bbcd\\bbcd";
  const filename = req.params.jobId + '.mp4';
  const videoPath = path.join(videosDirectory, filename);
  // Check if the file exists
  fs.access(videoPath, fs.constants.F_OK, (err) => {
    if (err) {
      // File does not exist
      res.status(404).send("Video not found");
      return;
    }
    // Create a readable stream from the video file and pipe it to the response
    const videoStream = fs.createReadStream(videoPath);
    videoStream.pipe(res);
  });
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

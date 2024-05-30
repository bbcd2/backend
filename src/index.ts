import { clip } from "./download";
import express from "express";
import { v4 as uuidv4 } from "uuid";
import cors from "cors";
import bodyParser from "body-parser";
import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import dotenv from "dotenv";
import path from "path";

// Config
dotenv.config();
/** Disables modifying the database, uploading to webdav, and cleaning the temp directory */
export const DEBUG = false;
export const VIDEO_DOWNLOAD_JOB_COUNT = 5;
export const PORT = process.env.PORT ?? 3001;
export const TEMP_DIRECTORY = process.env.TEMP_DIRECTORY ?? "temp";
export const WEBDAV_URL = process.env.WEBDAV_URL!;
export const WEBDAV_USERNAME = process.env.WEBDAV_USERNAME!;
export const WEBDAV_PASSWORD = process.env.WEBDAV_PASSWORD!;
export const SUPABASE_URL = process.env.PUBLIC_SUPABASE_URL!;
export const SUPABASE_KEY = process.env.PUBLIC_SUPABASE_ANON_KEY!;

const app = express();
const sb_client = createClient(SUPABASE_URL, SUPABASE_KEY);

app.use(cors());
app.use(bodyParser.json());

/** Create a clip */
app.post("/downloadVideo", async (req, res) => {
  const [startTimestamp, endTimestamp] = [
    req.body.startTimestamp,
    req.body.endTimestamp,
  ].map((int) => parseInt(int, 10));
  const channel = req.body.channel;
  const encode = !!req.body.encode;

  const jobUuid = uuidv4();
  res.send(jobUuid);

  try {
    await clip({
      range: [startTimestamp, endTimestamp],
      jobUuid: jobUuid,
      client: sb_client,
      channel,
      encode,
    });
  } catch (e) {
    console.error(`${jobUuid} failed: ${e}`);
  }
});

app.listen(PORT, () => {
  console.log(`Server is running at http://0.0.0.0:${PORT}`);
});

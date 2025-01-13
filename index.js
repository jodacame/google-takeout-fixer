// const exif = require("./exif");
// const fs = require("fs");
// const Logger = require("@jodacame/node-logger");

import exif from "./exif.js";
import fs from "fs";
import Logger from "@jodacame/node-logger";
const exit = (message) => {
  console.error(message);
  process.exit(1);
}


const path = process.argv[2];
const target = process.argv[3];

if (!target || !path) {
  exit("Path and target is required");
}
if (!fs.existsSync(target)) {
  exit("Target folder not found");
}
const exts = process.argv[4] ? process.argv[4].split(",") : ["jpg", "jpeg", "png", "mov", "mp4", "m4v", "avi", "mkv", "wmv", "mpg", "mpeg"];
exif.getFiles(path, exts).then(async (files) => {
  let count = 0;
  for (const file of files) {
    count++;

    // Copy file to target
    const fileName = file.split("/").pop();
    const pathTarget = target + "/"
    await fs.promises.copyFile(file, pathTarget + fileName);
    // checi if .json file exists
    if (fs.existsSync(file + ".json")) {
      await fs.promises.copyFile(file + ".json", pathTarget + fileName + ".json");
    }
    // console.log(`[${count}/${files.length}] Copy file ${fileName} to ${pathTarget} and fix exif`);
    await exif.fixExif(pathTarget + fileName);
    // logger.progress(value, [total], [barLength], [message]);
    Logger.progress(count, files.length, 100,`[${count}/${files.length}] ${fileName}`);

 
    
  }
});
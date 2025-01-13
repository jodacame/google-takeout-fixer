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
let target = process.argv[3];

if (!target || !path) {
  exit("Path and target is required");
}
if (!fs.existsSync(target)) {
  exit("Target folder not found");
}

if(target.endsWith("/")){
  target = target.slice(0, -1);
}
const exts = process.argv[4] ? process.argv[4].split(",") : ["jpg", "jpeg", "png", "mov", "mp4", "m4v", "avi", "mkv", "wmv", "mpg", "mpeg","3gp","heic","heif"];
const start = new Date();

exif.getFiles(path, exts).then(async (files) => {
  let count = 0;
  for (const file of files) {
    count++;

    const duration = new Date() - start;
    const leftTimeAVG = duration / count * (files.length - count);

    
    // Copy file to target
    const fileName = file.split("/").pop();
    const subfolder = file.split("/").length > 1 ? file.split("/")[file.split("/").length - 2] + "/" : "";
    const pathTarget = target + "/" + subfolder 
    if(!fs.existsSync(pathTarget)){
      fs.mkdirSync(pathTarget, { recursive: true });
    }
    // If  exists continue
    if (fs.existsSync(pathTarget + fileName)) {
      continue;
    }
    // if name contains Screenshot, continue
    if (fileName.includes("Screenshot")) {
      continue;
    }
    await fs.promises.copyFile(file, pathTarget + fileName);
    
    if (fs.existsSync(file + ".json")) {
      await fs.promises.copyFile(file + ".json", pathTarget + fileName + ".json");
    }
    
    await exif.fixExif(pathTarget + fileName);
    
    // logger.progress(value, [total], [barLength], [message]);
    const HHMMSS = new Date(duration).toISOString().substr(11, 8);
    const HHMMSSLeft = new Date(leftTimeAVG).toISOString().substr(11, 8);
    Logger.progress(count, files.length, 100,`${HHMMSS} [${count}/${files.length}] ${fileName}`);

  
    
  }
});

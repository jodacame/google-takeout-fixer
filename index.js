const exif = require("./exif");
const fs = require("fs");
const path = process.argv[2];
const target = process.argv[2];
const exts = process.argv[3] ? process.argv[3].split(",") : ["jpg", "jpeg", "png", "mov", "mp4", "m4v", "avi", "mkv", "wmv", "mpg", "mpeg"];
exif.getFiles(path, exts).then(async (files) => {
  let count = 0;
  for (const file of files) {
    count++;
    
    await exif.fixExif(file);
    // Copy file to target
    const fileName = file.split("/").pop();
    const pathTarget = target + "/"
    fs.promises.copyFile(file, pathTarget + fileName);
    console.log("Copy file to target", pathTarget + fileName);
  }
  // Move path to Procceed folder
  // const date = new Date();
  // const pathProceed =
  //   path.split("/").slice(0, -1).join("/") +
  //   "/Proceed-" +
  //   date.toISOString().split("T")[0] +
  //   "-" +
  //   date.getTime();
  // fs.promises.rename(path, pathProceed);
});
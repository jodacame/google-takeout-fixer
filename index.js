const exif = require("./exif");
const fs = require("fs");
const path = process.argv[2];
const exts = process.argv[3]
  ? process.argv[3].split(",")
  : ["jpg", "jpeg", "png", "mov", "mp4", "m4v", "avi", "mkv", "wmv", "mpg", "mpeg"];

exif.getFiles(path, exts).then(async (files) => {
  let count = 0;
  for (const file of files) {
    count++;
    console.log(`${count} of ${files.length} - Fixing ${file}`);
    await exif.fixExif(file);
  }
  // Move path to Procceed folder
  const date = new Date();

  const pathProceed =
    path.split("/").slice(0, -1).join("/") +
    "/Proceed-" +
    date.toISOString().split("T")[0] +
    "-" +
    date.getTime();
  fs.promises.rename(path, pathProceed);
});

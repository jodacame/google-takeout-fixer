const exif = require("./exif");

const path = process.argv[2];
const exts = process.argv[3]
  ? process.argv[3].split(",")
  : ["jpg", "jpeg", "png", "mov", "mp4", "m4v", "avi", "mkv", "wmv", "mpg", "mpeg"];

exif.getFiles(path, exts).then(async (files) => {
  for (const file of files) {
    console.log(`Fixing ${file}`);
    await exif.fixExif(file);
  }
});

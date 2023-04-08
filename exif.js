const fs = require("fs");
const exiftool = require("node-exiftool");
const ep = new exiftool.ExiftoolProcess();
const glob = require("glob");
module.exports = {
  async readRecursiveDir(path) {
    return glob(path + "/**/*", { nodir: true });
  },
  async removeArchiveFolder(path) {
    console.log("Remove Archive folder", path);
    return fs.promises.rm(path, { recursive: true, force: true });
  },
  async checkIfFileNameIsDate(file) {
    const fileName = file.split("/").pop().split(".")[0];
    const date = new Date(fileName);
    if (date.toString() === "Invalid Date") {
      return false;
    }
    console.log("Date from file name", date);
    return date;
  },
  async getFiles(path, exts = ["jpg", "jpeg", "png"]) {
    const files = await this.readRecursiveDir(path);

    const result = [];
    for (const file of files) {
      // check if file is in archive folder
      if (file.includes("/Archive/")) {
        const pathArchive = file.split("/Archive/")[0];
        await this.removeArchiveFolder(pathArchive + "/Archive");
      }
      const ext = file.split(".").pop().toLowerCase();
      if (exts.includes(ext)) {
        result.push(file);
      } else {
        // Remove file
        // ignore JSON files
        if (ext !== "json") {
          console.warn("Remove file", file);
          fs.rmSync(file);
        }
      }
    }
    return result;
  },

  getDateFromMetadata(date) {
    if (!date) return false;
    console.log("Try get date from metadata", date);

    if (date.split(":").length > 2) {
      // Try fix date format YYYY:MM:DD HH:MM:SS to YYYY-MM-DD HH:MM:SS
      date = date.replace(":", "-"); // 1
      date = date.replace(":", "-"); // 2
    }
    console.log("Try get date from metadata (Fixed)", date);
    const _date = new Date(date);
    if (_date.toString() === "Invalid Date") {
      return false;
    }
    console.log("Date from metadata", _date);
    return _date;
  },

  async fixExif(file) {
    // read JSON file from Google

    const fileJson = file + ".json";
    // check if exist JSON
    let json = {
      title: "",
      geoData: {},
      geoDataExif: {},
      creationTime: {},
      photoTakenTime: {},
    };
    if (fs.existsSync(fileJson)) {
      const data = await fs.promises.readFile(fileJson);
      // parse JSON file
      json = JSON.parse(data);
    }

    const exif = {
      title: json.title,
      "gps:latitude": json.geoData.latitude || json.geoDataExif.latitude || null,
      "gps:longitude": json.geoData.longitude || json.geoDataExif.longitude || null,
      GPSLongitude: json.geoData.longitude || json.geoDataExif.longitude || null,
      GPSLatitude: json.geoData.latitude || json.geoDataExif.latitude || null,
      Description: "From Google Photos - https://github.com/jodacame/google-takeout-fixer",
      ThumbnailImage: null, // Empty thumbnail binary data
      PreviewImage: null,
      MPImage3: null,
    };
    if (!exif["gps:latitude"] || !exif["gps:longitude"]) {
      delete exif["gps:latitude"];
      delete exif["gps:longitude"];
      delete exif.GPSLongitude;
      delete exif.GPSLatitude;
    }

    // write exif data to file
    await ep.open();
    // Get metadata
    const metadata = await ep.readMetadata(file, ["-File:all"]);
    console.log("Metadata", metadata);

    // Try get date from metadata
    let taken = await this.checkIfFileNameIsDate(file);
    if (metadata) {
      try {
        if (!taken) taken = this.getDateFromMetadata(metadata.data[0].CreateDate);
        if (!taken) taken = this.getDateFromMetadata(metadata.data[0].DateTimeOriginal);
        if (!taken) taken = this.getDateFromMetadata(metadata.data[0].ModifyDate);
        if (!taken) taken = this.getDateFromMetadata(metadata.data[0].FileModifyDate);
        if (!taken) taken = this.getDateFromMetadata(metadata.data[0].FileCreateDate);
      } catch (error) {}
    }

    // Google Timestamp
    const createGoogle = json.creationTime.timestamp;
    if (createGoogle !== taken && taken && createGoogle) {
      // Use most old date
      taken = Math.min(createGoogle, taken);
    }
    if (!taken) taken = json.photoTakenTime.timestamp;

    // Write metadata only if latitude and longitude are not set
    if (metadata.data[0].GPSLatitude && metadata.data[0].GPSLongitude) {
      delete exif["gps:latitude"];
      delete exif["gps:longitude"];
      delete exif.GPSLongitude;
      delete exif.GPSLatitude;
    }
    await ep.writeMetadata(file, exif, ["-overwrite_original"]); // overwrite_original is important to write to the original file
    await ep.close();

    // Change file creation date
    if (!taken) {
      // set old date
      taken = new Date("1900-01-01");
    }
    console.log("Taken", taken);
    // console.log("Taken Typeof", typeof taken);
    fs.utimesSync(file, taken, taken);

    console.log("Fixed", file, exif);

    // delete JSON file if exist
    if (fs.existsSync(fileJson)) fs.rmSync(fileJson);
  },
};

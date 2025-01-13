# Google Takeout Fixer

This is a simple script that fixes the timestamps and geolocation data of the photos and videos in the Google Takeout archive. The script reads the json file that contains the metadata of the photos and videos and then updates the timestamps and geolocation data of the files accordingly.

## Requirements

- Node.js
- npm
- exiftool


## Usage
```bash
git clone git@github.com:jodacame/google-takeout-fixer.git
cd google-takeout-fixer
npm install
node index.js path/to/takeout/folder path/target/folder
```

## Tested on

- MacOS
- Ubuntu


## Why this script?

This is a personal project born out of necessity. I had accumulated over 100,000 photos in my Google account over the years. When I decided to use Google Takeout to download all my photos and videos, I quickly realized the massive issue I was facing: the dates and geolocation data of the files were all messed up. 

With a couple of decades worth of family memories at stake, I couldn't just leave them in disarray. I needed a solution to fix the timestamps and geolocation data accurately. That's why I developed this script. It reads the metadata from the JSON files provided by Google Takeout and updates the timestamps and geolocation data of the photos and videos accordingly.

This script has been a lifesaver for me, and I hope it can help others who find themselves in a similar situation. Whether you're dealing with a few hundred photos or hundreds of thousands, this tool aims to make the process as smooth and accurate as possible.
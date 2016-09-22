var fs = require('fs');
var ytdl = require('ytdl-core');

ytdl('https://www.youtube.com/watch?v=IxGvm6btP1A')
  .pipe(fs.createWriteStream('video.flv'));

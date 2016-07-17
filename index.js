const canvas = document.createElement('canvas');
const loadImg = require('load-img');
const unlerp = require('unlerp');
const ctx = canvas.getContext('2d');
const getImagePixels = require('get-image-pixels');
const createPlayer = require('web-audio-player');
const createAnalyser = require('web-audio-analyser');
const createLoop = require('raf-loop');
const smoothstep = require('smoothstep');
const createVideo = require('simple-media-element').video;
const createAudio = require('simple-media-element').audio;
const events = require('dom-events');

document.body.style.margin = '0';
canvas.style.display = 'block';
document.body.appendChild(canvas);

// const audioSrc = 'assets/audio/31 First Light.mp3';
// const imgSrc = 'assets/image/monroe.jpg';
const videoSrc = 'assets/video/budapest_2.mp4';
const audioSrc = 'assets/video/budapest_2.mp4';
const OfflineAudioCtx = window.OfflineAudioContext || window.webkitOfflineAudioContext;
const AudioCtx = window.AudioContext || window.webkitAudioContext;

const audioCtx = new AudioCtx();
const dpr = 4//window.devicePixelRatio;
let width, height;
let x = 0;

const video = createVideo(videoSrc, {
  muted: true
});
video.currentTime = 2;
events.once(video, 'canplaythrough', () => {
  width = 512;
  height = 128;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  ctx.save();
  ctx.scale(dpr, dpr);
  ctx.fillStyle = 'hsl(0, 0%, 10%)';
  ctx.fillRect(0, 0, width, height);
  document.body.style.background = ctx.fillStyle;

  const fps = 23.98;
  const timeOffset = 1 / fps;
  let currentTime = 0;
  let audio;

  analyze(audioSrc, (err, analyser) => {
    if (err) throw err;
    start(analyser);
    video.play();
    console.log('Starting');
  });

  function start (analyser) {
    createLoop(dt => {
      const audioData = analyser.waveform();
      const binCount = analyser.analyser.frequencyBinCount;
      render(video, audioData, binCount);
      // ctx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
    }).start();
    // setInterval(() => {
    //   video.currentTime = audio.currentTime;
    // }, 100);
  }

  function analyze (src, cb) {
    // const player = createPlayer(src);
    audio = createAudio(audioSrc);
    const analyser = createAnalyser(audio, audioCtx, {
      stereo: false,
      audible: true
    });
    audio.play();
    // player.node.connect(player.context.destination);
    cb(null, analyser);
  }
});

function render (img, audioData, binCount) {
  const imgWidth = video.videoWidth;
  const imgHeight = video.videoHeight;
  // ctx.drawImage(img, 0, 0, 128, 128);
  
  // const pixels = getImagePixels(video);
  // const width = imgWidth;
  // const height = img.height;

  // ctx.clearRect(0, 0, width, height);

  let sum = 0;
  let highest = -Infinity;
  let lowest = Infinity;
  for (let i = 0; i < audioData.length; i++) {
    sum += audioData[i];
    highest = Math.max(highest, audioData[i] / 255);
    lowest = Math.min(lowest, audioData[i] / 255);
  }
  sum /= audioData.length;

  const sliceWidth = 0.085;
  const gapWidth = 0.085;
  const smallGapWidth = (imgWidth * 0.5) / audioData.length;
  let curX = x;
  for (let i = 0; i < audioData.length; i++) {
    const xpos = curX;
    const n = (audioData[i] / 255) * 2 - 1;
    let t = Math.abs(n);
    // const srcX = (xpos + t * width * gapWidth) % img.width;
    const srcX = imgWidth / 2 + i;
    // const srcX = ((imgWidth / 2) + n * 50) % imgWidth;
    const sliceHeight = t * height;
    const sliceY = (height - sliceHeight) / 2;
    const srcSliceHeight = t * imgHeight;
    const srcSliceY = (imgHeight - srcSliceHeight) / 2;
    ctx.globalAlpha = 0.1
    ctx.drawImage(img, srcX, srcSliceY, sliceWidth, srcSliceHeight, xpos, sliceY, sliceWidth, sliceHeight);
    curX += smallGapWidth;
  }
  x += gapWidth;
  // if (x > width) x = 0;

  // const sliceWidth = binCount / width;
  // for (let i = 0; i < binCount; i++) {
  //   const x = sliceWidth * i;
  //   const t = (audioData[i] / 255) * 2 - 1;
  //   const sliceHeight = t * height;
  //   const y = height - sliceHeight;
  //   ctx.drawImage(img, x, 0, sliceWidth, sliceHeight, x, 0, sliceWidth, sliceHeight);
  // }
}

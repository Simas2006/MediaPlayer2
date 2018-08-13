var fs = require("fs");
var queue = [];
var isPlaying = true;
var albumName = null;
var albumIndex = 0;
var currentURL = null;

var rhandlers = {
  getQueue() {
    return queue;
  },
  setQueue(newQueue) {
    queue = newQueue;
  },
  isPlaying() {
    return isPlaying;
  },
  togglePlay() {
    isPlaying = ! isPlaying;
  },
  openHome() {
    albumName = null;
    albumIndex = 0;
  },
  openAlbum(album) {
    albumName = album;
    albumIndex = 0;
    var list = fs.readdirSync(__dirname + "/../data" + albumName);
    return list[0];
  },
  movePicture(toMove) {
    if ( ! albumName ) return "error";
    albumIndex += toMove;
    var list = fs.readdirSync(__dirname + "/../data" + albumName);
    var suffix = "";
    if ( albumIndex + 1 == list.length && toMove == 1 ) suffix = "_last";
    if ( albumIndex + 1 > list.length ) albumIndex = 0;
    if ( albumIndex == 0 && toMove == -1 ) suffix = "_first";
    if ( albumIndex < 0 ) albumIndex = list.length - 1;
    return list[albumIndex] + suffix;
  },
  openURL(url) {
    currentURL = url;
  },
  playNextSong() {
    queue = queue.slice(1);
  },
  rewindSong() {
    // implement this
  }
}

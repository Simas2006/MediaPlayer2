var fs = require("fs");
var EXIF = require("exif-js");
var shell = require("electron").shell;
var LOCAL_DIR = process.env.APPDATA || (process.platform == "darwin" ? process.env.HOME + "/Library/Application Support/MediaPlayer2" : "/var/local");
var DATA_LOC = LOCAL_DIR + "/LocalData";
var ihandlers;

function replaceAll(oldChar,newChar,string) {
  return string.split(oldChar).join(newChar);
}

class MusicAgent {
  constructor() {
    this.queue = [];
    this.playing = true;
    this.volume = 50;
    this.volumeTimeout = 0;
    this.tnsTimeout = 0;
    this.audio = document.getElementById("audio");
    this.audio.volume = 0.5;
    this.audio.onended = function() {
      this.triggerNextSong(false);
    }.bind(this);
    setInterval(this.updateTimeInfo.bind(this),1000);
    setInterval(_ => {
      this.volumeTimeout = Math.max(this.volumeTimeout - 1,0);
      this.tnsTimeout = Math.max(this.tnsTimeout - 1,0);
    },1);
  }
  render() {
    if ( this.playing ) document.getElementById("paused").innerText = "";
    else document.getElementById("paused").innerText = "Paused";
    document.getElementById("playing").innerText = this.formatSongName(this.queue[0]) || "Nothing!";
    var list = document.getElementById("queue");
    while ( list.firstChild ) {
      list.removeChild(list.firstChild);
    }
    for ( var i = 1; i < this.queue.length; i++ ) {
      var item = document.createElement("li");
      item.innerText = this.formatSongName(this.queue[i]);
      list.appendChild(item);
    }
    if ( this.queue.length <= 1 ) document.getElementById("nothingText").innerText = "Nothing!";
    else document.getElementById("nothingText").innerText = "";
  }
  updateTimeInfo() {
    var pad = n => n >= 10 ? n : "0" + n;
    var currentTime = Math.floor(this.audio.currentTime);
    var currentTimeM = this.queue[0] ? Math.floor(currentTime / 60) : "-";
    var currentTimeS = this.queue[0] ? pad(currentTime % 60) : "--";
    var negativeTime = Math.floor(this.audio.duration - this.audio.currentTime);
    var negativeTimeM = this.queue[0] ? "-" + Math.floor(negativeTime / 60) : "-";
    var negativeTimeS = this.queue[0] ? pad(negativeTime % 60) : "--";
    document.getElementById("timeInfo").innerText = `${currentTimeM}:${currentTimeS} | VOL ${pad(this.volume)}% | ${negativeTimeM}:${negativeTimeS}`;
    getConnectionState(function(connected) {
      if ( connected ) {
        document.getElementById("deviceText").innerText = "1 Device Connected";
        document.getElementById("deviceLink").innerText = "Force Disconnect";
      } else {
        document.getElementById("deviceText").innerText = "0 Devices Connected";
        document.getElementById("deviceLink").innerText = "";
      }
    });
  }
  triggerNextSong(newElements) {
    if ( this.tnsTimeout > 0 ) return;
    this.tnsTimeout = 150;
    if ( ! newElements ) this.queue.splice(0,1);
    if ( this.queue[0] ) {
      this.audio.src = replaceAll("#","%23",replaceAll("?","%3F",DATA_LOC + "/" + this.queue[0]));
      this.audio.play();
    } else {
      this.audio.src = "";
      this.audio.pause();
    }
    this.playing = true;
    this.render();
  }
  formatSongName(name) {
    if ( ! name ) return name;
    var extIndex = name.lastIndexOf(".");
    var pathIndex = name.lastIndexOf("/");
    name = name.slice(pathIndex + 1,extIndex);
    var numberIndex = 0;
    for ( var i = 0; i < name.length; i++ ) {
      if ( "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ".indexOf(name.charAt(i)) > -1 ) {
        numberIndex = i;
        break;
      }
    }
    name = name.slice(numberIndex);
    return name;
  }
  eGetQueue() {
    return this.queue;
  }
  eSetQueue(newQueue) {
    var newSong = this.queue[0];
    this.queue = newQueue;
    if ( ! newSong ) this.triggerNextSong(true);
    else this.render();
  }
  eIsPlaying() {
    return this.playing;
  }
  eTogglePlay() {
    this.playing = ! this.playing;
    if ( this.queue[0] ) {
      if ( this.playing ) this.audio.play();
      else this.audio.pause();
    }
    this.render();
  }
  ePlayNextSong() {
    this.triggerNextSong(false);
  }
  eRewindSong() {
    this.audio.currentTime = 0;
  }
  eGetVolume() {
    return this.volume;
  }
  eSetVolume(newVolume) {
    if ( this.volumeTimeout > 0 ) return;
    this.volumeTimeout = 100;
    this.volume = newVolume;
    this.audio.volume = newVolume / 100;
  }
}

class PhotoAgent {
  constructor() {
    this.albumName = null;
    this.albumIndex = 0;
    this.albumFiles = [];
    this.timeout = 0;
    setInterval(_ => {
      this.timeout = Math.max(this.timeout - 1,0);
    },1);
  }
  render() {
    var calculateRatio = this.calculateRatio;
    document.getElementById("pictureName").innerText = decodeURIComponent(this.albumFiles[this.albumIndex]);
    var picture = document.getElementById("picture");
    var img = new Image();
    img.src = replaceAll("#","%23",replaceAll("?","%3F",DATA_LOC + "/" + this.albumName + "/" + this.albumFiles[this.albumIndex]));
    img.onload = function() {
      EXIF.getData(img,function() {
        var orientation = EXIF.getTag(this,"Orientation");
        var rotation = [0,0,180,0,0,90,0,270][orientation - 1] || 0;
        var ratio = calculateRatio(img.width,img.height,window.innerWidth,window.innerHeight);
        picture.src = img.src;
        picture.width = img.width * ratio;
        picture.height = img.height * ratio;
        picture.onload = function() {
          picture.style.transform = `rotate(${rotation}deg)`;
          picture.style.display = "inline";
        }
      });
    }
  }
  calculateRatio(width,height,maxWidth,maxHeight) {
    var modifier;
    if ( width >= maxWidth && height >= maxHeight ) modifier = -0.01;
    else modifier = 0.01;
    for ( var i = 1; i > 0; i += modifier ) {
      if ( modifier == -0.01 && width * i <= maxWidth && height * i <= maxHeight ) return i;
      else if ( modifier == 0.01 && (width * i > maxWidth || height * i > maxHeight) ) return i - 0.01;
    }
    throw new Error("No ratio found");
  }
  eOpenAlbum(album) {
    openPage("photo");
    this.albumName = album;
    this.albumIndex = 0;
    this.albumFiles = fs.readdirSync(DATA_LOC + "/" + album).filter(item => ["jpg","png","gif"].map(jtem => item.toLowerCase().endsWith(jtem) ? "1" : "0").indexOf("1") > -1);
    this.render();
    return this.albumFiles[this.albumIndex];
  }
  eMovePicture(toMove) {
    if ( this.timeout <= 0 ) {
      this.timeout = 100;
      this.albumIndex += toMove;
    }
    var suffix = "";
    if ( this.albumIndex <= -1 ) this.albumIndex = this.albumFiles.length - 1;
    if ( this.albumIndex == 0 && toMove == -1 ) suffix = "_first";
    if ( this.albumIndex + 1 == this.albumFiles.length && toMove == 1 ) suffix = "_last";
    if ( this.albumIndex >= this.albumFiles.length ) this.albumIndex = 0;
    this.render();
    return decodeURIComponent(this.albumFiles[this.albumIndex]) + suffix;
  }
}

class WebAgent {
  constructor() {
    this.url = null;
  }
  render() {
    document.getElementById("webview").loadURL(this.url);
  }
  eOpenURL(url) {
    openPage("web");
    setTimeout(_ => {
      this.url = "http://" + url;
      this.render();
    },50);
  }
}

function openPage(toOpen) {
  var pages = ["queue","photo","web"];
  for ( var i = 0; i < pages.length; i++ ) {
    document.getElementById(pages[i] + "Page").className = "hidden";
  }
  document.getElementById(toOpen + "Page").className = "";
}

function resetAll() {
  ihandlers.openHome();
  ihandlers.setQueue([]);
  ihandlers.playNextSong();
  ihandlers.setVolume(50);
  if ( ! ihandlers.isPlaying() ) ihandlers.togglePlay();
  forceDCONN();
}

function openFolder() {
  shell.openItem(DATA_LOC);
}

/* API Handlers
 * - getQueue √
 * - setQueue √
 * - isPlaying √
 * - togglePlay √
 * - playNextSong √
 * - rewindSong √
 * - getVolume √
 * - setVolume √
 * - openAlbum(album) √
 * - movePicture(toMove) √
 * - openURL(url) √
 * - openHome √
 */

window.onkeypress = function(event) {
  if ( event.code == "KeyD" ) forceDCONN();
  else if ( event.code == "KeyR" ) resetAll();
  else if ( event.code == "KeyO" ) openFolder();
}

window.onload = function() {
  var magent = new MusicAgent();
  var pagent = new PhotoAgent();
  var wagent = new WebAgent();
  ihandlers = {
    getQueue:     magent.eGetQueue.bind(magent),
    setQueue:     magent.eSetQueue.bind(magent),
    isPlaying:    magent.eIsPlaying.bind(magent),
    togglePlay:   magent.eTogglePlay.bind(magent),
    playNextSong: magent.ePlayNextSong.bind(magent),
    rewindSong:   magent.eRewindSong.bind(magent),
    getVolume:    magent.eGetVolume.bind(magent),
    setVolume:    magent.eSetVolume.bind(magent),
    openAlbum:    pagent.eOpenAlbum.bind(pagent),
    movePicture:  pagent.eMovePicture.bind(pagent),
    openURL:      wagent.eOpenURL.bind(wagent),
    openHome:     _ => {
      openPage("queue");
      document.getElementById("picture").style.display = "none";
      magent.render();
    }
  }
  initCommandHandling(ihandlers);
  ihandlers.openHome();
}

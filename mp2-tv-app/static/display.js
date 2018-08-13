var fs = require("fs");
var ihandlers;

class MusicAgent {
  constructor() {
    this.queue = [];
    this.playing = true;
    this.volume = 50;
    this.audio = document.getElementById("audio");
    this.audio.onended = function() {
      this.triggerNextSong(false);
    }.bind(this);
    setInterval(this.updateTimeInfo.bind(this),1000);
  }
  render() {
    if ( this.playing ) document.getElementById("paused").innerText = "";
    else document.getElementById("paused").innerText = "Paused";
    document.getElementById("playing").innerText = this.queue[0] || "Nothing!";
    var list = document.getElementById("queue");
    while ( list.firstChild ) {
      list.removeChild(list.firstChild);
    }
    for ( var i = 1; i < this.queue.length; i++ ) {
      var item = document.createElement("li");
      item.innerText = this.queue[i];
      list.appendChild(item);
    }
  }
  updateTimeInfo() {
    var pad = n => n >= 10 ? n : "0" + n;
    var currentTime = Math.floor(this.audio.currentTime);
    var currentTimeM = this.queue[0] ? Math.floor(currentTime / 60) : "-";
    var currentTimeS = this.queue[0] ? pad(currentTime % 60) : "-";
    var negativeTime = Math.floor(this.audio.duration - this.audio.currentTime);
    var negativeTimeM = this.queue[0] ? "-" + Math.floor(negativeTime / 60) : "-";
    var negativeTimeS = this.queue[0] ? pad(negativeTime % 60) : "--";
    document.getElementById("timeInfo").innerText = `${currentTimeM}:${currentTimeS} | VOL ${pad(this.volume)}% | ${negativeTimeM}:${negativeTimeS}`;
  }
  triggerNextSong(newElements) {
    if ( ! newElements ) this.queue.splice(0,1);
    if ( this.queue[0] ) {
      this.audio.src = __dirname + "/../data/" + this.queue[0];
      this.audio.play();
    } else {
      this.audio.src = "";
      this.audio.pause();
    }
    this.playing = true;
    this.render();
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
}

/* API Handlers
 * - getQueue √
 * - setQueue √
 * - isPlaying √
 * - togglePlay √
 * - openHome
 * - openAlbum(album)
 * - movePicture(toMove)
 * - openURL(url)
 * - playNextSong √
 * - rewindSong
 */

var magent;
window.onload = function() {
  magent = new MusicAgent();
  ihandlers = {
    getQueue:     magent.eGetQueue.bind(magent),
    setQueue:     magent.eSetQueue.bind(magent),
    isPlaying:    magent.eIsPlaying.bind(magent),
    togglePlay:   magent.eTogglePlay.bind(magent),
    playNextSong: magent.ePlayNextSong.bind(magent),
    rewindSong:   magent.eRewindSong.bind(magent)
  }
  magent.render();
  initCommandHandling(ihandlers);
}

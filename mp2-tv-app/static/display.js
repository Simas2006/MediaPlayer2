var fs = require("fs");
var ihandlers;

class MusicAgent {
  constructor() {
    this.queue = [];
    this.playing = true;
    document.getElementById("audio").onended = function() {
      this.triggerNextSong(false);
    }.bind(this);
  }
  render() {
    if ( this.playing ) document.getElementById("paused").innerText = "";
    else document.getElementById("paused").innerText = "Paused";
    document.getElementById("playing").innerText = "Now Playing: " + (this.queue[0] || "Nothing!");
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
  triggerNextSong(newElements) {
    if ( ! newElements ) this.queue.splice(0,1);
    if ( this.queue[0] ) {
      document.getElementById("audio").src = __dirname + "/../data/" + this.queue[0];
      document.getElementById("audio").play();
    } else {
      document.getElementById("audio").src = "";
      document.getElementById("audio").pause();
    }
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
    this.render();
  }
  ePlayNextSong() {
    this.triggerNextSong(false);
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
    playNextSong: magent.ePlayNextSong.bind(magent)
  }
  magent.render();
}

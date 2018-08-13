var fs = require("fs");
var ihandlers;

class MusicAgent {
  constructor() {
    this.queue = "abcdefghijklmnopqrstuvwxyz".split("").map(item => item + "avanese.m4a");
    this.playing = true;
  }
  render() {
    if ( this.playing ) document.getElementById("paused").innerText = "";
    else document.getElementById("paused").innerText = "Paused";
    document.getElementById("playing").innerText = "Now Playing: " + this.queue[0];
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
  eGetQueue() {
    return this.queue;
  }
  eSetQueue(newQueue) {
    this.queue = newQueue;
    this.render();
  }
  eIsPlaying() {
    return this.playing;
  }
  eTogglePlay() {
    this.playing = ! this.playing;
    this.render();
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
 * - playNextSong
 * - rewindSong
 */

window.onload = function() {
  var magent = new MusicAgent();
  ihandlers = {
    getQueue:   magent.eGetQueue.bind(magent),
    setQueue:   magent.eSetQueue.bind(magent),
    isPlaying:  magent.eIsPlaying.bind(magent),
    togglePlay: magent.eTogglePlay.bind(magent)
  }
  magent.render();
}

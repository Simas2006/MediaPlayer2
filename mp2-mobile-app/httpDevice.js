export class HTTPDevice { // mock device ONLY
  constructor() {
    this.connectionID = 91823;
    this.readyTick = 0;
    setInterval(_ => {
      this.readyTick = Math.max(this.readyTick - 1,0);
    },1);
    this._picIndex = 0;
    this._playingState = true;
    this._queue = ["somewhere/song_playing","somewhere/song1","somewhere/song1","somewhere_else/song3"];
  }
  transmit(message,callback) {
    message = message.split(" ");
    if ( message[0] == "LIST" ) {
      callback(["s" + message[1].split("/").join(":"),"folderb","folderc","folderd"]);
    } else if ( message[0] == "TYPE" ) {
      if ( message[1].split("/").length <= 5 ) callback("directory");
      else callback("file");
    } else if ( message[0] == "ADDTQ" && this.readyTick <= 0 ) {
      this.readyTick = 100;
      callback("ok");
    } else if ( message[0] == "OPENP" ) {
      callback("0.JPG");
    } else if ( message[0] == "PREVP" ) {
      this._picIndex--;
      callback(this._picIndex + ".JPG" + (this._picIndex == 0 ? "_first" : ""));
    } else if ( message[0] == "NEXTP" ) {
      this._picIndex++;
      callback(this._picIndex + ".JPG" + (this._picIndex == 10 ? "_last" : ""));
    } else if ( message[0] == "GETQ" ) {
      callback([this._playingState ? "playing" : "paused"].concat(this._queue));
    } else if ( message[0] == "PLYPS" ) {
      this._playingState = ! this._playingState;
      callback("ok");
    } else if ( message[0] == "PNSNG" ) {
      this._queue = this._queue.slice(1);
      callback([this._playingState ? "playing" : "paused"].concat(this._queue));
    } else if ( message[0] == "RWIND" ) {
      callback("ok");
    } else if ( message[0] == "CLRQ" ) {
      this._queue = [];
      callback([this._playingState ? "playing" : "paused"].concat(this._queue));
    } else if ( message[0] == "SHFLQ" ) {
      // doesn't need to be implemented here
      this._queue.push("just/been/shuffled");
      callback([this._playingState ? "playing" : "paused"].concat(this._queue));
    } else if ( message[0] == "UPSQ" ) {
      var index = parseInt(message[1]);
      if ( index <= 1 ) {
        callback([this._playingState ? "playing" : "paused"].concat(this._queue));
      } else {
        var toIndex = message[2] == "true" ? 1 : index - 1
        this._queue.splice(toIndex,0,this._queue.splice(index,1)[0]);
        callback([this._playingState ? "playing" : "paused"].concat(this._queue));
      }
    } else if ( message[0] == "DWNSQ" ) {
      var index = parseInt(message[1]);
      this._queue.splice(index + 1,0,this._queue.splice(index,1)[0]);
      callback([this._playingState ? "playing" : "paused"].concat(this._queue));
    }
  }
}

var fs = require("fs");
var DATA_LOC = __dirname + "/../data";
var lastVolume = 0;

function initCommandHandling(handlers) {
  // launch server around here
  setInterval(function() {
    checkForCommand(handlers);
  },50);
}

function checkForCommand(handlers) {
  fs.readFile(__dirname + "/../server/inputCmd",function(err,data) {
    if ( err ) {
      if ( err.code == "ENOENT" ) return;
      else throw err;
    }
    data = data.toString().trim().split(" ").map(item => decodeURIComponent(item));
    validateCommand(data,function(valid) {
      if ( valid ) {
        parseCommand(data,handlers,function(result) {
          var toWrite;
          if ( result instanceof Object ) toWrite = result.map(item => encodeURIComponent(item)).join(",");
          else toWrite = encodeURIComponent(result);
          if ( result.length == 1 ) toWrite += ",";
          fs.writeFile(__dirname + "/../server/outputCmd",toWrite,function(err) {
            if ( err ) throw err;
          });
        });
      } else {
        fs.writeFile(__dirname + "/../server/outputCmd","error",function(err) {
          if ( err ) throw err;
        });
      }
    });
  });
}

function validateCommand(command,callback) {
  var paramCount = {
    "LIST" : 2,
    "TYPE" : 2,
    "ADDTQ": 4,
    "OPENP": 2,
    "PREVP": 1,
    "NEXTP": 1,
    "HOME" : 1,
    "WOPN" : 2,
    "PLYPS": 1,
    "PNSNG": 1,
    "RWIND": 1,
    "UPVL":  1,
    "DWNVL": 1,
    "MUTVL": 1,
    "GETQ" : 1,
    "UPSQ" : 3,
    "DWNSQ": 2,
    "DELSQ": 2,
    "CLRQ" : 1,
    "SHFLQ": 1
  }
  var commandName = command[0];
  if ( paramCount[commandName] && (paramCount[commandName] == command.length || (paramCount[commandName] == 4 && command.length >= 3)) ) {
    if ( commandName == "LIST" || commandName == "TYPE" || commandName == "OPENP" ) {
      fs.stat(DATA_LOC + "/" + command[1],function(err,stats) {
        if ( err ) {
          if ( err.code == "ENOENT" ) {
            callback(false);
            return;
          } else {
            throw err;
          }
        }
        if ( stats.isDirectory() ) callback(true);
        else callback(false);
      });
    } else if ( commandName == "ADDTQ" ) {
      fs.readdir(DATA_LOC + "/" + command[1],function(err,files) {
        if ( err ) {
          if ( err.code == "ENOENT" || err.code == "ENOTDIR" ) {
            callback(false);
            return;
          } else {
            throw err;
          }
        }
        for ( var i = 2; i < command.length; i++ ) {
          if ( files.indexOf(command[i]) <= -1 ) {
            callback(false);
            return;
          }
        }
        callback(true);
      });
    } else if ( ["UPSQ","DWNSQ","DELSQ"].indexOf(commandName) > -1 ) {
      if ( commandName == "UPSQ" && ["true","false"].indexOf(command[2]) <= -1 ) {
        callback(false);
        return;
      }
      callback(! isNaN(parseInt(command[1])));
    } else {
      callback(true);
    }
  } else {
    callback(false);
  }
}

function parseCommand(command,handlers,callback) {
  var commandName = command[0];
  if ( commandName == "LIST" ) {
    fs.readdir(DATA_LOC + "/" + command[1],function(err,files) {
      if ( err ) throw err;
      callback(files.filter(item => ! item.startsWith(".")));
    });
  } else if ( commandName == "TYPE" ) {
    fs.readdir(DATA_LOC + "/" + command[1],function(err,files) {
      if ( err ) throw err;
      for ( var i = 0; i < files.length; i++ ) {
        if ( files[i].charAt(files[i].length - 4) == "." ) {
          callback("file");
          return;
        }
      }
      callback("directory");
    });
  } else if ( commandName == "ADDTQ" ) {
    var queue = handlers.getQueue();
    queue = queue.concat(command.slice(2).map(item => command[1] + "/" + item));
    handlers.setQueue(queue);
    callback(["ok"]);
  } else if ( commandName == "OPENP" ) {
    callback(handlers.openAlbum(command[1]));
  } else if ( commandName == "PREVP" ) {
    callback(handlers.movePicture(-1));
  } else if ( commandName == "NEXTP" ) {
    callback(handlers.movePicture(1));
  } else if ( commandName == "HOME" ) {
    handlers.openHome();
    callback("ok");
  } else if ( commandName == "WOPN" ) {
    handlers.openURL(command[1]);
    callback("ok");
  } else if ( commandName == "PLYPS" ) {
    handlers.togglePlay();
    callback("ok");
  } else if ( commandName == "PNSNG" ) {
    handlers.playNextSong();
    callback([(handlers.isPlaying() ? "playing" : "paused") + ":" + handlers.getVolume()].concat(handlers.getQueue()));
  } else if ( commandName == "RWIND" ) {
    handlers.rewindSong();
    callback("ok");
  } else if ( commandName == "UPVL" ) {
    var vol = handlers.getVolume();
    vol = Math.min(vol + 5,100);
    handlers.setVolume(vol);
    callback(vol);
  } else if ( commandName == "DWNVL" ) {
    var vol = handlers.getVolume();
    vol = Math.max(vol - 5,0);
    handlers.setVolume(vol);
    callback(vol);
  } else if ( commandName == "MUTVL" ) {
    var vol = handlers.getVolume();
    if ( vol > 0 ) {
      lastVolume = vol;
      vol = 0;
    } else {
      vol = lastVolume;
    }
    handlers.setVolume(vol);
    callback(vol);
  } else if ( commandName == "GETQ" ) {
    callback([(handlers.isPlaying() ? "playing" : "paused") + ":" + handlers.getVolume()].concat(handlers.getQueue()));
  } else if ( commandName == "UPSQ" ) {
    var queue = handlers.getQueue();
    var fromIndex = parseInt(command[1]);
    if ( fromIndex <= 0 || fromIndex >= queue.length ) {
      callback("error");
      return;
    }
    if ( fromIndex == 1 ) {
      callback([(handlers.isPlaying() ? "playing" : "paused") + ":" + handlers.getVolume()].concat(handlers.getQueue()));
      return;
    }
    var toIndex;
    if ( command[2] == "false" ) toIndex = fromIndex - 1;
    else toIndex = 1;
    queue.splice(toIndex,0,queue.splice(fromIndex,1)[0]);
    handlers.setQueue(queue);
    callback([(handlers.isPlaying() ? "playing" : "paused") + ":" + handlers.getVolume()].concat(handlers.getQueue()));
  } else if ( commandName == "DWNSQ" ) {
    var queue = handlers.getQueue();
    var fromIndex = parseInt(command[1]);
    if ( fromIndex <= 0 || fromIndex >= queue.length ) {
      callback("error");
      return;
    }
    var toIndex = fromIndex + 1;
    queue.splice(toIndex,0,queue.splice(fromIndex,1)[0]);
    handlers.setQueue(queue);
    callback([(handlers.isPlaying() ? "playing" : "paused") + ":" + handlers.getVolume()].concat(handlers.getQueue()));
  } else if ( commandName == "DELSQ" ) {
    var queue = handlers.getQueue();
    var index = parseInt(command[1]);
    if ( index <= 0 || index >= queue.length ) {
      callback("error");
      return;
    }
    queue.splice(index,1);
    handlers.setQueue(queue);
    callback([(handlers.isPlaying() ? "playing" : "paused") + ":" + handlers.getVolume()].concat(handlers.getQueue()));
  } else if ( commandName == "CLRQ" ) {
    handlers.setQueue([]);
    handlers.playNextSong();
    callback([(handlers.isPlaying() ? "playing" : "paused") + ":" + handlers.getVolume()].concat(handlers.getQueue()));
  } else if ( commandName == "SHFLQ" ) {
    var queue = handlers.getQueue().slice(1);
    for ( var i = 0; i < queue.length; i++ ) {
      var rand = Math.floor(Math.random() * (i + 1));
      var temp = queue[i];
      queue[i] = queue[rand];
      queue[rand] = temp;
    }
    handlers.setQueue([handlers.getQueue()[0]].concat(queue));
    callback([(handlers.isPlaying() ? "playing" : "paused") + ":" + handlers.getVolume()].concat(handlers.getQueue()));
  } else {
    callback("error");
  }
}

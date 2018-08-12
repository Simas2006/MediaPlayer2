var fs = require("fs");
var DATA_LOC = __dirname + "/../data";

function initCommandHandling(handlers) {
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
    data = data.toString().trim().split(" ");
    var textToWrite;
    callback(command,function(valid) {
      if ( valid ) {
        parseCommand(data,handlers,function(toWrite) {
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
    "GETQ" : 1,
    "UPSQ" : 3,
    "DWNSQ": 2,
    "DELSQ": 2,
    "CLRQ" : 1,
    "SHFLQ": 1
  }
  var commandName = command[0];
  if ( paramCount[commandName] && (paramCount[commandName] == command.length || (paramCount[commandName] == 4 && command.length >= 4)) ) {
    command = command.map(item => decodeURIComponent(item));
    if ( commandName == "LIST" || commandName == "TYPE" ) {
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
    }
  } else {
    callback(false);
  }
}

function parseCommand(command,handlers,callback) {

}

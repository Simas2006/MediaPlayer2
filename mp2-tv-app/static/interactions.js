var fs = require("fs");

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
    "LIST" : 1,
    "TYPE" : 1,
    "ADDTQ": 3,
    "OPENP": 1,
    "PREVP": 0,
    "NEXTP": 0,
    "HOME" : 0,
    "WOPN" : 1,
    "PLYPS": 0,
    "PNSNG": 0,
    "RWIND": 0,
    "GETQ" : 0,
    "UPSQ" : 2,
    "DWNSQ": 1,
    "DELSQ": 1,
    "CLRQ" : 0,
    "SHFLQ": 0
  }
  if ( paramCount[command[0]] != command.length - 1 && paramCount[command[0]] != 3 ) {
    console.log("NO");
  }
}

function parseCommand(command,handlers,callback) {

}

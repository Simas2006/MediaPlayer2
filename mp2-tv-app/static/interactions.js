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
    data = data.toString().trim();
    var textToWrite;
    if ( validateCommand(data) ) {
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
}

function validateCommand(command) {

}

function parseCommand(command,handlers,callback) {
  
}

#!/usr/local/bin/node

var fs = require("fs");
var CryptoJS = require("crypto-js");
var express = require("express");
var app = express();
var LOCAL_DIR = process.env.APPDATA || (process.platform == "darwin" ? process.env.HOME + "/Library/Application Support/MediaPlayer2" : "/var/local");
var SERVER_LOC = LOCAL_DIR + "/ServerData";
var PASSWORD = fs.readFileSync(LOCAL_DIR + "/ServerPassword").toString().trim();
var PORT = 5600;
var AUTH_KEY = null;

var COMMANDS = [ // excluding CONN & DCONN
  "LIST",
  "TYPE",
  "PING",
  "ADDTQ",
  "OPENP",
  "PREVP",
  "NEXTP",
  "HOME",
  "WOPN",
  "PLYPS",
  "PNSNG",
  "RWIND",
  "UPVL",
  "DWNVL",
  "MUTVL",
  "GETQ",
  "UPSQ",
  "DWNSQ",
  "DELSQ",
  "CLRQ",
  "SHFLQ"
];

class Cryptographer {
  encrypt(message,key) {
    key = CryptoJS.enc.Base64.parse(key);
    var iv = CryptoJS.lib.WordArray.random(32);
    var encrypted = CryptoJS.AES.encrypt(
      message.toString(CryptoJS.enc.Base64),
      key,
      {iv}
    );
    return [
      encrypted.ciphertext.toString(CryptoJS.enc.Base64),
      iv.toString(CryptoJS.enc.Base64)
    ].join(":");
  }
  decrypt(message,key) {
    try {
      key = CryptoJS.enc.Base64.parse(key);
      var decrypted = CryptoJS.AES.decrypt(
        message.split(":")[0],
        key,
        {iv: CryptoJS.enc.Base64.parse(message.split(":")[1])}
      );
      return decrypted.toString(CryptoJS.enc.Utf8);
    } catch ( err ) {
      return "decrypt-failed";
    }
  }
  generateKey(passphrase) {
    if ( passphrase ) return passphrase + "/".repeat(32 - passphrase.length);
    else return CryptoJS.lib.WordArray.random(32).toString(CryptoJS.enc.Base64);
  }
}

app.post("/receive",function(request,response) {
  var data = "";
  request.on("data",function(chunk) {
    data += chunk;
  });
  request.on("end",function() {
    var cg = new Cryptographer();
    if ( data.startsWith("CONN ") ) {
      var checkText = data.split(" ")[1];
      var key = cg.generateKey(PASSWORD);
      var result = cg.decrypt(checkText,key);
      if ( result == "mp2-authentication" && ! AUTH_KEY ) {
        AUTH_KEY = cg.generateKey();
        var toSend = `ok ${cg.encrypt(AUTH_KEY,key)}`;
        response.send(toSend);
        fs.writeFile(SERVER_LOC + "/connect","conn",function(err) {
          if ( err ) throw err;
        });
      } else {
        response.send("error");
      }
    } else {
      var text = cg.decrypt(data,AUTH_KEY);
      if ( text == "decrypt-failed" || text.indexOf("..") > -1 ) {
        response.send("error");
      } else {
        text = text.split(" ");
        if ( text[0] == "DCONN" ) {
          AUTH_KEY = null;
          response.send("ok");
          fs.unlink(SERVER_LOC + "/connect",function(err) {
            if ( err ) throw err;
          });
        } else if ( COMMANDS.indexOf(text[0]) <= -1 ) {
          response.send("error");
        } else {
          if ( text[0] == "PING" ) {
            response.send("ok");
            return;
          }
          fs.unlink(SERVER_LOC + "/outputCmd",function(err) {
            if ( err && err.code != "ENOENT" ) throw err;
            fs.writeFile(SERVER_LOC + "/inputCmd",text.join(" "),function(err) {
              if ( err ) throw err;
              var interval = setInterval(function() {
                fs.readFile(SERVER_LOC + "/outputCmd",function(err,data) {
                  if ( err ) {
                    if ( err.code == "ENOENT" ) return;
                    else throw err;
                  }
                  fs.unlink(SERVER_LOC + "/outputCmd",function(err) {
                    if ( err && err.code != "ENOENT" ) throw err;
                    fs.unlink(SERVER_LOC + "/inputCmd",function(err) {
                      if ( err && err.code != "ENOENT" ) throw err;
                      data = data.toString().trim();
                      if ( data == "ok" || data == "error" ) response.send(data);
                      else response.send(cg.encrypt(data,AUTH_KEY));
                    });
                  });
                  clearInterval(interval);
                });
              },150);
            });
          });
        }
      }
    }
  });
});

app.get("/blank",function(request,response) {
  response.send("hi");
});

function checkForForceDCONN() {
  fs.readFile(SERVER_LOC + "/connect",function(err,data) {
    if ( err ) {
      if ( err.code == "ENOENT" ) return;
      else throw err;
    }
    if ( data.toString().trim() == "dconn" ) {
      AUTH_KEY = null;
      fs.unlink(SERVER_LOC + "/connect",function(err) {
        if ( err ) throw err;
      });
    }
  });
}

function checkForShutdown() {
  fs.stat(SERVER_LOC + "/shutdown",function(err) {
    if ( err ) {
      if ( err.code == "ENOENT" ) return;
      else throw err;
    }
    AUTH_KEY = null;
    setTimeout(function() {
      fs.unlink(SERVER_LOC + "/shutdown",function(err) {
        if ( err && err.code != "ENOENT" ) throw err;
        fs.unlink(SERVER_LOC + "/inputCmd",function(err) {
          if ( err && err.code != "ENOENT" ) throw err;
          fs.unlink(SERVER_LOC + "/outputCmd",function(err) {
            if ( err && err.code != "ENOENT" ) throw err;
            fs.unlink(SERVER_LOC + "/connect",function(err) {
              if ( err && err.code != "ENOENT" ) throw err;
              process.exit();
            });
          });
        });
      });
    },1500);
  });
}

app.listen(PORT,function() {
  setInterval(function() {
    checkForForceDCONN();
    checkForShutdown();
  },1500);
  console.log("Listening on port " + PORT);
});

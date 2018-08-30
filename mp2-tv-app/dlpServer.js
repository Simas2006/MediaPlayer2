#!/usr/local/bin/node

var fs = require("fs");
var crypto = require("crypto");
var archiver = require("archiver");
var express = require("express");
var app = express();
var LOCAL_DIR = process.env.APPDATA || (process.platform == "darwin" ? process.env.HOME + "/Library/Application Support/MediaPlayer2" : "/var/local");
var PHOTO_LOC = LOCAL_DIR + "/LocalData/photos";
var PASSWORD = fs.readFileSync(LOCAL_DIR + "/ServerPassword").toString().trim();
var PORT = 5601;
var ivs = {};

class Cryptographer {
  encrypt(text,key) {
    key = "/".repeat(32 - key.length) + key;
    var iv = crypto.randomBytes(16);
    var cipher = crypto.createCipheriv("aes-256-cbc",new Buffer(key),iv);
    var encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted,cipher.final()]);
    return encrypted.toString("hex") + ":" + iv.toString("hex");
  }
  decrypt(text,key) {
    try {
      key = "/".repeat(32 - key.length) + key;
      text = text.toString().split(":");
      var iv = new Buffer(text.pop(),"hex");
      var encrypted = new Buffer(text.join(":"),"hex");
      var decipher = crypto.createDecipheriv("aes-256-cbc",new Buffer(key),iv);
      var decrypted = decipher.update(encrypted);
      decrypted = Buffer.concat([decrypted,decipher.final()]);
      return decrypted.toString();
    } catch ( err ) {
      return "decrypt-failed";
    }
  }
}

function walkDir(path,callback) {
  var results = [];
  fs.readdir(path,function(err,files) {
    if ( err ) throw err;
    var i = 0;
    files = files.filter(item => ! item.startsWith("."));
    function loop() {
      if ( i >= files.length ) {
        callback(results);
        return;
      }
      var file = files[i];
      var fullPath = path + "/" + file;
      var lpath = fullPath.toLowerCase();
      fs.stat(fullPath,function(err,stat) {
        if ( err ) throw err;
        i++;
        if ( stat && stat.isDirectory() ) {
          walkDir(fullPath,function(output) {
            results = results.concat(output);
            loop();
          });
        } else {
          if ( lpath.endsWith(".jpg") || lpath.endsWith(".png") || lpath.endsWith(".gif") ) results.push(fullPath);
          loop();
        }
      });
    }
    loop();
  });
}

app.post("/receive",function(request,response) {
  var data = "";
  request.on("data",function(chunk) {
    data += chunk;
  });
  request.on("end",function() {
    var cg = new Cryptographer();
    var message = cg.decrypt(data,PASSWORD).split(" ").map(item => decodeURIComponent(item));
    if ( message[0] == "decrypt-failed" ) {
      response.send("error");
    } else {
      if ( message[0] == "PING" ) {
        response.send("ok");
      } else if ( message[0] == "LIST" ) {
        fs.readdir(PHOTO_LOC,function(err,files) {
          if ( err ) throw err;
          response.send(files.filter(item => ! item.startsWith(".")).map(item => encodeURIComponent(item)).join(","));
        });
      } else if ( message[0] == "INTDL" ) {
        fs.readdir(PHOTO_LOC,function(err,files) {
          if ( err ) throw err;
          files = files.filter(item => ! item.startsWith("."));
          if ( files.indexOf(message[1]) <= -1 ) {
            response.send("error");
            return;
          }
          var id = Math.floor(Math.random() * 1e9);
          ivs[id.toString()] = {
            iv: crypto.randomBytes(16),
            dir: message[1]
          }
          response.send(cg.encrypt(id + "," + ivs[id].iv.toString("base64"),PASSWORD));
        });
      } else if ( message[0] == "DWNLD" ) {
        if ( ! ivs[message[1]] ) {
          response.send("error");
          return;
        }
        var cipher = crypto.createCipheriv("aes-256-cbc",new Buffer("/".repeat(32 - PASSWORD.length) + PASSWORD),ivs[message[1]].iv);
        var archive = archiver("zip",{zlib: 9});
        archive.on("warning",function(err) {
          throw err;
        });
        archive.on("error",function(err) {
          throw err;
        });
        archive.pipe(cipher);
        cipher.pipe(response);
        walkDir(PHOTO_LOC + "/" + ivs[message[1]].dir,function(results) {
          for ( var i = 0; i < results.length; i++ ) {
            var trimmedName = results[i].replace(PHOTO_LOC + "/" + ivs[message[1]].dir + "/","");
            archive.file(results[i],{name: trimmedName});
          }
          archive.finalize();
          ivs[message[1]] = null;
        });
      }
    }
  });
});

app.get("/blank",function(request,response) {
  response.send("hi");
});

app.listen(PORT,function() {
  console.log("Listening on port " + PORT);
});

var fs = require("fs");
var crypto = require("crypto");
var express = require("express");
var app = express();
var PASSWORD = process.argv[2];
var PORT = process.argv[3] || 5601;
var LOCAL_DIR = process.env.APPDATA || (process.platform == "darwin" ? process.env.HOME + "/Library/Application Support/MediaPlayer2" : "/var/local");
var PHOTO_LOC = LOCAL_DIR + "/LocalData/photos";

if ( ! PASSWORD ) throw new Error("No password provided");

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

app.post("/receive",function(request,response) {
  var data = "";
  request.on("data",function(chunk) {
    data += chunk;
  });
  request.on("end",function() {
    var cg = new Cryptographer();
    var message = cg.decrypt(data,PASSWORD).split(" ");
    if ( message[0] == "decrypt-failed" ) {
      response.send("error");
    } else {
      if ( message[0] == "LIST" ) {
        fs.readdir(PHOTO_LOC,function(err,files) {
          if ( err ) throw err;
          response.send(files.filter(item => ! item.startsWith(".")).map(item => encodeURIComponent(item)).join(","));
        });
      }
    }
  });
});

app.get("/blank",function(request,response) {
  response.send("hi");
})

app.listen(PORT,function() {
  console.log("Listening on port " + PORT);
  var cg = new Cryptographer();
  console.log(cg.encrypt("LIST",PASSWORD));
});

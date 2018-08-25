var fs = require("fs");
var crypto = require("crypto");
var express = require("express");
var app = express();
var PORT = process.argv[2] || 5601;

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

app.get("/receive",function(request,response) {
  var cg = new Cryptographer();
  response.send(cg.decrypt("c072ed11edef1424f041baff6f321f2a89f0d19f17772fbd7aa98189f7e4742a15342c60a939788415870f0c1549ac73:055a1a8db7de1029d8c6b21bd61d2b9e","sagebeige"));
});

app.get("/blank",function(request,response) {
  response.send("hi");
})

app.listen(PORT,function() {
  console.log("Listening on port " + PORT);
});

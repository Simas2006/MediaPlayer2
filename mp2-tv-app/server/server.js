var fs = require("fs");
var CryptoJS = require("crypto-js");
var express = require("express");
var app = express();
var PORT = process.argv[2] || 5600;

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
    key = CryptoJS.enc.Base64.parse(key);
    var decrypted = CryptoJS.AES.decrypt(
      message.split(":")[0],
      key,
      {iv: CryptoJS.enc.Base64.parse(message.split(":")[1])}
    );
    return decrypted.toString(CryptoJS.enc.Utf8);
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
    // TODO
  });
});

app.get("/blank",function(request,response) {
  response.writeHead(200);
  response.write("");
  response.end();
});

app.listen(PORT,function() {
  console.log("Listening on port " + PORT);
});

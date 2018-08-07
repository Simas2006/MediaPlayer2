var fs = require("fs");
var CryptoJS = require("crypto-js");
var express = require("express");
var app = express();
var PASSWORD = process.argv[2];
var PORT = process.argv[3] || 5600;
var AUTH_KEY = null;

var COMMANDS = [ // excluding CONN
  "DCONN",
  "LIST",
  "TYPE",
  "ADDTQ",
  "OPENP",
  "PREVP",
  "NEXTP",
  "HOME",
  "WOPN",
  "PLYPS",
  "PNSNG",
  "RWIND",
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

AUTH_KEY = new Cryptographer().generateKey("havanese");

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
      } else {
        response.send("error");
      }
    } else {
      var text = cg.decrypt(data,AUTH_KEY);
      if ( text == "decrypt-failed" ) {
        response.send("error");
      } else {
        text = text.split(" ");
        if ( COMMANDS.indexOf(text[0]) <= -1 ) {
          response.send("error");
        } else {
          fs.unlink(__dirname + "/outputCmd",function(err) {
            if ( err && err.code != "ENOENT" ) throw err;
            fs.writeFile(__dirname + "/inputCmd",text.join(" "),function(err) {
              if ( err ) throw err;
            });
          });
        }
      }
    }
  });
});

app.get("/blank",function(request,response) {
  response.send("");
});

app.listen(PORT,function() {
  console.log("Listening on port " + PORT);
  var cg = new Cryptographer();
  console.log(cg.encrypt("LIST /music/havanese",AUTH_KEY));
});

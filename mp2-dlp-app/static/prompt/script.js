var fs = require("fs");
var rcrypto = require("crypto");
var request = require("request");
var LOCAL_DIR = process.env.APPDATA || (process.platform == "darwin" ? process.env.HOME + "/Library/Application Support/MediaPlayer2-dlp" : "/var/local");

class Cryptographer {
  encrypt(text,key) {
    key = "/".repeat(32 - key.length) + key;
    var iv = rcrypto.randomBytes(16);
    var cipher = rcrypto.createCipheriv("aes-256-cbc",new Buffer(key),iv);
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
      var decipher = rcrypto.createDecipheriv("aes-256-cbc",new Buffer(key),iv);
      var decrypted = decipher.update(encrypted);
      decrypted = Buffer.concat([decrypted,decipher.final()]);
      return decrypted.toString();
    } catch ( err ) {
      return "decrypt-failed";
    }
  }
}

function initializeData() {
  var cg = new Cryptographer();
  var address = document.getElementById("address").value;
  var password = document.getElementById("password").value;
  request({
    method: "POST",
    uri: `http://${address}:5601/receive`,
    body: cg.encrypt("PING",password)
  },function(err,response,body) {
    if ( ! err && body != "error" ) {
      var obj = {
        url: address,
        password: password
      }
      fs.mkdir(LOCAL_DIR,function(err) {
        if ( err && err.code != "EEXIST" ) throw err;
        fs.writeFile(LOCAL_DIR + "/ConnectData.json",JSON.stringify(obj),function(err) {
          if ( err ) throw err;
          fs.mkdir(LOCAL_DIR + "/LocalData",function(err) {
            if ( err && err.code != "EEXIST" ) throw err;
            location.href = __dirname + "/../index.html";
          });
        });
      });
    } else {
      alert("Incorrect address or password. Please try again.");
    }
  });
}

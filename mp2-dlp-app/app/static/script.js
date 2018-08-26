var fs = require("fs");
var rcrypto = require("crypto");
var request = require("request");
var decompress = require("decompress");
var PASSWORD = "password";

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

function downloadAlbum(album,callback) {
  var cg = new Cryptographer();
  request({
    method: "POST",
    uri: "http://localhost:5601/receive",
    body: cg.encrypt("INTDL " + encodeURIComponent(album),PASSWORD)
  },function(err,response,body) {
    if ( err ) throw err;
    if ( body != "error" ) {
      body = cg.decrypt(body,PASSWORD).split(",");
      var writer = fs.createWriteStream(__dirname + "/../output.zip");
      var cipher = rcrypto.createDecipheriv("aes-256-cbc",new Buffer("/".repeat(32 - PASSWORD.length) + PASSWORD),Buffer.from(body[1],"base64"));
      request({
        method: "POST",
        uri: "http://localhost:5601/receive",
        body: cg.encrypt("DWNLD " + body[0],PASSWORD)
      }).pipe(cipher).pipe(writer);
      writer.on("finish",function() {
        decompress(__dirname + "/../output.zip",__dirname + "/../output").then(function() {
          callback(true);
        });
      });
    } else {
      callback(false);
    }
  });
}

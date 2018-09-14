var fs = require("fs");
var rcrypto = require("crypto");
var request = require("request");
var {spawn} = require("child_process");
var URL,PASSWORD;
var LOCAL_DIR = process.env.APPDATA || (process.platform == "darwin" ? process.env.HOME + "/Library/Application Support/MediaPlayer2-dlp" : "/var/local");
var DATA_LOC = LOCAL_DIR + "/LocalData";
var unzipProc;

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
    uri: `http://${URL}:5601/receive`,
    body: cg.encrypt("INTDL " + encodeURIComponent(album),PASSWORD)
  },function(err,response,body) {
    if ( err ) throw err;
    if ( body != "error" ) {
      body = cg.decrypt(body,PASSWORD).split(",");
      var writer = fs.createWriteStream(LOCAL_DIR + "/temp.zip");
      writer.on("open",function() {
        var cipher = rcrypto.createDecipheriv("aes-256-cbc",new Buffer("/".repeat(32 - PASSWORD.length) + PASSWORD),Buffer.from(body[1],"base64"));
        request({
          method: "POST",
          uri: `http://${URL}:5601/receive`,
          body: cg.encrypt("DWNLD " + body[0],PASSWORD)
        }).pipe(cipher).pipe(writer);
        writer.on("finish",function() {
          unzipProc = spawn("unzip",[LOCAL_DIR + "/temp.zip","-d",DATA_LOC + "/" + album]);
          unzipProc.stdout.on("data",function(data) {
            // needs to be here
          });
          unzipProc.stderr.on("data",function(data) {
            console.log("ERROR: ",data.toString());
          });
          unzipProc.on("close",function(code) {
            unzipProc = null;
            callback(true);
          });
        });
      });
    } else {
      callback(false);
    }
  });
}

function listRemoteAlbums(callback) {
  var cg = new Cryptographer();
  request({
    method: "POST",
    uri: `http://${URL}:5601/receive`,
    body: cg.encrypt("LIST",PASSWORD)
  },function(err,response,body) {
    if ( err || body == "error" ) {
      callback(null);
      if ( err ) throw err;
      else throw new Error("Invalid password");
    }
    callback(body.split(",").map(item => decodeURIComponent(item)));
  });
}

function initConnection(callback) {
  fs.readFile(LOCAL_DIR + "/ConnectData.json",function(err,data) {
    if ( err ) throw err;
    data = JSON.parse(data.toString());
    URL = data.url;
    PASSWORD = data.password;
    callback();
  });
}

var fs = require("fs");
var rcrypto = require("crypto");
var request = require("request");
var LOCAL_DIR = process.env.APPDATA || (process.platform == "darwin" ? process.env.HOME + "/Library/Application Support/MediaPlayer2-dlp" : "/var/local");
var language = require("../lang/language")(localStorage.getItem("lang") || "en-us");

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
        password: password,
        lang: (localStorage.getItem("lang") || "en-us")
      }
      localStorage.removeItem("lang");
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
      alert(language.prompt.invalid);
    }
  });
}

function initSelectBox() {
  var language = document.getElementById("language");
  fs.readdir(__dirname + "/../lang",function(err,files) {
    if ( err ) throw err;
    var files = files.filter(item => item.endsWith(".json"));
    var names = files
      .map(item => JSON.parse(fs.readFileSync(__dirname + "/../lang/" + item).toString()))
      .map(item => item.name);
    files = files.map(item => item.slice(0,-5));
    for ( var i = 0; i < names.length; i++ ) {
      var option = document.createElement("option");
      option.innerText = names[i];
      option.value = files[i];
      language.appendChild(option);
    }
    language.onchange = function() {
      localStorage.setItem("lang",this.value);
      location.reload();
    }
    language.value = localStorage.getItem("lang") || "en-us";
  });
}

window.onload = function() {
  document.getElementById("welcomeText").innerText = language.prompt.welcome;
  document.getElementById("languageText").innerText = language.prompt.language + ": ";
  document.getElementById("address").placeholder = language.prompt.address;
  document.getElementById("password").placeholder = language.prompt.password;
  document.getElementById("connButton").innerText = language.prompt.connect;
  initSelectBox();
}

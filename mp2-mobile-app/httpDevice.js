import CryptoJS from 'crypto-js'

const IP_PREFIX = "10.0.1.";
const PORT      = 5600;

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

export default class HTTPDevice {
  constructor() {
    this.connectionID = null;
    this.address = null;
    this.authKey = null;
    this.readyTick = 0;
    setInterval(_ => {
      this.readyTick = Math.max(this.readyTick - 1,0);
    },1);
  }
  transmit(message,callback,rawMode) {
    var cg = new Cryptographer();
    var req = new XMLHttpRequest();
    req.open("POST",`http://${this.address}/receive`);
    var authKey = this.authKey;
    req.onload = function() {
      if ( rawMode ) {
        callback(this.responseText);
      } else {
        if ( this.responseText == "ok" || this.responseText == "error" ) {
          callback(this.responseText);
        } else {
          var plaintext = cg.decrypt(this.responseText,authKey);
          if ( plaintext.split(",").length > 1 || plaintext == "playing" || plaintext == "paused" ) callback(plaintext.split(","));
          else callback(plaintext);
        }
      }
    }
    if ( rawMode ) req.send(message);
    else req.send(cg.encrypt(message,this.authKey));
  }
  connect(id,password,callback) {
    if ( ! id || ! password ) {
      callback(false);
      return;
    }
    this.address = `${IP_PREFIX}${id}:${PORT}`;
    var cg = new Cryptographer();
    var encrypted = cg.encrypt("mp2-authentication",cg.generateKey(password));
    this.transmit("CONN " + encrypted,output => {
      if ( output == "error" ) {
        callback(false);
      } else {
        this.authKey = cg.decrypt(output.split(" ")[1],cg.generateKey(password));
        this.connectionID = Math.floor(Math.random() * 100000);
        this.connectionID = "0".repeat(5 - this.connectionID.toString().length) + this.connectionID;
        callback(true);
      }
    },true);
  }
  disconnect(callback) {
    this.transmit("DCONN",_ => {
      this.connectionID = null;
      this.address = null;
      this.authKey = null;
      callback();
    });
  }
}

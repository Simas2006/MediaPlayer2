var fs = require("fs");
var LOCAL_DIR = process.env.APPDATA || (process.platform == "darwin" ? process.env.HOME + "/Library/Application Support/MediaPlayer2-dlp" : "/var/local");

module.exports = function(langOverride) {
  var connData = langOverride ? {lang: langOverride} : JSON.parse(fs.readFileSync(LOCAL_DIR + "/ConnectData.json").toString().trim());
  var langData = JSON.parse(fs.readFileSync(__dirname + "/" + connData.lang + ".json").toString().trim());
  return langData;
}

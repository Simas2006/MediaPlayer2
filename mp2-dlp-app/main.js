var {app,BrowserWindow,ipcMain} = require("electron");
var fs = require("fs");
var LOCAL_DIR = process.env.APPDATA || (process.platform == "darwin" ? process.env.HOME + "/Library/Application Support/MediaPlayer2-dlp" : "/var/local");
var window,downloadWindow;

function replaceAll(oldChar,newChar,string) {
  return string.split(oldChar).join(newChar);
}

function createWindow() {
  var size = require("electron").screen.getPrimaryDisplay().size;
  window = new BrowserWindow({
    width: size.width,
    height: size.height
  });
  //window.webContents.openDevTools();
  window.on("closed",function() {
    window = null;
  });
  fs.stat(LOCAL_DIR + "/ConnectData.json",function(err) {
    var subText = "";
    if ( err ) {
      if ( err.code == "ENOENT" ) subText = "prompt/";
      else throw err;
    }
    window.loadURL(`file://${__dirname}/static/${subText}index.html`);
  });
  ipcMain.on("openDownload",function(event,album) {
    downloadWindow = new BrowserWindow({
      width: 500,
      height: 500
    });
    downloadWindow.on("closed",function() {
      downloadWindow = null;
    });
    downloadWindow.loadURL(`file://${__dirname}/static/download/index.html?${replaceAll("#","%23",replaceAll("?","%3F",album))}`);
  });
  ipcMain.on("closeDownload",function(event) {
    downloadWindow.close();
  });
}

app.on("ready",createWindow);

app.on("window-all-closed",function() {
  if ( process.platform == "darwin" ) {
    app.quit();
  }
});

app.on("activate",function() {
  if ( ! window ) {
    createWindow();
  }
});

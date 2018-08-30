var {app,BrowserWindow,ipcMain} = require("electron");
var fs = require("fs");
var LOCAL_DIR = process.env.APPDATA || (process.platform == "darwin" ? process.env.HOME + "/Library/Application Support/MediaPlayer2" : "/var/local");
var window,downloadWindow;

function createWindow() {
  var size = require("electron").screen.getPrimaryDisplay().size;
  window = new BrowserWindow({
    width: size.width,
    height: size.height
  });
  window.webContents.openDevTools();
  window.on("closed",function() {
    window = null;
  });
  window.loadURL(`file://${__dirname}/static/index.html`);
  ipcMain.on("openDownload",function(event,album) {
    downloadWindow = new BrowserWindow({
      width: 500,
      height: 500
    });
    downloadWindow.on("closed",function() {
      downloadWindow = null;
    });
    downloadWindow.loadURL(`file://${__dirname}/static/download/index.html?${album}`);
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

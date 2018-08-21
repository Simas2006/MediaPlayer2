var {app,BrowserWindow,globalShortcut,Menu} = require("electron");
var fs = require("fs");
var LOCAL_DIR = process.env.APPDATA || (process.platform == "darwin" ? process.env.HOME + "/Library/Application Support/MediaPlayer2" : "/var/local");
var window;

function createWindow() {
  var size = require("electron").screen.getPrimaryDisplay().size;
  window = new BrowserWindow({
    width: size.width,
    height: size.height,
    nodeIntegration: "iframe",
    webPreferences: {
      webSecurity: false
    }
  });
  //window.webContents.openDevTools();
  window.on("closed",function() {
    window = null;
  });
  fs.stat(LOCAL_DIR + "/ServerPassword",function(err) {
    var path = "index";
    if ( err ) {
      if ( err.code == "ENOENT" ) path = "prompt";
      else throw err;
    }
    window.loadURL(`file://${__dirname}/static/${path}.html`);
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

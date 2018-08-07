var {app,BrowserWindow,globalShortcut,Menu} = require("electron");
var fs = require("fs");
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
  window.loadURL(`file://${__dirname}/static/index.html`);
  window.webContents.openDevTools();
  window.on("closed",function() {
    window = null;
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

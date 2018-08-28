var {ipcRenderer} = require("electron");
var LOCAL_DIR = process.env.APPDATA || (process.platform == "darwin" ? process.env.HOME + "/Library/Application Support/MediaPlayer2-dlp" : "/var/local");
var DATA_LOC = LOCAL_DIR + "/LocalData";
var hasLoaded = false;
var folderPath = [];

function drawDownloadPage() {
  if ( ! hasLoaded ) {
    document.getElementById("topText").innerText = "Status: Loading...";
    hasLoaded = true;
  }
  var localObj = document.getElementById("localAlbums");
  while ( localObj.firstChild ) {
    localObj.removeChild(localObj.firstChild);
  }
  fs.readdir(DATA_LOC,function(err,llist) {
    if ( err ) throw err;
    llist = llist.filter(item => ! item.startsWith("."));
    for ( var i = 0; i < llist.length; i++ ) {
      var li = document.createElement("li");
      var button = document.createElement("button");
      button.innerText = llist[i];
      button["data-index"] = i;
      button.onclick = function() {
        folderPath.push(llist[button["data-index"]]);
        drawNavigationPage();
        openPage("navigation");
      }
      li.appendChild(button);
      localObj.appendChild(li);
    }
    var remoteObj = document.getElementById("remoteAlbums");
    while ( remoteObj.firstChild ) {
      remoteObj.removeChild(remoteObj.firstChild);
    }
    listRemoteAlbums(function(rlist) {
      if ( rlist ) {
        document.getElementById("topText").innerText = "Status: Connected";
      } else {
        document.getElementById("topText").innerText = "Status: Unable to Connect";
        return;
      }
      rlist = rlist.filter(item => llist.indexOf(item) <= -1);
      for ( var i = 0; i < rlist.length; i++ ) {
        var li = document.createElement("li");
        var button = document.createElement("button");
        button.innerText = rlist[i] + " ⏏️";
        button["data-index"] = i;
        button.onclick = function() {
          ipcRenderer.send("openDownload",rlist[this["data-index"]]);
          downloadAlbum(rlist[this["data-index"]],function(valid) {
            if ( valid ) {
              ipcRenderer.send("closeDownload");
              drawDownloadPage();
            }
          });
        }
        li.appendChild(button);
        remoteObj.appendChild(li);
      }
    });
  });
}

function drawNavigationPage() {
  var folderObj = document.getElementById("folderList");
  while ( folderObj.firstChild ) {
    folderObj.removeChild(folderObj.firstChild);
  }
  fs.readdir(DATA_LOC + "/" + folderPath.join("/"),function(err,files) {
    if ( err ) throw err;
    files = files.filter(item => ! item.startsWith("."));
    for ( var i = 0; i < files.length; i++ ) {
      if ( files[i].charAt(files[i].length - 4) == "." ) {
        openPage("photo");
        return;
      }
    }
    document.getElementById("topText").innerText = "Album: " + folderPath.join("/");
    for ( var i = 0; i < files.length; i++ ) {
      var li = document.createElement("li");
      var button = document.createElement("button");
      button.innerText = files[i];
      button["data-index"] = i;
      button.onclick = function() {
        folderPath.push(files[this["data-index"]]);
        drawNavigationPage();
      }
      li.appendChild(button);
      folderObj.appendChild(li);
    }
  });
}

function moveBackPage() {
  folderPath.pop();
  if ( folderPath.length > 0 ) {
    drawNavigationPage();
    openPage("navigation");
  } else {
    drawDownloadPage();
    openPage("download");
  }
}

function openPage(toOpen) {
  var pages = ["download","navigation"];
  for ( var i = 0; i < pages.length; i++ ) {
    document.getElementById(pages[i] + "Page").className = "hidden";
  }
  document.getElementById(toOpen + "Page").className = "";
}

window.onload = function() {
  openPage("download");
  drawDownloadPage();
}

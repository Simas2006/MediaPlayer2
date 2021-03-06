var {ipcRenderer} = require("electron");
var EXIF = require("exif-js");
var LOCAL_DIR = process.env.APPDATA || (process.platform == "darwin" ? process.env.HOME + "/Library/Application Support/MediaPlayer2-dlp" : "/var/local");
var DATA_LOC = LOCAL_DIR + "/LocalData";
var language = require("./lang/language")();
var currentPage;
var hasLoaded = false;
var folderPath = [];
var pictureIndex = 0;

function replaceAll(oldChar,newChar,string) {
  return string.split(oldChar).join(newChar);
}

function drawDownloadPage() {
  if ( ! hasLoaded ) {
    document.getElementById("topText").innerText = language.status.loading;
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
        folderPath.push(llist[this["data-index"]]);
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
        document.getElementById("topText").innerText = language.status.success;
      } else {
        document.getElementById("topText").innerText = language.status.fail;
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
        drawPhotoPage();
        openPage("photo");
        return;
      }
    }
    document.getElementById("topText").innerText = language.album + ": " + folderPath.join("/");
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

function drawPhotoPage() {
  function calculateRatio(width,height,maxWidth,maxHeight) {
    var modifier;
    if ( width >= maxWidth && height >= maxHeight ) modifier = -0.01;
    else modifier = 0.01;
    for ( var i = 1; i > 0; i += modifier ) {
      if ( modifier == -0.01 && width * i <= maxWidth && height * i <= maxHeight ) return i;
      else if ( modifier == 0.01 && (width * i > maxWidth || height * i > maxHeight) ) return i - 0.01;
    }
    throw new Error("No ratio found");
  }
  fs.readdir(DATA_LOC + "/" + folderPath.join("/"),function(err,files) {
    var pictureName = files[pictureIndex];
    document.getElementById("fnameText").innerText = pictureName;
    document.getElementById("topText").innerText = language.album + ": " + folderPath.join("/");
    var picture = document.getElementById("picture");
    var img = new Image();
    img.src = replaceAll("#","%23",replaceAll("?","%3F",DATA_LOC + "/" + folderPath.join("/") + "/" + pictureName));
    img.onload = function() {
      EXIF.getData(img,function() {
        var orientation = EXIF.getTag(this,"Orientation");
        var rotation = [0,0,180,0,0,90,0,270][orientation - 1] || 0;
        var ratio = calculateRatio(img.width,img.height,window.innerWidth,window.innerHeight);
        picture.src = img.src;
        picture.width = img.width * ratio;
        picture.height = img.height * ratio;
        picture.onload = function() {
          picture.style.transform = `rotate(${rotation}deg)`;
          picture.style.display = "inline";
        }
      });
    }
  });
}

function movePicture(modifier) {
  pictureIndex += modifier;
  if ( pictureIndex < 0 ) pictureIndex = 0;
  fs.readdir(DATA_LOC + "/" + folderPath.join("/"),function(err,files) {
    if ( err ) throw err;
    if ( pictureIndex >= files.length ) pictureIndex = files.length - 1;
    drawPhotoPage();
  });
}

function moveBackPage() {
  folderPath.pop();
  if ( currentPage == "photo" ) {
    pictureIndex = 0;
    document.getElementById("picture").style.display = "none";
  }
  if ( folderPath.length > 0 ) {
    drawNavigationPage();
    openPage("navigation");
  } else {
    drawDownloadPage();
    openPage("download");
  }
}

function openPage(toOpen) {
  var pages = ["download","navigation","photo"];
  for ( var i = 0; i < pages.length; i++ ) {
    document.getElementById(pages[i] + "Page").className = "hidden";
  }
  document.getElementById(toOpen + "Page").className = "";
  currentPage = toOpen;
}

window.onload = function() {
  document.getElementById("back1").innerText = `<- ${language.back}`;
  document.getElementById("back2").innerText = `<- ${language.back}`;
  initConnection(function() {
    drawDownloadPage();
    openPage("download");
  });
}

window.onkeydown = function(event) {
  if ( currentPage == "photo" ) {
    if ( event.code == "ArrowLeft" ) movePicture(-1);
    if ( event.code == "ArrowRight" || event.code == "Space" ) movePicture(1);
  }
}

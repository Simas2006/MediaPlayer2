var LOCAL_DIR = process.env.APPDATA || (process.platform == "darwin" ? process.env.HOME + "/Library/Application Support/MediaPlayer2-dlp" : "/var/local");
var DATA_LOC = LOCAL_DIR + "/LocalData";

function drawDownloadPage() {
  var localObj = document.getElementById("localAlbums");
  fs.readdir(DATA_LOC,function(err,llist) {
    if ( err ) throw err;
    llist = llist.filter(item => ! item.startsWith("."));
    for ( var i = 0; i < llist.length; i++ ) {
      var li = document.createElement("li");
      var button = document.createElement("button");
      button.innerText = llist[i];
      button["data-index"] = i;
      button.onclick = function() {
        console.log("l" + this["data-index"]);
      }
      li.appendChild(button);
      localObj.appendChild(li);
    }
    var remoteObj = document.getElementById("remoteAlbums");
    listRemoteAlbums(function(rlist) {
      rlist = rlist.filter(item => llist.indexOf(item) <= -1);
      for ( var i = 0; i < rlist.length; i++ ) {
        var li = document.createElement("li");
        var button = document.createElement("button");
        button.innerText = rlist[i] + " ⏏️";
        button["data-index"] = i;
        button.onclick = function() {
          downloadAlbum(rlist[this["data-index"]],function(valid) {
            if ( valid ) location.reload();
          });
        }
        li.appendChild(button);
        remoteObj.appendChild(li);
      }
    });
  });
}

window.onload = function() {
  drawDownloadPage();
}

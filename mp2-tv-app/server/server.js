var fs = require("fs");
var CryptoJS = require("crypto-js");
var express = require("express");
var app = express();
var PORT = process.argv[2] || 5600;

app.post("/receive",function(request,response) {
  var data = "";
  request.on("data",function(chunk) {
    data += chunk;
  });
  request.on("end",function() {
    // TODO
  });
});

app.get("/blank",function(request,response) {
  response.writeHead(200);
  response.write("");
  response.end();
});

app.listen(PORT,function() {
  console.log("Listening on port " + PORT);
});

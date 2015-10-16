var http = require("http");
var resume = require("resume-schema").resumeJson;
var theme = require("./index.js");
var themeOptions  = {
    "material-primary-color" : "blue_grey",
    "material-sec-color" : "deep_orange",
  };

var port = 4000;
http.createServer(function (req, res) {
  res.writeHead(200, {
    "Content-Type": "text/html"
  });
  res.end(render(themeOptions));
}).listen(port);

console.log("Preview: http://localhost:4000/");
console.log("Serving..");

function render(themeOptions) {
  try {
    return theme.render(resume, themeOptions);
  } catch (e) {
    console.log(e.message);
    return "";
  }
}
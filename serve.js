var http = require("http");
var resume = require("./resume.json");
var theme = require("./index.js");
var palette  = {
    "primary" : "blue_grey",
    "secondary" : "deep_orange",
};

var port = 4000;
console.log(resume.meta.palette)
if(!(resume.meta && resume.meta.palette )){
  resume.meta = { palette };
}
  

http.createServer(function (req, res) {
  res.writeHead(200, {
    "Content-Type": "text/html"
  });
  res.end(render(resume));
}).listen(port);

console.log("Preview: http://localhost:4000/");
console.log("Serving..");


function render(resume) {
  try {
    return theme.render(resume);
  } catch (e) {
    console.log(e.message);
    return "";
  }
}
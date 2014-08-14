var http = require('http');
url  = require('url');
var port = 16000;

var callLog = [];

function apiHandler(req, res) { 
   var url_parts = url.parse(req.url);
   //console.log('url path: ' + url_parts.path);  
    
    callLog.push({method: req.method, path: url_parts.path});
    
   if (url_parts.path == '/one') {
      console.log('mockService, success 1');
      res.writeHead(200, {'Content-Type': 'application/json'});
      res.write('**OK**');
      res.end(); 
   } else if (url_parts.path == '/two') {
      console.log('mockService, success 2');
      res.writeHead(200, {'Content-Type': 'application/json'});
      res.write('**OK**');
      res.end();        
   } else if (url_parts.path == '/three') {
      console.log('mockService, failure 3');
      res.writeHead(200, {'Content-Type': 'application/json'});
      res.write('!!NOT OK!!');
      res.end();
   } else {
      console.log('mockService, no match for ' + url_parts.path);
      res.writeHead(200, {'Content-Type': 'application/json'});
      res.write('error!@!');
      res.end();
   }
}

function httpStartupComplete(port) {
    console.log("starting http server on port " + port);
}

//create mock remote service API  

http.createServer(apiHandler).listen(port, httpStartupComplete(port));
//http.createServer(apiHandler).listen(4321, httpStartupComplete(4321));

exports.callLog = function() {
  return callLog;  
};

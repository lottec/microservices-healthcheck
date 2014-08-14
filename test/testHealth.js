var assert = require('assert');
var request = require('superagent');
var mockServer = require("./mockService.js");
require('../app.js'); //Boot up the server for tests
var host = 'http://localhost:8080';
var msh = require('msh');

//var postData = {"serviceURL":"http://localhost:8080/test/the/service", "testMethod":"get", "expectedResStatus":"200", "cron":"*/10 * * * * *", "paramedicURL":"http://localhost:18081/call/the/ambulance", "serviceName":"myService"};

//var postData = {"serviceURL":"http://localhost:18081", "testMethod":"get", "expectedResStatus":"200", "cron":"*/10 * * * * *", "paramedicURL":"http://localhost:18081/call/the/ambulance", "serviceName":"myService"};

var postData = {"serviceURL":"http://localhost:16000", "cron":"*/10 * * * * *", "serviceName":"myService", "expectedResStatus":"200"};

describe('test healthCheck: ', function(){

    it('disable timeouts', function(done){
      this.timeout(4000);
      setTimeout(done, 3000);
    });
    
    it('/ works ok', function(done){
        var path = host + '/';3
        sendReq('get', path, function(res) {assert.equal(200, res.status);  done()});
    });

    it('create new patient', function(done){
        var path = host + '/service/myService';
        //var mockServer = createMockServiceServer(calledBackAssertions, done);
        sendReq('put', path, function(res) {assert.equal(200, res.status);  done()});
        //sendReq('get', path + '/logs/', function(res) {assert.equal(200, res.status)}, done);
        //checkLogs(path, done);
    });

    it('delete patient service', function(done){
        var path = host + '/service/myService';  
        sendReq('put', path, function(res) {assert.equal(200, res.status)});
        sendReq('del', path, function(res) {assert.equal(200, res.status)});
        sendReq('get', path, function(res) {assert.equal(404, res.status);  done()});
        
        
        // h = host, p = port, path = urlpath
        // var callback = function(actions) {};
        // msh.init(callback, errCallback).put(h, p , path, payload).get(h, p, path).del(h, p, path). get(h,p.path).end();
       
    });

});
/*
function checkLogs(path, done) {
    var req = request.get(path + 'logs/');
    req.end(function(res){
        console.log("it(put /myService/, get /myService/logs) res: " + res.text);
        //var jsonRes = JSON.parse(res.text);
        console.log("check logs "+res.text);
        assert.equal(200, res.status);
        //assert.equal("I like pink unicorns", jsonRes.logs[0]);
        done();
    });
    //sendReq('get', path + '/logs/', function(res) {assert.equal('I like green unicorns', res.text)}, done);
    //sendReq('get', path + '/logs/', function(res) {assert.equal(200, res.status)}, done);
}
*/
/*
function calledBackAssertions(done) {   
    var req = request.get(host + '/myService/logs');
    req.end(function(res){
        console.log("it(put /myService/, get /myService/logs) res: " + res.text);
        var jsonRes = JSON.parse(res.text);
        console.log("check logs "+res.text);
        assert.equal(200, res.status);
        assert.equal("MockService was called", jsonRes.logs[0]);
        done();
    });
}


function createMockServiceServer(calledBackAssertions, done) {
        var requestHandler = function(req, res) {
            console.log("MockService called ");
            res.writeHead(200, {'Content-Type': 'text/plain'});
            res.write("MockService was called");
            res.end();
            calledBackAssertions(done);
        };
        http.createServer(requestHandler).listen(18081);            
}
*/
function sendReq(type, path, assertion){
    console.log("***** sendReq()");
    var callback = function(res) {
        console.log("***** sendReq() callback");
        assertion(res);
    };
    if (type == 'put'){
        console.log("***** sendReq() if type == put");
        var req = request.put(path);
        req.send( postData );
        req.end(callback);
    } else if (type == 'del'){
         console.log("***** sendReq() if type == del");
        var req = request.del(path);
        req.end(callback);
    } else if (type == 'get'){
         console.log("***** sendReq() if type == get");
        var req = request.get(path);
        req.end(function(res) {assertion(res)});
        //req.end(callback);
    }
}
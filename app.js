//{"serviceURL":"http://localhost:18081","testMethod":"get","expectedResStatus":"200","cron":"*/10 * * * * *","paramedicURL":"http://localhost:19991","serviceName":"myService","logs":[]}

http = require('http');
var restify = require('restify');
var url = require('url');
var port = process.env.PORT || 8080;

var server = restify.createServer();
server.use(restify.queryParser());
server.use(restify.bodyParser());

var _ = require('underscore');
var CBuffer = require('CBuffer');

var CronJob = require('cron').CronJob;
var request = require('superagent');

server.listen(port, function() {
    console.log('healthCheck listening at %s', server.url);
});

var patientList = {};
var healthLog = {};

//list patient services
server.get('/', function(req, res) {
    console.log("healthCheck GET /");
    res.send({"_links": { "self": { "href": "/" }, "service": {"href": '/service'}}});
});

//list patient services
server.get('/service', function(req, res) {
    console.log("healthCheck GET /service");
    res.send(patientList);
});

//list cronJobs for specified service
server.get('/service/:serviceName/', function(req, res) {
    var serviceName = req.params.serviceName;
    console.log("healthCheck GET /" + serviceName);
    res.send(patientList[serviceName] || 404);
});

//list logs for specified service
server.get('/service/:serviceName/log/:logid', function(req, res) {
    var serviceName = req.params.serviceName;
    console.log("healthCheck GET /" + serviceName + "/logs");
    console.log("healthLog: " + healthLog[serviceName] + "here");
    res.send(healthLog[serviceName].toArray() || 404);
});

//submit patient service
server.put('/service/:serviceName/', function(req, res) {
    var serviceName = req.params.serviceName;
    //console.log("START OF PUT HERE");
    if (healthLog[serviceName] == undefined) {
        healthLog[serviceName] = new CBuffer(100);
    }
    //console.log('log buffer: ' + healthLog[serviceName].toArray() + 'here');
    var serviceName = req.params.serviceName;
    var payload = req.body;
    if ( patientList[serviceName] == undefined) {
        patientList[serviceName] = {};
    }
    patientList[serviceName] = payload;
    new CronJob(payload.cron, function(){
        checkService(payload, serviceName);
    }, null, true);
   
    console.log("healthCheck PUT /" + serviceName);
    data = {message: "healthCheck PUT ok: stored payload"};
    console.log("patientList: " + JSON.stringify(patientList));
    res.send(data);
    
});

//delete patient service
server.del('/service/:serviceName/', function(req, res) {
    var serviceName = req.params.serviceName;
    patientList[serviceName] = undefined;
    
    console.log("healthCheck DEL store=" + JSON.stringify(patientList));
    console.log("healthCheck DEL  /" + serviceName);
    console.log("healthCheck DEL store=" + JSON.stringify(patientList));
    
    data = {message: "healthCheck, del ok"};
    res.send(data);
});

function checkService(payload, serviceName){
    //get all service containers from nucleus
    //var containers = ["http://localhost:18081/1", "http://localhost:18081/2", "http://localhost:18081/3"];
    var containers = [payload.serviceURL + '/one', payload.serviceURL + '/two', payload.serviceURL + '/three'];
    var pass = 'YES';
    
    var iterator = function(element, index, list) {
        var req = request.get(element);
        console.log("service/container url is " + element);
        req.end(function(res){
            console.log("status is " + res.status);
            console.log("expected is " + payload.expectedResStatus);

            if (res.status != payload.expectedResStatus){
                //callParamedic(payload, serviceName);
                console.log("called the paramedic!!");
                pass = 'NO';
            }
            console.log("pass="+pass);
            healthLog[serviceName].push(getDateTime() + pass);
            //healthLog[serviceName].push('I like pink unicorns');
            console.log("updated logs:");
            console.dir(healthLog);
        });
    };

    _.each(containers, iterator);
}

/*
function callParamedic(payload, serviceName){
    //retrieve action from payload
    //var action = payload;
    //push action, service to paramedic service
    console.log("THIS IS THE PARAMEDIC CALL");
    console.log("paramedic url is " + payload.paramedicURL);
    var req = request.get(payload.paramedicURL);
    req.end(function(res){
        console.log("calling 999... :" + res.text);
    });
    /*var req = request.put(payload.paramedicURL);
    req.send(payload);
    req.end()
    
    //req.end(callback);
    
}
*/

function getDateTime() {

    var date = new Date();

    var hour = date.getHours();
    hour = (hour < 10 ? "0" : "") + hour;

    var min  = date.getMinutes();
    min = (min < 10 ? "0" : "") + min;

    var sec  = date.getSeconds();
    sec = (sec < 10 ? "0" : "") + sec;

    var month = date.getMonth() + 1;
    month = (month < 10 ? "0" : "") + month;

    var day  = date.getDate();
    day = (day < 10 ? "0" : "") + day;

    return  month + ":" + day + ":" + hour + ":" + min + ":" + sec;

}
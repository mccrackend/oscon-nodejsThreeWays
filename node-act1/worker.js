console.log("Hello OSCON!")

var redis = require("redis");
var config = require("./config.js");

var pubSubClient = redis.createClient(config.port, config.host);

pubSubClient.subscribe("notifications");

pubSubClient.on("message",
  function(channel, message) {
    console.log('Received a message: ' + message);
});

//PUBLISH notifications '{"identifier": 1, "message": "Huzzah!"}'

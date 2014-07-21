console.log("Hello OSCON!")

var redis = require("redis");
var config = require("./config.js");
var mailer = require('nodemailer');

var pubSubClient = redis.createClient(config.port, config.host);
var client = redis.createClient(config.port, config.host);

pubSubClient.subscribe("notifications");

pubSubClient.on("message", handleMessage);

function handleMessage(channel, message) {
  console.log('Received a message: ' + message);

  var payload = JSON.parse(message);

  acquireLock(payload, lockCallback);
}

function acquireLock(payload, callback) {
    // create a lock id string
    var lockIdentifier = "lock." + payload.identifier;

    console.log("Trying to obtain lock: %s", lockIdentifier);

    client.setnx(lockIdentifier, "The Kracken Worker", function(error, success) {
        if (error) {
            console.log("Error acquiring lock for: %s", lockIdentifier);
            return callback(error, dataForCallback(false));
        }

        var data = {
            "acquired" : success,
            "lockIdentifier" : lockIdentifier,
            "payload" : payload
        };
        return callback(data);
    });
}

function lockCallback(data) {
    if(data.acquired == true) {
        console.log("I got the lock!");

        // send notification!
        sendMessage(data);

        console.log('I win! Sending notification: %s',
                     JSON.stringify(data));
    }
    else console.log("No lock for me :(");
}

function sendMessage(payload) {
    console.log("Sending email notification...");
    var smtpTransport = mailer.createTransport("SMTP",{
        service: "Gmail",
        auth: {
            user: "",
            pass: ""
        }
    });

    var mailOptions = {
        from: "mccrackend@gmail.com", // sender address
        to: "mccrackend@gmail.com", // list of receivers
        subject: "Notification from Node.js", // Subject line
        text: "You are hereby notified!", // plaintext body
        html: "<b>You are hereby notified!</b>" // html body
    };

    smtpTransport.sendMail(mailOptions, function(error, response){
        if(error) console.log("Error sending mail: " + error);
        else console.log("Message sent: " + response.message);

        smtpTransport.close(); // shut down the connection pool, no more messages
    });
}

//PUBLISH notifications '{"identifier": 1, "message": "Huzzah!"}'

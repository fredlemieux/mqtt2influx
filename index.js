"use strict";

const mqtt = require('mqtt');
const client  = mqtt.connect('mqtt://localhost');  //change this to the broker that you are using
const http = require('http');
const querystring = require('querystring');

const post2Influx = (topic, message) => {
    const params = () => querystring.stringify({
        db: 'mydb',
        precision: 'ms'
    });

    let topicTypes = {};

    var options = {
        "method": "POST",
        "hostname": 'localhost',
        "port": "8086",
        "path": '/write?'+ params(),
        "headers": {
            "cache-control": "no-cache",
        }
    };

    var req = http.request(options, function (res) {
        var chunks = [];

        res.on("data", function (chunk) {
            chunks.push(chunk);
        });

        res.on("end", function () {
            var body = Buffer.concat(chunks);
            console.log(body.toString());
        });
    });

    console.log('writing to influx');
    req.write("wts,topic="+ topic + " value=" + message);
    req.end();
};

client.on('connect', function () {
    client.subscribe('test', function (err) {
        if (!err) {
            setInterval(publishRandom, 1000)
        } else {
            console.log("Are you sure the MQTT broker address is correct?");
        }
    })

});

client.on('message', function (topic, message) {
    // message is Buffer
    console.log(message.toString());
    // client.end()  //If you want to end the subscription here
    // once a message has been received we need to specify where to send it using the topic
    // then we need to post the message to
    post2Influx(topic, message);
});

module.exports = client;

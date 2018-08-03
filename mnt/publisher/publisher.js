#!/usr/bin/env node

var amqp = require('amqplib/callback_api');

amqp.connect('amqp://guest:guest@rabbitmq_server:5672', function(err, conn) {
  if(err) {
    console.log(err);
    process.exit(1);
  }
  
  createAddUnicornPublisherChannel(conn);
  createMoveUnicornPublisherChannel(conn);
  createSeeUnicornsPublisherChannel(conn);
  
  setTimeout(function() {
      conn.close();
      process.exit(0);
  }, 500);
});

createAddUnicornPublisherChannel = function(conn) {
  conn.createChannel(function(err, ch) {
    var q = 'add-uniqueue';
    var msg = {
      name: 'Bill',
      location: 'barn',
      action: 'add'
    };

    ch.assertQueue(q, {durable: true});
    ch.sendToQueue(q, Buffer.from(JSON.stringify(msg)));
    console.log(" [x] Sent '%s'", JSON.stringify(msg));
  });
};

createMoveUnicornPublisherChannel = function(conn) {
  conn.createChannel(function(err, ch) {
    var q = 'move-uniqueue';
    var msg = {
      id: 1,
      location: 'barn',
      action: 'move'
    };

    ch.assertQueue(q, {durable: true});
    ch.sendToQueue(q, Buffer.from(JSON.stringify(msg)));
    console.log(" [x] Sent '%s'", JSON.stringify(msg));
  });
};

createSeeUnicornsPublisherChannel = function(conn) {
  conn.createChannel(function(err, ch) {
    ch.assertQueue('', {exclusive: true}, function(err, q) {
      console.log(' [x] Requesting location of unicorns.');
      
      var corrId = generateUuid();
      
      ch.consume(q.queue, function(msg) {
        if (msg.properties.correlationId === corrId) {
          try {
            var content = JSON.parse(msg.content);
          } catch(err) {
            throw "Invalid JSON: " + JSON.stringify(msg.content);
          }
          
          console.log(' [.] Got %s', JSON.stringify(content));
          
          setTimeout(function() {
            conn.close();
            proces.exit(0);
          }, 500);
        }
      }, {noAck: true});
      
      ch.sendToQueue(
        'see_uniqueue',
        Buffer.from(JSON.stringify({ action: "see" })),
        { correlationId: corrId, replyTo: q.queue }
      );
    });
  });
};

generateUuid = function() {
  return Math.random().toString() +
         Math.random().toString() +
         Math.random().toString();
};
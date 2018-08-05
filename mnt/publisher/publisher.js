#!/usr/bin/env node

var amqp = require('amqplib/callback_api');

var action, args = [];
process.argv.forEach(function (val, index) {
  if (index === 2) {
    action = val;
  }
  
  if (index > 2) {
    args.push(val);
  }
});

amqp.connect('amqp://guest:guest@rabbitmq_server:5672', function(err, conn) {
  if(err) {
    console.log(err);
    process.exit(1);
  }
  
  switch(action) {
    case "add":
      addUnicorn(conn, process.argv[3], process.argv[4]);
      break;
      
    case "move":
      moveUnicorn(conn, process.argv[3], process.argv[4]);
      break;
    
    case "see":
      seeUnicorns(conn, process.argv[3], process.argv[4]);
      break;
  }
  
  setTimeout(function() {
      conn.close();
      process.exit(0);
  }, 500);
});

addUnicorn = function(conn, name, location) {
  conn.createChannel(function(err, ch) {
    var q = 'add-uniqueue';
    var msg = {
      name: name,
      location: location,
      action: 'add'
    };

    ch.assertQueue(q, {durable: true});
    ch.sendToQueue(q, Buffer.from(JSON.stringify(msg)));
    console.log(" [x] Sent '%s'", JSON.stringify(msg));
  });
};

moveUnicorn = function(conn, id, location) {
  conn.createChannel(function(err, ch) {
    var q = 'move-uniqueue';
    var msg = {
      id: id,
      location: location,
      action: 'move'
    };

    ch.assertQueue(q, {durable: true});
    ch.sendToQueue(q, Buffer.from(JSON.stringify(msg)));
    console.log(" [x] Sent '%s'", JSON.stringify(msg));
  });
};

seeUnicorns = function(conn) {
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
        'see-uniqueue',
        Buffer.from(JSON.stringify({ })),
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
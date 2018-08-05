#!/usr/bin/env node

var amqp = require('amqplib/callback_api');
var mysql = require('mysql');

const locations = ['barn', 'corral', 'pasture'];

amqp.connect('amqp://guest:guest@rabbitmq_server:5672', function(err, conn) {
  createAddUnicornConsumerChannel(conn);
  createMoveUnicornConsumerChannel(conn);
  createSeeUnicornsConsumerChannel(conn);
});

queryDb = function(query, func) {
  var db = mysql.createConnection({
    host: 'database',
    user: 'root',
    password: 'example',
    database: 'unicorn_manager'
  });

  db.connect((err) => {
    if (err) throw err;

    db.query(query, func);
  });
};

// Channel for consuming ADD UNICORN messages.
createAddUnicornConsumerChannel = function(conn) {
  conn.createChannel(function(err, ch) {
    var q = 'add-uniqueue';

    ch.assertQueue(q, {durable: true});
    console.log(" [*] AddUnicorn channel is waiting for messages.", q);
    ch.consume(q, function(msg) {
      var content = JSON.parse(msg.content);
      console.log(" [x] Received %s", JSON.stringify(content));
      var location = content.location.toLowerCase();
      
      if (locations.includes(location)) {
        queryDb(`
          INSERT INTO unicorns (\`name\`, \`location\`)
          VALUES ('${content.name}', '${content.location}');
        `, function() {
          ch.ack(msg);
        });
      } else {
        ch.nack(msg, false, false);
        console.log(" [!] Nacked %s", msg.content.toString());
      }
    });
  });
};

// Channel for consuming MOVE UNICORN messages.
createMoveUnicornConsumerChannel = function(conn) {
  conn.createChannel(function(err, ch) {
    var q = 'move-uniqueue';

    ch.assertQueue(q, {durable: true});
    console.log(" [*] MoveUnicorn channel is waiting for messages.", q);
    
    ch.consume(q, function(msg) {
      console.log(" [x] Received %s", msg.content.toString());
      try {
        var content = JSON.parse(msg.content);
      } catch(err) {
        throw "Invalid JSON: " + JSON.stringify(msg.content);
      }

      if (content.hasOwnProperty("id")) {
        var newLocation = content.location.toLowerCase();
        var id = Number(content.id);
        
        if(locations.includes(newLocation)) {
          queryDb(`
            UPDATE unicorns 
            SET \`location\` = "${newLocation}"
            WHERE \`id\` = ${id};
          `);
          ch.ack(msg);
        } else {
          throw "Invalid location";
        }
      }
    });
  });
};

// Channel for consuming SEE UNICORNS messages.
createSeeUnicornsConsumerChannel = function(conn) {
  conn.createChannel(function(err, ch) {
    var q = 'see-uniqueue';
    
    ch.assertQueue(q, {durable: false});
    ch.prefetch(1);
    console.log(" [*] SeeUnicorns channel is waiting for requests.", q);
    
    ch.consume(q, function(msg) {
      console.log(" [x] Received request from %s", JSON.stringify(msg.properties.replyTo));
      
      try {
        var content = JSON.parse(msg.content);
      } catch(err) {
        throw "Invalid JSON: " + JSON.stringify(msg.content);
      }
      
      db = mysql.createConnection({
          host: 'database',
          user: 'root',
          password: 'example',
          database: 'unicorn_manager'
      });

      db.connect((err) => {
        if (err) throw err;

        db.query(
          "SELECT `id`, `name`, `location` FROM `unicorns`;", 
          function(err, result) {
            if (err) throw err;

            ch.sendToQueue(
              msg.properties.replyTo,
              Buffer.from(JSON.stringify(result)),
              { correlationId: msg.properties.correlationId },
              function(err, ok) {
                if (err) throw err;
              }
            );

            ch.ack(msg);
          }
        );
      });
    });
  });
};
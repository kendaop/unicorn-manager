#!/usr/bin/env node

var amqp = require('amqplib/callback_api');
var mysql = require('mysql');

const locations = ['barn', 'corral', 'pasture'];

amqp.connect('amqp://guest:guest@rabbitmq_server:5672', function(err, conn) {
  createAddUnicornConsumerChannel(conn);
  createMoveUnicornConsumerChannel(conn);
  createSeeUnicornsConsumerChannel(conn);
});

//  Channel for consuming ADD UNICORN messages.
createAddUnicornConsumerChannel = function(conn) {
  conn.createChannel(function(err, ch) {
    var q = 'add-uniqueue';

    ch.assertQueue(q, {durable: true});
    console.log(" [*] AddUnicorn channel is waiting for messages.", q);
    ch.consume(q, function(msg) {
      var content = JSON.parse(msg.content);
      
      if (content.hasOwnProperty("action") && 
          content.action.toLowerCase() === 'add'
      ) {
        console.log(" [x] Received %s", JSON.stringify(content));

        var db = mysql.createConnection({
          host: 'database',
          user: 'root',
          password: 'example',
          database: 'unicorn_manager'
        });

        db.connect((err) => {
          if (err) throw err;
          var content = JSON.parse(msg.content);
          var name = content.name;
          var location = content.location;

          db.query(`
            INSERT INTO unicorns (\`name\`, \`location\`)
            VALUES ('${name}', '${location}');
          `, 
          function(err, result, fields) {
            if (err) throw err;
          });
          ch.ack(msg);
        });
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

      if (content.hasOwnProperty("action") && 
          content.action.toLowerCase() === 'move' &&
          content.hasOwnProperty("id")
      ) {
        var newLocation = content.location.toLowerCase();
        var id = Number(content.id);
        
        if(locations.includes(newLocation)) {
          var db = mysql.createConnection({
            host: 'database',
            user: 'root',
            password: 'example',
            database: 'unicorn_manager'
          });

          db.connect((err) => {
            if (err) throw err;

            db.query(`
              UPDATE unicorns 
              SET \`location\` = "${newLocation}"
              WHERE \`id\` = ${id};
            `, 
            function(err, result, fields) {
              if (err) throw err;
            });
            ch.ack(msg);
          });
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
    var q = 'see_uniqueue';
    
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
      
      if (content.hasOwnProperty("action") &&
          content.action.toLowerCase() === "see"
      ) {
        db = mysql.createConnection({
            host: 'database',
            user: 'root',
            password: 'example',
            database: 'unicorn_manager'
        });
        
        db.connect((err) => {
          if (err) throw err;
          
          db.query(
            "SELECT `name`, `location` FROM `unicorns`;", 
            function(err, result, fields) {
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
      }
    });
  });
};
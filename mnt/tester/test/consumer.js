#!/usr/bin/env node

var assert = require('chai').assert;
var amqp = require('amqplib');
var mysql = require('mysql');
var conn = undefined;
var db = undefined;

describe('hooks', function() {

  before(async function() {
    db = mysql.createConnection({
      host: 'database',
      user: 'root',
      password: 'example',
      database: 'unicorn_manager'
    });
    
    await db.connect((err) => {
      if (err) throw err;
    });
    
    conn = await amqp.connect('amqp://guest:guest@rabbitmq_server:5672');
  });

  after(function() {
    conn.close();
    db.end();
  });

  beforeEach(async function() {
    await db.query('TRUNCATE TABLE `unicorns`;', function(err) {
      if (err) throw err;
    });
  });

  afterEach(function() {
  });

  describe('Consumer', function() {
    describe('# SEE UNICORNS', function() {
      
      it('should return empty set when no unicorns exist', function(done) {
        conn.createChannel().then(function(ch) {
          var corrId = '123';
          // No test setup is necessary. The before() hook has emptied the database.
          return ch.assertQueue('', {exclusive: true}).then(function(q) {
            ch.consume(q.queue, function(msg) {
              var content = JSON.parse(msg.content);
              
              // Assert the response content is empty.
              assert.isEmpty(content);
              done();
            }).then(function() {
              // Send the request to SEE UNICORNS.
              ch.sendToQueue(
                'see-uniqueue',
                Buffer.from('{}'),
                { correlationId: corrId, replyTo: q.queue }
              );
            });
          }, {noAck: true});
        });
      });
      
      it('should return an appropriately-populated array of unicorns', function(done) {
        // Test data
        var unicorns = [{
          id: 1,
          name: "TEST-1",
          location: "barn"
        }, {
          id: 2,
          name: "TEST-2",
          location: "pasture"
        }];
      
        // Insert two test records into the database.
        db.query(`
          INSERT INTO \`unicorns\` (name, location) VALUES 
          ("${unicorns[0].name}", "${unicorns[0].location}"), 
          ("${unicorns[1].name}", "${unicorns[1].location}");
        `, function() {
          conn.createChannel().then(function(ch) {
            var corrId = '123';

            return ch.assertQueue('', {exclusive: true}).then(function(q) {
              ch.consume(q.queue, function(msg) {
                var content = JSON.parse(msg.content);
                
                // Make assertions on the size and correctness of the returned array.
                assert.lengthOf(content, unicorns.length, 'array is correct length');
                unicorns.forEach(function(val) {
                  assert.deepInclude(content, val);
                });
                
                done();
              }).then(function() {
                // Send the request to SEE UNICORNS.
                ch.sendToQueue(
                  'see-uniqueue',
                  Buffer.from('{}'),
                  { correlationId: corrId, replyTo: q.queue }
                );
              });
            }, {noAck: true});
          });
        });
      });
    });
    
    describe('# ADD UNICORN', function() {
      
      it('should add a unicorn to the database', function(done) {
        var q = 'add-uniqueue';
        var data = {
          id: 1,
          name: 'TEST-1',
          location: 'pasture'
        };
        
        conn.createChannel().then(function(ch) {
          return ch.assertQueue(q, {durable: true}).then(async function() {
            return ch.sendToQueue(q, Buffer.from(JSON.stringify(data)));
          }).then(function() {
            db.query("SELECT * FROM unicorns;", function(err, res) {
              if (err) throw err;

              var result = JSON.parse(JSON.stringify(res));
              assert.lengthOf(result, 1);
              assert.deepInclude(result, data);
              done();
            });
          });
        });
      });
    });
  });
});

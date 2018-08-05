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
      db.query('TRUNCATE TABLE `unicorns`;', function(err) {
        if (err) throw err;
      });
    });
    
    conn = await amqp.connect('amqp://guest:guest@rabbitmq_server:5672');
  });

  after(function() {
    conn.close();
    db.end();
  });

  beforeEach(function() {
  });

  afterEach(function() {
  });

  describe('Consumer', function() {
    describe('#SeeUnicorns', function() {
      it('should return empty set when no unicorns exist', function(done) {
        conn.createChannel().then(function(ch) {
          var corrId = '123';

          return ch.assertQueue('', {exclusive: true}).then(function(q) {
            ch.consume(q.queue, function(msg) {
              var content = JSON.parse(msg.content);
              assert.isEmpty(content);
              done();
            }).then(function() {
              ch.sendToQueue(
                'see-uniqueue',
                Buffer.from(JSON.stringify({ action: "see" })),
                { correlationId: corrId, replyTo: q.queue }
              );
            });
          }, {noAck: true});
        });
      });
    });
  });
});

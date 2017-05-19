//route is /newItem

const url = require('url')
const budo = require('budo')
const ssbClient = require('ssb-client');
const pull = require('pull-stream');
const bl = require('bl')
const notify = require('pull-notify')
const createWSServer = require('pull-ws/server')

const newItemMessageType = 'whats-dinner:newItem';

function processMessages(message) {
  const {item, quantity} = message.value.content;
  console.log(`${quantity}x${item}`);
}

ssbClient(function (err, sbot) {
  if (err) {
    console.log('sbot err', err.message);
    return
  }
  pull(
      sbot.createLogStream({live:true}),
      pull.filter(({ value }) => value && value.content.type === newItemMessageType),
      pull.drain(processMessages)
  );  

  var app = budo('./index.js', {
    verbose: true,
    middleware: function (req, res, next) {
      if (url.parse(req.url).pathname === '/newItem' && req.method==='POST') {
        req.pipe(new bl((err, body)=>{
          body = body.toString();
          let payload = JSON.parse(body);
          payload.type = newItemMessageType;
          
          sbot.publish( payload, (err, message) => {
            if (err) {
              console.log('error was', err)
              res.statusCode = 503
              res.end(err.message)
            } else {
              res.statusCode = 201
              res.end(JSON.stringify(message))
            }
          }); 
          
        }));
      } else {
        // fall through to other routes
        next()
      }
    }
  })
  // NOTE: the 'connect' event fires when the
  // server is ready to receive connections. (wtf)
  app.on('connect', (event)=>{
    console.log('Server is listening'); 
    createWSServer({server: event.server}, (stream) =>{
      pull(
        pull.count(),
        pull.asyncMap( (data, cb)=>{
          setTimeout( ()=>cb(null, data), 1000);
        }),
        pull.map( (x)=> `${x} Hello I am the server`),
        stream, 
        pull.log()
      )
    })
  });
});


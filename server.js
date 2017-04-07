//route is /newItem

const url = require('url')
const budo = require('budo')
const ssbClient = require('ssb-client');
const pull = require('pull-stream');
const bl = require('bl')

ssbClient(function (err, sbot) {
  if (err) {
    console.log('sbot err', err.message);
    return
  }
  var app = budo('./index.js', {
    verbose: true,
    middleware: function (req, res, next) {
      if (url.parse(req.url).pathname === '/newItem' && req.method==='POST') {
        console.log('HERE');
        req.on('end', chunk => console.log('it at least has end event'))
        req.pipe(new bl((err, body)=>{
          body = body.toString();
          console.log('body is >', body, '<');
          let payload = JSON.parse(body);
          payload.type = "whats-dinner:newItem";
          
          sbot.publish( payload, (err, message) => {
            if (err) {
              console.log('error was', err)
              res.statusCode = 503
              res.end(err.message)
            } else {
              res.statusCode = 201
              res.end(JSON.stringify(message))
            }
            console.log('publish result', arguments);
          }); 
          
        }));
      } else {
        // fall through to other routes
        next()
      }
    }
  })
});
/*
  pull(
      sbot.createLogStream(),
      pull.drain(processMessages)
  );  

function processMessages(message) {
  console.log(message);
}
*/

var conf = require('../conf'),
    https = require('https'),
    md = require('marked');

if (true || conf.mandrill_api_key){
  /* opts: to, subject, body
   * cb: function(err, success)
   */
  exports.send = function(opts, cb){
    var postjson, postjsonstring, reqopts = {
      host: 'mandrillapp.com',
      method: 'POST',
      path: '/api/1.0/messages/send.json'
    };
    postjson = {
      key: conf.mondrill_api_key,
      message: {
        html: md.parse(opts.body),
        text: opts.body,
        subject: opts.subject,
        from_email: (opts.from || "mailer") + "@" + conf.domain,
        to: [{email:opts.to}],
        track_opens: true,
        track_clicks: true,
      }
    };
    postjsonstring = JSON.stringify(postjson);
    reqopts.headers = {
      "Content-Length": postjsonstring.length
    };
    var req = https.request(reqopts,  function(res){
      res.on('data', function(d){
        console.log('response from mandrill received!');
      });
      if (res.statusCode !== 200){
        console.log("error sending using mandrill message!");
      }
    });
    req.on('error', function(e){
      console.log(e);
    });
    req.write(JSON.stringify(postjson), 'utf8');
    req.end();
    cb(null, true);
  };
} else {
  exports.send = function(opts, cb){
    console.log('Sending email:');
    console.log(opts);
    cb(null, true);
  };
}

var conf = require('../conf'),
    https = require('https'),
    md = require('marked');

if (conf.mandrill_api_key){
  /* opts: to, subject, body
   * cb: function(err, success)
   */
  exports.send = function(opts, cb){
    var postjson, reqopts = {
      host: 'smtp.mandrillapp.com',
      method: 'POST',
      port: 443,
      path: '/messages/send.json'
    };
    var req = https.request(reqopts,  function(res){
      if (res.statusCode !== 200){
        console.log("error sending using mandrill message!");
      }
    });
    postjson = {
      key: conf.mondrill_api_key,
      message: {
        html: md.parse(opts.body),
        text: opts.body,
        subject: opts.subject,
        from_email: (opts.from || "mailer@") + conf.domain,
        to: (typeof opts.to === typeof [])?(opts.to):([opts.to]),
        track_opens: true,
        track_clicks: true,
      }
    };
    req.write(JSON.stringify(postjson));
    req.end();
  };
} else {
  exports.send = function(opts, cb){
    console.log('Sending email:');
    console.log(opts);
    cb(null, true);
  };
}

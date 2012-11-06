var models = require('../lib/models'),
  email = require('../lib/email'),
  auth = require( '../lib/auth'),
  conf = require('../conf');

exports.recover = function(req, res, next) {
  res.render('recover',{req:req});
};

exports.recover_post = function(req, res, next) {
  models.User.findOne({email: req.body.email},function(err, user){
    if (err){
      return next(err);
    }

    if (!user){
      req.session.messages=['error', "Couldn't find a user with that email"];
      return res.render('recover',{req:req});
    }
    var recov = new models.Recovery();
    recov.account = user.id;
    recov.expires = new Date(new Date().getTime() + 60*60*1000);
    //neat little trick to generate a random alphanumeric secret key
    recov.secret = Math.random().toString(36).substring(7);
    recov.save(function(err, record){
      if (err){
        req.session.messages=['error', "Error occured during recovery attempt."];
        return res.render('recover',{req:req});
      }
      var reset_url = 'http://' + conf.domain + '/recover/' + record.id +
            "?s=" + record.secret;
      email.send({
        to: user.email,
        subject: 'CC Orgs Password Reset',
        body: "Go to the following page to reset your e-mail:\n\n<" + 
        reset_url + ">",
        from: "recover"
      }, function(error, success) {
        if (!success){
          console.error(error);
        }
      });

      req.session.messages=['info', 'Check your email to reset your password'];
      res.render('recover', {req:req});
    });
  });
};

exports.reset_password = function(req, res, next) {
  res.render('reset-password', {req:req, secret:req.query['s']});
};

exports.reset_password_post = function(req, res, next) {
  models.Recovery.findOne({_id: req.params.id}, function(err, recov) {
    if (err){
      return next(err);
    }
    if (!recov){
      return res.send(404, "Recovery attempt ID not recognized");
    }
    if (new Date() > recov.expires){
      recov.remove();
      return res.send(403, "Recovery period expired");
    }
    if (req.body.s !== recov.secret){
      return res.send(403, "Recovery attempt is not approved");
    }
    models.User.findOne({_id: recov.account}, function(err, user){
      if (err){
        return next(err);
      }
      if (!user){
        return res.send(404);
      }

      auth.resetPassword(user, req.body.password, function(err) {
        if (err){
          return next(err);
        }
        recov.remove();
        req.session.mesasges=['info', 'Password reset successfully'];
        res.redirect('/login');
      });
    });
  });
};

exports.profile = function(req, res, next) {
  if (req.params.id) {
    models.User.findOne({gt_userid: req.params.id}, function(err, user) {
      if (err) {
        next(err);
      }
      if (!user) {
        return res.send(404, 'User not found!'); 
      }
      res.render('profile', {
        req: req,
        user: user,
      });
    });
  } else {
    res.render('profile', {
      req: req,
      user: req.user, 
    });
  }
};

exports.put = function(req, res, next) {
  var emailre = /\S+@\S+\.\S+/;
  models.User.findOne({gt_userid: req.params.id || req.user.gt_userid}, function(err, user) {
    if (err) {
      return next(err); 
    }
    if (req.body.email && (req.user.is_admin || ( req.user.gt_userid ==  req.params.id))){
      if (emailre.test(req.body.email)){
        user.email = req.body.email;
        console.log("Saving" + JSON.stringify(user));
        user.save();
      } else {
        req.session.messages=['alert','invalid e-mail'];
        return res.redirect(req.url);
      }
    } else {
      //some sort of error
      return res.send(404, 'Error saving your change');
    } 
    return res.redirect('/profile');
  });
};

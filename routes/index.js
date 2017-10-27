var express = require('express');
var router = express.Router();
var models = require('../models');

/* GET home page. */
router.get('/', function(req, res, next) {
  var currentUsername = req.session.accessToken.upn;

  models.User.findOrCreate({where: {username: currentUsername}})
  .spread((user, created) => {
    console.log(user.get({
      plain: true
    }));
    console.log(created);
  });
  res.render('index', { title: 'Express', user: req.session.accessToken });
});

router.post('/checkin', function(req,res,next){

});

module.exports = router;

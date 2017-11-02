var express = require('express');
var router = express.Router();
var models = require('../models');
var Sequelize = require("sequelize");
var moment = require('moment');
const Op = Sequelize.Op;

/* GET home page. */
router.get('/', function(req, res, next) {
  var currentUsername = req.session.accessToken.upn;

  models.User.findOrCreate({where: {username: currentUsername}})
  .spread((user, created) => {
    console.log(user.get({
      plain: true
    }));
    console.log(created);
    user.getEntries({where: 
      {
        checkin: {
          [Op.gt]: moment().utc().startOf('day').toDate(),
          [Op.lt]: moment().utc().endOf('day').toDate()
        }
      }
    }).then(entries => {
      if (entries.length === 0) {
        user.createEntry({}).then(entry => {
          return res.render('index', { title: 'Express', identity: req.session.accessToken, entry: entry, user: user });
        });
      }
      else {
        return res.render('index', { title: 'Express', identity: req.session.accessToken, entry: entries[0], user: user });
      }
    });
  });
  
});

router.post('/', function(req,res,next){
  console.log(req.body);
  //TODO: copy paste code from above and update entry in db.
});

module.exports = router;

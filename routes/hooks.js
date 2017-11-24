var express = require('express');
var router = express.Router();
var models = require('../models');
var Sequelize = require("sequelize");
var moment = require('moment');
const Op = Sequelize.Op;


router.get('/', function(req, res, next) {
    res.send('This is not the droid you are looking for.');
});

router.get('/:token/checkin', function(req, res, next){
    models.User.findOne({where: { token: req.params.token }})
    .then((user) => {
      models.Entry.findOrCreate({ 
        where:   {
          checkIn: {
            [Op.gt]: moment().utc().startOf('day').toDate(),
            [Op.lt]: moment().utc().endOf('day').toDate()
          },
          UserId : user.id
        }
      }).spread((entry, created) => { 
        if (created) {
          console.log(entry.get({plain:true}));  
          entry.checkIn = moment().utc().toDate();
          entry.save()
          .then(() => { 
            res.send("All good, entry saved.");
          });
        }
        else {
          res.send("Checkin for today has already been set. The value is: " + entry.checkIn);
        }
      });
    });
  });
  
router.get('/:token/checkout', function(req, res, next){
    //TODO: find user by token and set checkin to now()
    models.User.findOne({where: { token: req.params.token }})
    .then((user) => {
      models.Entry.findOrCreate({ 
        where:   {
          checkIn: {
            [Op.gt]: moment().utc().startOf('day').toDate(),
            [Op.lt]: moment().utc().endOf('day').toDate()
          },
          UserId : user.id
        }
      }).spread((entry, created) => { 
        console.log(entry.get({plain:true}));  
        entry.checkOut = moment().utc().toDate();
        entry.save()
        .then(() => { 
          res.send("All good, entry saved with new check-out time of: " + entry.checkOut);
        });
      });
    });
  });

module.exports = router;



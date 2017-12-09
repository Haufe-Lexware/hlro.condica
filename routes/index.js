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
    console.log(user.get({ plain: true }));

    models.Entry.findOrCreate({ 
      where:   {
        checkin: {
          [Op.gt]: moment().utc().startOf('day').toDate(),
          [Op.lt]: moment().utc().endOf('day').toDate()
        },
        UserId : user.id
      }, defaults: { UserId: user.id }
    }).spread((entry, created) => { 
      console.log(entry.get({plain:true}));  
      return res.render('index', { title: 'HLRO Condica', identity: req.session.accessToken, entry: entry, user: user, appUrl: (process.env.WEBSITE_HOSTNAME || 'localhost:3000') });
    });
  });
});

router.get('/report', function(req, res, next){
  var currentUsername = req.session.accessToken.upn;
  models.User.findOne({where: { username: currentUsername }}) 
  .then( user => {
    user.getEntries()
    .then(entries => {
      res.render('report', { entries : entries });
    });
  });
});

//Save entry
router.post('/', function(req, res, next) {
  console.log(req.body);
  models.Entry.findById(req.body.entryId)
  .then( entry =>  {
    entry.workedHours = req.body.workedHours;
    entry.location = req.body.location;
    entry.overtime = req.body.overtime;

    if (entry.checkOut == null){
      //TODO: This needs to change if we allow editing dates in the past.
      const checkOut = moment(req.body.checkOut, "HH:mm");

      if (checkOut.isValid()) {
        entry.checkOut = checkOut.toDate();
      }
    }
    else {
      var enteredCheckOutTime = moment(req.body.checkOut, "HH:mm");
      var existingCheckOutTime = moment(entry.checkOut, "HH:mm");

      if (!existingCheckOutTime.isValid()) {
        // provide a fallback for existing invalid check-out values
        existingCheckOutTime = moment(entry.checkIn);
      }

      entry.checkOut = existingCheckOutTime.hours(enteredCheckOutTime.hours()).minutes(enteredCheckOutTime.minutes());
    }

    var enteredCheckInTime = moment(req.body.checkIn, "HH:mm");
    entry.checkIn = moment(entry.checkIn).hours(enteredCheckInTime.hours()).minutes(enteredCheckInTime.minutes());
    //Object {checkIn: "14:32", checkOut: "", workedHours: "8", overtime: "0", location: "OFFICE", …}
    //Object {id: "e25b0690-c937-11e7-a008-ef7cd41374cd", checkIn: Tue Nov 14 2017 14:32:31 GMT+0200 (GTB Standard Ti…, checkOut: null, location: null, workedHours: null, …}
    console.log(entry.get({ plain:true }));  
    entry.save()
    .then(() => {
      console.log(entry.get({ plain:true }));  
      return res.redirect('/');  
    });
  });
});

router.post('/generatetoken', function(req, res, next){
    models.User.findById(req.body.userId)
    .then(user => {
      user.token = generateRandomString();
      user.save()
      .then(() => {
        console.log(user.get({ plain:true }));  
        res.redirect('/');
      });
    });
});

function generateRandomString() {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < 15; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}

module.exports = router;

var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var users = require('./routes/users');
var hooks = require('./routes/hooks');


var session = require('express-session');
var jwt = require('jsonwebtoken');
var passport = require('passport');
var OAuth2Strategy = require('passport-oauth').OAuth2Strategy;

var app = express();

var callbackUrl = (process.env.WEBSITE_HOSTNAME  || 'http://localhost:3000') + '/callback' ;
console.log('Callback URL: ' + callbackUrl);
// Configure passport to integrate with ADFS
var strategy = new OAuth2Strategy({
  authorizationURL: 'https://identity.haufe.com/adfs/oauth2/authorize',
  tokenURL: 'https://identity.haufe.com/adfs/oauth2/token',
  clientID: 'HLROCondica', // This is the ID of the ADFSClient created in ADFS via PowerShell
  clientSecret: 'shhh-its-a-secret', // This is ignored but required by the OAuth2Strategy
  callbackURL: (process.env.WEBSITE_HOSTNAME  || 'http://condica.azurewebsites.net/callback') //localhost for the moment, so only works if you run this on your machine
},
function (accessToken, refreshToken, profile, done) {
  if (refreshToken) {
    authRefreshToken = refreshToken;
    console.log('Received but ignoring refreshToken (truncated)', refreshToken.substr(0, 25));
  } else {
    console.log('No refreshToken received');
  }
  done(null, profile);
});

strategy.authorizationParams = function (options) {
return {
  resource: 'https://api.haufe-lexware.com' // An identifier corresponding to the Relying Party Trust, i just chose this cause FoundationalServices & Atlantic are api.haufe-lexware.com:)
};
};

strategy.userProfile = function (accessToken, done) {
done(null, jwt.decode(accessToken));
};

passport.use('provider', strategy);
console.log('Using passport-oauth strategy with config: ', JSON.stringify(strategy));

passport.serializeUser(function (user, done) {
done(null, user);
});

passport.deserializeUser(function (user, done) {
done(null, user);
});

function ensureAuthenticated(req, res, next){
  if (req.isAuthenticated()){
    next();
  }
  else{
    res.redirect("/login");
  }
}

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({secret: 'bugsbunny', resave: true, saveUninitialized: true}));
app.use(passport.initialize());
app.use(passport.session());

app.get('/login', passport.authenticate('provider'), function(req, res) { req.redirect("/")});
app.get('/callback', passport.authenticate('provider'), function(req, res) {
  console.log("Callback - Enter");
  console.log("req.user=" + req.user);
  console.log('------------------------------------------------------------------------------');
  var decoded = jwt.decode(req.user);
  req.session.accessToken = req.user;
  res.redirect('/');
});

app.get('/logout', function (req, res) {
  req.session = "";
  res.redirect('/login');
});

app.use('/hooks', hooks);
app.use('/', ensureAuthenticated, routes);
app.use('/users', ensureAuthenticated, users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;

var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) 
{
  res.render('index', { title: 'Home', active_page: 'home' });
});

/* GET volunteer hub page. */
router.get('/volunteer-hub', function(req, res, next) 
{
  res.render('hub', { title: 'hub', active_page: 'hub' });
});

/* GET UGC page. */
router.get('/volunteer-experiences', function(req, res, next) 
{
  res.render('experience', { title: 'experience', active_page: 'experience' });
});

router.get('/post-submission', function(req, res, next) 
{
  res.render('submission', { title: 'submission' });
});

/* GET moderator page. */
router.get('/moderator', function(req, res, next) 
{
  res.render('moderator', { title: 'moderator' });
});

const session = require('express-session');
router.use(session({
	resave: false,
	saveUninitialized: false,
	secret: 'SECRET' //TODO CHANGE THIS TO ACCESS TO AN ENVIRONMENT VARIABLE
}));

/*
var sess = {
	secret: 'SECRET',
	cookie: {}
}

router.use(session(sess))
*/

module.exports = router;

function getModerator(email){
	return new Promise(function(resolve,reject) {
		connection.query("SELECT * FROM 'modemails' WHERE 'email' = "+email, function (error, results, fields) {
			console.log(results);
			let modEmail = results[0]['email'];
			console.log(modEmail);
			if (error) {
				return reject(error);
			}
			resolve(modEmail);
		});
	});
}

const passport = require('passport');
var userProfile;

router.use(passport.initialize());
router.use(passport.session());

router.get('/moderator-logged-in', async function(req, res, next) 
{	console.log(userProfile);
	if(userProfile){
		email = userProfile['_json']['email'];
		modEmail = await getModerator(email);
		if(email == modEmail){
			res.render('moderator-logged-in');//if user is logged in with approved email
			}
			else{
				res.render('index.pug');//if user logged in the mod login and email isn't in the moderator database
			}
}
			else{
				res.render('moderator');//if user is not logged in and tries to access logged in mod site
			}
  res.render('moderator-logged-in');
});
router.get('/moderator-error', (req, res) => res.send("error logging in"));

passport.serializeUser(function(user, cb) {
	cb(null, user);
});

passport.deserializeUser(function(obj, cb) {
	cb(null, obj);
});

const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const GOOGLE_CLIENT_ID = '736425525258-sl4pa7800796fbqv5fsqpgmef707j49n.apps.googleusercontent.com';
const GOOGLE_CLIENT_SECRET = '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';
passport.use(new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/callback"
  },
  function(accessToken, refreshToken, profile, done) {
      userProfile=profile;
      return done(null, userProfile);
  }
));
 
router.get('/auth/google', 
  passport.authenticate('google', { scope : ['profile', 'email'] }));
 
router.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/moderator-error' }),
  function(req, res) {
    // Successful authentication, redirect success.
    res.redirect('/moderator-logged-in');
  });
var express = require('express');
var router = express.Router();

//connect to posts database (lines 5-23)
var mysql = require('mysql');
var connection = mysql.createConnection(
{
	host	: 'localhost',
	user	: 'bbuser', //to be set by developers
	password: 'bbpassword', //to be set by developers
	database: 'posts'
});

connection.connect(function(err) 
{
	if (err) 
	{
		console.error('error connecting: ' + err.stack);
		return;
	}
	console.log('connected as id ' + connection.threadId);
});

// Handle form submission
router.post('/submit_form', (req, res) => 
{
  const { name, grade, school, anonymous, date, work, story, media } = req.body;

  // Insert data into MySQL database
  const query = `INSERT INTO submissions (name, grade, school, anonymous, date, work, story, media) VALUES ('${name}', '${grade}', '${school}', '${anonymous}', '${date}', '${work}', '${story}', '${media}')`;
  console.log(req["body"]);
  
  connection.query(query, (error, results) => 
  {
    if (error) throw error;
    res.redirect('/volunteer-experiences'); // Redirect to a success page after insertion
  });
  
  //res.redirect('/volunteer-experiences'); // Redirect to a success page after insertion
});


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

module.exports = router;

function getModerator(email){
	return new Promise(function(resolve,reject) {
		connection.query("SELECT * FROM modemails WHERE email = '"+email+"';", function (error, results, fields) {
			if(results.length == 0){
				resolve (false);
			}
			else{
				resolve(true);
			}
			if (error) {
				return reject(error);
			}
		});
	});
}

const passport = require('passport');
var userProfile;

router.use(passport.initialize());
router.use(passport.session());

router.get('/moderator-logged-in', async function(req, res, next) 
{	
	console.log(userProfile);
	if(req.isAuthenticated())
	{
		email = userProfile['_json']['email'];
		modEmail = await getModerator(email);
		if(modEmail == true)
		{
			res.render('moderator-logged-in');//if user is logged in with approved email
		}
		else
		{
			res.redirect('/');//if user logged in the mod login and email isn't in the moderator database
		}
	}
	else
	{
			res.redirect('/moderator');//if user is not logged in and tries to access logged in mod site
	}
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

router.post("/logout", (req,res) => {
	req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/moderator');
	});
})
 
router.get('/auth/google', 
  passport.authenticate('google', { scope : ['profile', 'email'] }));
 
router.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/moderator-error' }),
  function(req, res) {
    // Successful authentication, redirect success.
    res.redirect('/moderator-logged-in');
  });

// Trying to connect post-submission form to the database
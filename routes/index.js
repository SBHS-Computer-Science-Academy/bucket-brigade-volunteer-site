var express = require('express');
var router = express.Router();
var multer = require('multer');
var upload = multer({dest:'uploads/'});
const fs = require("fs");

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
	//console.log('connected as id ' + connection.threadId);
});

  function executeQuery(query) 
  {
	return new Promise(function(resolve, reject) 
	{
		var postId = -1;
		connection.query(query, (error, results) => 
		{
			postId = results["insertId"];
			if (error) //throw error;
			{
				return reject(error);
			}
			resolve(postId);
			
		});
	});
  }  
 

// Handle form submission
router.post('/submit_form', upload.array('media', 10), async(req, res) => 
{
  
  const { name, grade, school, anonymous, date, work, story } = req.body;
  const query = `INSERT INTO submissions (name, grade, school, anonymous, date, work, story, status) VALUES ('${name}', '${grade}', '${school}', '${anonymous}', '${date}', '${work}', '${story}', 'not approved')`; 
  var postId = await executeQuery(query); //this local variable is different from the other postId variable, but it gets the value of the other var.

  media = req["files"] 

	if (media != "")
	{
		for(let x = 0; x < media.length; x++)
		{
			var filePath = './public/images/' + media[x]["filename"] + media[x]["originalname"].substring(media[x]["originalname"].lastIndexOf(".")) 
			fs.renameSync(media[x]["path"], filePath)
				
			// Insert data into MySQL database
			const m_query = `INSERT INTO media (path, id) VALUES ('${filePath}', '${postId}')`;
			await executeQuery(m_query);	
		}	
	}
	res.redirect('/success');
});

router.post('/new-moderator', (req, res) => 
	{
		email = req.body['modEmail'];
	const query = `INSERT INTO modEmails (email) VALUES ('${email}')`;
		
		connection.query(query, (error, results) => 
		{
			if (error) throw error;
			res.redirect('/moderator-logged-in'); // Redirect to a success page after insertion
		});
	});
	
router.post('/remove-moderator', (req,res) =>
	{
		console.log(req.body)
		email = req.body['modEmail'];
		console.log(email)
	const query = `DELETE FROM modEmails WHERE email='${email}'`;
	
		connection.query(query, (error, results) => 
		{
			if (error) throw error;
			res.redirect('/moderator-logged-in'); // Redirect to a success page after removal
		});
	});

/* GET home page. */
router.get('/', function(req, res, next) 
{	
  res.render('index', { title: 'Home', active_page: 'home' });
});

/* GET volunteer hub page. */
router.get('/volunteer-hub', function(req, res, next) 
{
  res.render('hub', { title: 'Volunteer Hub', active_page: 'hub' });
});

/* GET UGC page. */
router.get('/volunteer-experiences', function(req, res, next) 
{
  res.render('experience', { title: 'Volunteer Experience', active_page: 'experience' });
});

router.get('/post-submission', function(req, res, next) 
{
  res.render('submission', { title: 'Volunteer Experience Post Submission', active_page: 'experience' });
});

/* GET moderator page. */
router.get('/moderator', function(req, res, next) 
{
  res.render('moderator', { title: 'Moderator Page' });
});

router.get('/success', function(req, res, next) 
{	
  res.render('success', { title: 'success', active_page: 'success' });
});

module.exports = router;

const session = require('express-session');
router.use(session({
	resave: false,
	saveUninitialized: false,
	secret: 'SECRET' //TODO CHANGE THIS TO ACCESS TO AN ENVIRONMENT VARIABLE
}));

module.exports = router;

function getModerator(email){
	return new Promise(function(resolve,reject) {
		connection.query("SELECT * FROM modEmails WHERE email = '"+email+"';", function (error, results, fields) {
			if(results.length == 0)
			{
				resolve (false);
			}
			else
			{
				resolve(true);
			}
			if (error) 
			{
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
	//console.log(userProfile);
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

// Try using js file for submission and linking it to pug file to validate files. Would need to use similar code in index.js as well.
//DELETE FROM modEmails WHERE email='email';
//saving that for referance

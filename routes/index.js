var express = require('express');
var router = express.Router();
var multer = require('multer');
var upload = multer({dest:'uploads/'});
const fs = require("fs");
require('dotenv').config()

//connect to posts database (lines 5-23)
var mysql = require('mysql');
var connection = mysql.createConnection(
{
	host	: 'localhost',
	user	: process.env.MYSQL_USER, 
	password: process.env.MYSQL_PASSWORD, 
	database: 'posts'
});

module.exports = router;

const session = require('express-session');
router.use(session({
	resave: false,
	saveUninitialized: false,
	secret: process.env.OAUTH_SECRET 
}));

function getMedia() 
{
	return new Promise(function(resolve, reject) 
	{
		connection.query('SELECT * FROM `media`', function (error, results, fields) 
		{
			// error will be an Error if one occurred during the query
			// results will contain the results of the query
			// fields will contain information about the returned results fields (if any)
			
			console.log(results);
			
			if (error) {
				return reject(error);
			}
			
			resolve(results);
		});
	});
}


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
			let filePath = './public/images/' + media[x]["filename"] + media[x]["originalname"].substring(media[x]["originalname"].lastIndexOf(".")) 
			fs.renameSync(media[x]["path"], filePath)	
			let filePath2 = '/images/' + media[x]["filename"] + media[x]["originalname"].substring(media[x]["originalname"].lastIndexOf("."))
			// Insert data into MySQL database
			const m_query = `INSERT INTO media (path, id) VALUES ('${filePath2}', '${postId}')`;
			await executeQuery(m_query);	
		}	
	}
	res.redirect('/success');
});

router.post('/approve-selected', async(req, res) => 
	{
		postid = req.body['postid'];
		const query = `UPDATE submissions SET status='approved' WHERE id=('${postid}')`;
		await executeQuery(query);
		var check = req.body.myCheckbox;
		if(req.body.myCheckbox == null)
		{
			const deny_query = `UPDATE submissions SET story= NULL WHERE id=('${postid}')`;
			await executeQuery(deny_query);
			
		}
		res.redirect('/moderator-logged-in'); // Redirect to a success page after removal
	});
	



router.post('/deny-all', async(req, res) => 
	{
		postid = req.body['postid'];
		const query = `DELETE FROM media WHERE id=('${postid}')`;
		const query2 = `DELETE FROM submissions WHERE id=('${postid}')`;
		
		await executeQuery(query)
		await executeQuery(query2)
		res.redirect('/moderator-logged-in'); // Redirect to a success page after removal
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
router.get('/volunteer-experiences', async function(req, res, next) 
{
	let postList = await getPosts();
	let mediaList = await getMedia();
	res.render('experience', { title: 'Volunteer Experience', active_page: 'experience' , posts: postList, media: mediaList});
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



function getPosts() 
{
	return new Promise(function(resolve, reject) 
	{
		connection.query('SELECT * FROM `submissions` WHERE `status`="approved"', function (error, results, fields) 
		{
			// error will be an Error if one occurred during the query
			// results will contain the results of the query
			// fields will contain information about the returned results fields (if any)
			
			console.log(results);
			
			if (error) {
				return reject(error);
			}
			
			resolve(results);
		});
	});
}

function getMedia() 
{
	return new Promise(function(resolve, reject) 
	{
		connection.query('SELECT * FROM `media`', function (error, results, fields) 
		{
			// error will be an Error if one occurred during the query
			// results will contain the results of the query
			// fields will contain information about the returned results fields (if any)
			
			console.log(results);
			
			if (error) {
				return reject(error);
			}
			
			resolve(results);
		});
	});
}

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

function getList() {
	return new Promise(function(resolve, reject) {
		connection.query('SELECT * FROM `submissions` WHERE `status` = "not approved"', function (error,results, fields) {
			if(error) {
				console.log(error);
				return reject(error);
			}
			resolve(results);
		});
	});
}

router.get('/moderator-logged-in', async function(req, res, next) 
{	
	//console.log(userProfile);
	if(req.isAuthenticated())
	{
		email = userProfile['_json']['email'];
		modEmail = await getModerator(email);
		if(modEmail == true)
		{
			let list = await getList();
			let mediaList = await getMedia();
			res.render('moderator-logged-in', {posts: list, media: mediaList});//if user is logged in with approved email
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

passport.serializeUser(function(user, cb) 
{
	cb(null, user);
});
passport.deserializeUser(function(obj, cb) 
{
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
	function(accessToken, refreshToken, profile, done) 
	{
		userProfile=profile;
		return done(null, userProfile);
	}
));

router.post("/logout", (req,res) => 
{
	req.logout(function(err) 
	{
		if (err) { return next(err); }
		res.redirect('/moderator');
	});
})

router.get('/auth/google', 
	passport.authenticate('google', { scope : ['profile', 'email'] }));
 
router.get('/auth/google/callback', 
	passport.authenticate('google', { failureRedirect: '/moderator-error' }),
	function(req, res) 
	{
		// Successful authentication, redirect success.
		res.redirect('/moderator-logged-in');
	});
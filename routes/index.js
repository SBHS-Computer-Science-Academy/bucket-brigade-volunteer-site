var express = require('express');
var path = require('path');
var router = express.Router();
var multer = require('multer');
var upload = multer({dest:'uploads/'});
const fs = require("fs");
require('dotenv').config();

var mysql = require('mysql');
var sql = require('sql-template-strings');
var connection = mysql.createConnection(
{
	host	: 'localhost',
	user	: process.env.MYSQL_USER, 
	password: process.env.MYSQL_PASSWORD, 
	database: 'posts'
});

module.exports = router;


//server-side form validation
function checkImageType(req)
{
	const acceptedTypes = ['.jpeg', '.jpg', '.png', '.gif', '.mov', '.mp4', '.webm']; // need to test mov, and webm might delete heif
	const acceptedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', ' image/heif-sequence', 'video/mov', 'video/quicktime', 'video/mp4', 'video/webm']; // need to test mov, and webm might delete heif
	console.log("is running");
	
	
	for(let x = 0; x < req["files"].length; x++)
	{
		console.log(req["files"][x]);
		const fileExtension = path.extname(req["files"][x]["originalname"]).toLowerCase();
		const fileMimetype = req["files"][x].mimetype;
		
		if (!(acceptedMimeTypes.includes(fileMimetype) && acceptedTypes.includes(fileExtension))) 
		{
			return false;
		}
	}
	return true; 
};

const session = require('express-session');
router.use(session({
	resave: false,
	saveUninitialized: false,
	secret: process.env.SESSION_SECRET 
}));

const passport = require('passport');
var userProfile;
router.use(passport.initialize());
router.use(passport.session());

const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const GOOGLE_CLIENT_ID = '736425525258-sl4pa7800796fbqv5fsqpgmef707j49n.apps.googleusercontent.com';
passport.use(new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_OAUTH_SECRET,
    callbackURL: "http://localhost:3000/auth/google/callback"
	},
	function(accessToken, refreshToken, profile, done) 
	{
		userProfile=profile;
		return done(null, userProfile);
	}
));

function getMedia() 
{
	const query = sql`SELECT * FROM media`;
	return new Promise(function(resolve, reject) 
	{
		connection.query(query, function (error, results, fields)
		{
			if (error) {
				return reject(error);
			}
			
			resolve(results);
		});
	});
}

function getPostMedia() 
{
	const query = sql`SELECT * FROM media WHERE id = ${postId}`;
	return new Promise(function(resolve, reject) 
	{
		connection.query(query, function (error, results, fields)
		{
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
});

function executeQuery(query) 
{
	return new Promise(function(resolve, reject) 
	{
		connection.query(query, (error, results) => 
		{
			if (error)
			{
				return reject(error);
			}
			resolve(results);
		});
	});
}  

 
 

// Handle form submission
router.post('/submit_form', upload.array('media', 10), async(req, res) => 
{
	if (!checkImageType(req)) 
	{
		return res.status(400).json({  message: 'Please upload a valid image file'});
	}
	else
	{
		const { name, grade, school, anonymous, date, work, story } = req.body;
		const query = sql`INSERT INTO submissions (name, grade, school, anonymous, date, work, story, status) VALUES (${name}, ${grade}, ${school}, ${anonymous}, ${date}, ${work}, ${story}, 'not approved')`; 
		var results = await executeQuery(query);
		var postId = results["insertId"];
		
		
		media = req["files"] 

		if (media != "")
		{
			for(let x = 0; x < media.length; x++)
			{
				let filePath = './public/images/' + media[x]["filename"] + media[x]["originalname"].substring(media[x]["originalname"].lastIndexOf("."));
				fs.renameSync(media[x]["path"], filePath);
				let filePath2 = '/images/' + media[x]["filename"] + media[x]["originalname"].substring(media[x]["originalname"].lastIndexOf("."));
				// Insert data into MySQL database
				//console.log(postId);
				const m_query = sql`INSERT INTO media (path, id) VALUES (${filePath2}, ${postId})`;
				await executeQuery(m_query);	
			}	
		}
		res.redirect('/success');
	}
});

router.post('/approve-selected', async(req, res) => 
{
	postid = req.body['postid'];
	const query = sql`UPDATE submissions SET status='approved' WHERE id=(${postid})`;
	await executeQuery(query);
	var check = req.body.myCheckbox;
	var denied = req.body.denied;
	
	if (Array.isArray(denied))
	{
		for (let i = 0; i < denied.length; i++)
		{
			let query2 = sql`DELETE FROM media WHERE m_id='` + denied[i] + `';`;
			await executeQuery(query2);
		}
	}
	else if (denied == null)
	{
		console.log('No images to deny');
	}
	else
	{
		let query2 = sql`DELETE FROM media WHERE m_id='` + denied + `';`;
		await executeQuery(query2);
	}
	
	if(req.body.myCheckbox == null)
	{
		const deny_query = sql`UPDATE submissions SET story= NULL WHERE id=(${postid})`;
		await executeQuery(deny_query);
		
	}
	res.redirect('/moderator-logged-in'); // Redirect to a success page after removal
});

router.post('/deny-all', async(req, res) => 
{
	postid = req.body['postid'];
	const query = sql`DELETE FROM media WHERE id=(${postid})`;
	const query2 = sql`DELETE FROM submissions WHERE id=(${postid})`;
	await executeQuery(query);
	await executeQuery(query2);
	res.redirect('/moderator-logged-in'); // Redirect to a success page after removal
});

router.post('/new-moderator', async(req, res) => 
{
	email = req.body['modEmail'];
	const query = sql`INSERT INTO modEmails (email) VALUES (${email})`;
	await executeQuery(query);
	res.redirect('/moderator-logged-in'); // Redirect to a success page after insertion
});
	
router.post('/remove-moderator', async(req,res) =>
{
	email = req.body['modEmail'];
	const query = sql`DELETE FROM modEmails WHERE email = ${email}`;
	await executeQuery(query);
	res.redirect('/moderator-logged-in'); // Redirect to a success page after removal
});
	
/* GET home page. */
router.get('/', async function(req, res, next) 
{	
	const query = sql`SELECT * FROM submissions WHERE status = 'approved'`
	const query2 = sql`SELECT * FROM media`
	let postList = await executeQuery(query);
	let mediaList = await executeQuery(query2);
	res.render('index', { title: 'Home', active_page: 'home', posts: postList, media: mediaList});
});

/* GET volunteer hub page. */
router.get('/volunteer-hub', function(req, res, next) 
{
	res.render('hub', { title: 'Volunteer Hub', active_page: 'hub' });
});

/* GET volunteer experiences page. */
router.get('/volunteer-experiences', async function(req, res, next) 
{
	const query = sql`SELECT * FROM submissions WHERE status = 'approved'`
	const query2 = sql`SELECT * FROM media`
	let postList = await executeQuery(query);
	let mediaList = await executeQuery(query2);
	res.render('experience', { title: 'Volunteer Experience', active_page: 'experience' , posts: postList, media: mediaList});
});

/* GET post submission page. */
router.get('/post-submission', function(req, res, next) 
{
	res.render('submission', { title: 'Volunteer Experience Post Submission', active_page: 'experience' });
});

/* GET moderator page. */
router.get('/moderator', function(req, res, next) 
{
	res.render('moderator', { title: 'Moderator Page' });
});

/* GET moderator logged in page. */
router.get('/moderator-logged-in', async function(req, res, next) 
{	
	//console.log(userProfile);
	if(req.isAuthenticated())
	{
		email = userProfile['_json']['email'];
		const query = sql`SELECT * FROM modEmails WHERE email = ${email}`
		results = await executeQuery(query);
		if(results.length == 0)
		{
			res.redirect('/');//if user logged in the mod login and email isn't in the moderator database
		}
		else
		{
			const query = sql`SELECT * FROM submissions WHERE status = 'not approved'`
			const query2 = sql`SELECT * FROM media`
			let list = await executeQuery(query);
			let mediaList = await executeQuery(query2);
			res.render('moderator-logged-in', {posts: list, media: mediaList, title: 'Moderator Page'});//if user is logged in with approved email
		}
	}
	else
	{
			res.redirect('/moderator');//if user is not logged in and tries to access logged in mod site
	}
});

/* GET moderator error page. */
router.get('/moderator-error', (req, res) => res.send("error logging in"));

/* GET success page. */
router.get('/success', function(req, res, next) 
{	
  res.render('success', { title: 'success', active_page: 'success' });
});

module.exports = router;

passport.serializeUser(function(user, cb) 
{
	cb(null, user);
});
passport.deserializeUser(function(obj, cb) 
{
	cb(null, obj);
});

router.post("/logout", (req,res) => 
{
	req.logout(function(err) 
	{
		if (err) { return next(err); }
		res.redirect('/moderator');
	});
})

router.get('/auth/google', passport.authenticate('google', { scope : ['profile', 'email'] }));
 
router.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/moderator-error' }), function(req, res) 
{
	// Successful authentication, redirect success.
	res.redirect('/moderator-logged-in');
});
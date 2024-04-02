var express = require('express');
var router = express.Router();
var multer = require('multer');
var upload = multer({dest:'uploads/'});

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
router.post('/submit_form', upload.single('media'), (req, res) => 
{
	console.log(req["body"]);
  if (!req.file) 
  {
    return res.render('popup', {message: 'Please upload a valid image or video file'});
  }
  // Process the uploaded file
  res.send('File uploaded successfully!');
  
  const { name, grade, school, anonymous, date, work, story, media } = req.body;

  // Insert data into MySQL database
  const query = `INSERT INTO submissions (name, grade, school, anonymous, date, work, story, media, status) VALUES ('${name}', '${grade}', '${school}', '${anonymous}', '${date}', '${work}', '${story}', '${media}', 'not approved')`;
  
  
  connection.query(query, (error, results) => 
  {
    if (error) throw error;
    res.redirect('/volunteer-experiences'); // Redirect to a success page after insertion
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

module.exports = router;


// Try using js file for submission and linking it to pug file to validate files. Would need to use similar code in index.js as well.

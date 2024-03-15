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

module.exports = router;


// Trying to connect post-submission form to the database
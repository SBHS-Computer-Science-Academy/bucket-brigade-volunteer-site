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
	console.log('connected as id ' + connection.threadId);
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

router.get('/success', function(req, res, next) 
{	
  res.render('success', { title: 'success', active_page: 'success' });
});

module.exports = router;


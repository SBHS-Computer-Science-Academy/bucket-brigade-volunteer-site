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

module.exports = router;

var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  res.render('champs', { title: api_key });
  res.type('application/json');
  //res.json({ "api_key": api_key});

});

module.exports = router;

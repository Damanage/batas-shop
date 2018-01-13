var express = require('express');
var router = express.Router();

const conf = require(process.env.CONF || '../../config.json');

var db = require("../../admin/db/db")(conf.db);

router.get('/', function(req, res, next) {

  console.log(req);

  res.status(200).send({
    success: true,
    message: 'Catched'
  });
  
});

module.exports = router;
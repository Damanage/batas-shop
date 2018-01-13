var express = require('express');
var router = express.Router();

const conf = require(process.env.CONF || '../../config.json');
var db = require("../../admin/db/db")(conf.db);

router.get('/', function(req, res, next) {
    db.getPubData()
      .then(
        function (d) {
          res.send(d);
        },
        function (e) {
          console.error(e);
          res.status(403).send({
            success: false,
            message: e
          });
        }
      );
});

module.exports = router;
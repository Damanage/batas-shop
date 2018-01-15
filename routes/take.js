var express = require('express');
var router = express.Router();

var saleprocess = require("../common/sale");
var sale = new saleprocess;

router.get('/:id', function(req, res, next) {
  sale.takeProduct(req.params.id)
  .then (
    function (d) {
      res.status(200).send(d);  
    },
    function (e) {
      res.status(403).send(e);
    }
  );
});

module.exports = router;
var express = require('express');
var router = express.Router();

const conf = require(process.env.CONF || '../../config.json');

var db = require("../../admin/db/db")(conf.db);

router.get('/:id/:file', function(req, res, next) {
  if (req.params.id && req.params.file)
  {
    
    db.getPrvFileUrl(req.params.id, req.params.file)
    .then (function (url) {
      var picrequest = require('request');
      
      var requestSettings = {
          url: url,
          method: 'GET',
          encoding: null
      };
  
      picrequest(requestSettings,
        function (err, picres, picbody) {
          if (err) 
          { 
            res.status(403).send({
              success: false,
              message: 'Error proxy image'
            });
          }
          else 
          {
            res.writeHead(200, {
              'Content-Type': 'image/jpg'
            });
            res.end(picbody);
          }
      });
    })
    .catch (function (e){
      res.status(403).send({
        success: false,
        message: 'Permission denided: ' + e
      });
    });
  }
  else
  {
    res.status(403).send({
      success: false,
      message: 'There is no Product Id or File Name in request body'
    });
  }
});

module.exports = router;
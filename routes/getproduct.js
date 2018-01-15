var express = require('express');
var router = express.Router();

var saleprocess = require("../common/sale");
var sale = new saleprocess;

/*
const conf = require(process.env.CONF || '../../config.json');

var db = require("../../admin/db/db")(conf.db);

var ykassa = require("../common/ykassa");
var ya = new ykassa;


function takeprod (id) {
  return new Promise (function (resolve, reject){
    var pub, prv;
    
    function good () {
      //console.log(prv);
      db.saveBatterySatus(pub._id, 'sold')
      .then ( function () {
        resolve({
          success: true,
          "message" : { 
              pub: pub,
              prv: prv
            }
          }); 
      });
    }
  
    function fail (e) {
      reject ({
        success: false,
        message: e
      });
    }
    
    if (id)
    {
      //Получаем публичные данные
      db.getPubProductById(id)
        .then (
          function (d) {
          
            //Сохраняем публичные данные
            pub = d;
          
            //Получаем приватные данные
            return db.getPrvProductById(id); 
          }
        )
        .catch (function(e) {fail(e)})
        .then(function (d) {
          
          //Сохраняем приватные данные
          prv = d;
          
          //Проверяем наличие факта платежа у нас в базе
          return db.checkPaymentFact(id);
        })
        .then(
          //Развилка
          
          //Факт платежа в нашей базе есть
          function (d) {
            good();
          },
          
          //Факта платежа у нас нет, тогда запросим информацию о нем через кассу
          function (d) {
            //console.log(d);
            ya.checkPayment(pub)
            .then(function (payment) {
              //console.log(payment);
              return db.createPaymentFact(pub._id, payment.id);
            })
            .then(function (fact) {
              good();
            })
            .catch (function(e) {
              fail(e);
            });
          }
        )
        .catch (function(e) {fail(e)});
    }
    else
    {
      fail('There is no Product Id');
    }
  });
}

router.get('/old/:id', function(req, res, next) {
  
  var pub, prv;
  
  function good () {
    //console.log(prv);
    db.saveBatterySatus(pub._id, 'sold')
    .then ( function () {
       res.send ({ 
        pub: pub,
        prv: prv
      }); 
    })
  }

  function fail (e) {
    res.status(403).send({
      success: false,
      message: e
    });
  }
  
  if (req.params.id)
  {
    //Получаем публичные данные
    db.getPubProductById(req.params.id)
      .then (
        function (d) {
        
          //Сохраняем публичные данные
          pub = d;
        
          //Получаем приватные данные
          return db.getPrvProductById(req.params.id); 
        }
      )
      .catch (function(e) {fail(e)})
      .then(function (d) {
        
        //Сохраняем приватные данные
        prv = d;
        
        //Проверяем наличие факта платежа у нас в базе
        return db.checkPaymentFact(req.params.id);
      })
      .then(
        //Развилка
        
        //Факт платежа в нашей базе есть
        function (d) {
          good();
        },
        
        //Факта платежа у нас нет, тогда запросим информацию о нем через кассу
        function (d) {
          //console.log(d);
          ya.checkPayment(pub)
          .then(function (payment) {
            //console.log(payment);
            return db.createPaymentFact(pub._id, payment.id);
          })
          .then(function (fact) {
            good();
          })
          .catch (function(e) {
            fail(e);
          });
        }
      )
      .catch (function(e) {fail(e)});
  }
  else
  {
    fail('There is no Product Id');
  }
});

*/

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
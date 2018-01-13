var express = require('express');
var router = express.Router();

const conf = require(process.env.CONF || '../../config.json');

var db = require("../../admin/db/db")(conf.db);

var ykassa = require("../ykassa/ykassa");
var ya = new ykassa;

router.get('/:id', function(req, res, next) {
  if (req.params.id)
  {
    db.getPubProductById(req.params.id)
      .then(function (d) {
        //console.log(d);
        return ya.createPayment(d);
      })
      /* Не будем хранить запросы на платежы, Яндекс касса делает это за нас в разрезе productid
      .then (function (payment) {
        //console.log(payment);
        return db.savePaymentReq(payment);
      })
      */
      .then (function (data){
        //Анализируем ответ
        var url = conf.shopurl;
        if (data.paid) {
          //Значит товар уже оплачен, отправляем пользователя забрать его
          url += "take/" + req.params.id;
        }
        else {
          //Должен быть url на ЯКассу
          if (data.confirmation && data.confirmation.confirmation_url) {
            url = data.confirmation.confirmation_url;
          } 
          else {
            //Если его нет, не знаю что делать, сделаю ошикбу
            
            //Интересно то, что если запрос идентичный, то вернётся успех и его обработает ветка выше
            //а если нет, то будет ошибка, обработаем только её
            if (data.type == 'error' && data.description == 'Idempotence key duplicated') {
              url += "take/" + req.params.id;
            }
            else {
              return res.status(403).send({
                  success: false,
                  message: 'Unknown error'
                });
            }
          }
        } 
        
        db.saveBatterySatus(req.params.id, 'reserved')
        .then (function(d) {
          res.send({
            success: true,
            url: url
          });
        }); 
      })
      .catch (function(e) {
          console.error(e);
          res.status(403).send({
            success: false,
            message: e
          });
      });
  }
  else
  {
    res.status(403).send({
      success: false,
      message: 'There is no Product Id in request body'
    });
  }
});

module.exports = router;
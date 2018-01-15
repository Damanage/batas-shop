const conf = require(process.env.CONF || '../../config.json');

var db = require("../../admin/db/db")(conf.db);

var ykassa = require("../common/ykassa");
var ya = new ykassa;

function takeProduct (id) {
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

function buyProduct (id) {
  return new Promise (function (resolve, reject) {
    if (id)
    {
      db.getPubProductById(id)
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
          var url;
          if (data.paid) {
            //Значит товар уже оплачен, отправляем пользователя забрать его
            url = "take/" + id;
            return resolve ({
              success: true,
              data: data,
              url: url
            });
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
                url = "take/" + id;
              }
              else {
                return reject ({
                    success: false,
                    message: 'Unknown error'
                  });
              }
            }
          } 
          
          db.saveBatterySatus(id, 'reserved')
          .then (function(d) {
            resolve ({
              success: true,
              data: data,
              url: url
            });
          }); 
        })
        .catch (function(e) {
            console.error(e);
            reject ({
              success: false,
              message: e
            });
        });
    }
    else
    {
      reject ({
        success: false,
        message: 'There is no Product Id in request body'
      });
    }
  });
}

module.exports = function () {
  this.takeProduct = takeProduct;
  this.buyProduct = buyProduct;
};
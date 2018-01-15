const conf = require(process.env.CONF || '../../config.json');

function createPayment (product) {
  return new Promise (function(resolve, reject){
    
    var request = require('request');
    
    var params = {
      method: 'POST',
      uri: 'https://' 
          + conf.YKassa.shopId
          + ':'
          + conf.YKassa.key
          + '@payment.yandex.net/api/v3/payments',
      headers: {
        'Content-Type'    : 'application/json',
        'Idempotence-Key' : product._id
      },
      body: JSON.stringify({
        "amount": {
          "value": product.properties.price,
          "currency": product.properties.currency
        },
        "capture": true,
        "confirmation": {
          "type": "redirect",
          "return_url": conf.shopurl + "take/" + product._id
        }
      })
    };
    
    request(params,
      function (error, response, body) {
        if (error) {
          console.error('Error to create payment:', error);
          reject (error);
        }
        else {
          resolve(JSON.parse(body));
        }
    });
  });
}

function reqPayment (paymentid) {
  return new Promise (function(resolve, reject){
    
    var request = require('request');
    
    var params = {
      method: 'GET',
      uri: 'https://' 
          + conf.YKassa.shopId
          + ':'
          + conf.YKassa.key
          + '@payment.yandex.net/api/v3/payments/' + paymentid,
      headers: {
        'Content-Type'    : 'application/json'
      }
    };
    
    request(params,
      function (error, response, body) {
        if (error) {
          console.error('Error get payment info:', error);
          reject (error);
        }
        else {
          resolve(JSON.parse(body));
        }
    });
  });
}

function checkPayment (product) {
  return new Promise (function (resolve, reject) {
    //Будем создавать запрос на оплату этого товара
    //Если товар
    createPayment(product)
    .then (function(data){
      if (data.paid) {
        //Значит товар уже оплачен, отправляем пользователя забрать его
        resolve(data);
      }
      else {
        if (data.id) {
          reqPayment(data.id)
            .then (function(payment){
              if (payment.paid) {
                resolve(payment);
              }
              else 
              {
                reject(payment);
              }
            });
        } 
        else 
        {
          //Если нет id от запроса
          reject(data);  
        }
      }
    })
    .catch(function (e) {
      reject (e);
    });
  });
} 

module.exports = function () {
  this.createPayment = createPayment;
  this.checkPayment = checkPayment;
};
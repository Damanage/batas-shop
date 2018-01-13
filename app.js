require("console-stamp")(console, {
    pattern:"dd.mm.yyyy HH:MM:ss.l",
    metadata:'[' + process.pid + ']',
});

var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var pubdata = require('./routes/pubdata');
var buy = require('./routes/buy');
var take = require('./routes/take');
var photo = require('./routes/photo');
var kassa = require('./routes/kassa');

var app = express();

app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/buy', buy);
app.use('/take', take);
app.use('/photo', photo);
app.use('/kassa', kassa);

//API with JSON
app.use('/api/pub', pubdata);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.send('error');
});


app.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function () {
  console.info("Shop started on " + (process.env.IP || "0.0.0.0") + ":" + (process.env.PORT || 3000));
});
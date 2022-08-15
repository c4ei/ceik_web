var createError = require('http-errors');
// var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

const express = require("express");
const dotenv = require('dotenv');
const cors = require("cors");
//npm install --save md5
var md5 = require('md5');

// Init express
const app = express();
// Init environment
dotenv.config();
// parse requests of content-type: application/json
// parses incoming requests with JSON payloads
app.use(express.json());
// enabling cors for all requests by using cors middleware
app.use(cors());
// Enable pre-flight
app.options("*", cors());
//###########################
//npm install --save express-session
// npm install --save session-file-store
const session = require('express-session');
const FileStore = require('session-file-store')(session); // 1
app.use(session({  // 2
  secret: process.env.SessionSecret,  // 암호화
  resave: false,
  saveUninitialized: true,
  store: new FileStore()
}));

////////////////////////////////////////////////////////////////////////////////////////////////////////////
app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: false })); // for parsing application/x-www-form-urlencoded
var indexRouter = require('./routes/index');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', cookieParser(process.env.COOKIE_SECRET));
app.use('/', indexRouter);
//####################################

// 404 error
app.all('*', (req, res, next) => {
  const err = new HttpException(404, 'Endpoint Not Found');
  next(err);
  res.render('msgpage', { title: 'oops', msg : '500 error '+err+''});
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  console.log(getCurTimestamp()+": app 178 - error" + err);
  res.render('error',{'msg' :err});
  // res.render('msgpage', { title: 'oops', msg : '500 error '+err+''});
});

// const port = Number(process.env.PORT || 3331);
// // starting the server
// app.listen(port, () =>
//     console.log(`🚀 Server running on port ${port}!`));
function getCurTimestamp() {
  const d = new Date();

  return new Date(
    Date.UTC(
      d.getFullYear(),
      d.getMonth(),
      d.getDate(),
      d.getHours(),
      d.getMinutes(),
      d.getSeconds()
    )
  // `toIsoString` returns something like "2017-08-22T08:32:32.847Z"
  // and we want the first part ("2017-08-22")
  ).toISOString().replace('T','_').replace('Z','');
}

module.exports = app;

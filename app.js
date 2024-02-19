var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var hbs = require('express-handlebars'); // Require Handlebars
const Handlebars = require('handlebars');
const { allowInsecurePrototypeAccess } = require('@handlebars/allow-prototype-access');
var userRouter = require('./routes/user');
var adminRouter = require('./routes/admin');

var app = express();
var fileUpload=require('express-fileupload');
var db=require('./config/connection.js')
var session=require('express-session')
// Configure Handlebars as the view engine
app.engine(
  'hbs',
  hbs.engine({
    extname: 'hbs',
    defaultLayout: 'layout',
    layoutsDir: __dirname + '/views/layout/',
    partialsDir: __dirname + '/views/partials/',
    handlebars: allowInsecurePrototypeAccess(Handlebars),
  })
);

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// Other middleware and routes
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({secret:"Key",cookie:{maxAge:60000}}))
db.connect();
// console.log('After connecting to the database');


app.use(fileUpload());
app.use('/', userRouter);
app.use('/admin', adminRouter);

// Error handling middleware
app.use(function (req, res, next) {
  next(createError(404));
});

app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

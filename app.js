var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var bodyParser = require('body-parser');
var hbs = require('express-handlebars');
var usersRouter = require('./routes/users');
var adminRouter = require('./routes/admin');
var fileUpload = require('express-fileupload');
var db = require('./config/connection');
var session = require('express-session');
var nocache=require('nocache');
const { handlebars } =hbs.create({});

var app = express();
app.use(bodyParser.urlencoded({ extended: true}));
app.use(bodyParser.json());

handlebars.registerHelper('eq', function(a, b) { 
  return a === b; 
});

handlebars.registerHelper('multiply', function(a, b) {
  return a * b;
});

handlebars.registerHelper('formatDate', function (date) { 
  let options = { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' }; 
  return new Date(date).toLocaleDateString('en-GB', options); 
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.engine('hbs', hbs.engine({
  extname: 'hbs',
  defaultLayout: 'layout',
  layoutsDir: __dirname + '/views/layout/',
  partialsDir: __dirname + '/views/partials',
  runtimeOptions: { 
    allowProtoPropertiesByDefault: true, 
    allowProtoMethodsByDefault: true, }
})) 
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(fileUpload())
app.use(nocache())
app.use(session({ 
  secret: 'Key',
  cookie: {maxAge:60000000} 
})); 

db.connect((err)=>{
  if(err) console.log('connection error');
  else console.log('connection success');
});

app.use('/', usersRouter);
app.use('/admin', adminRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  
  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
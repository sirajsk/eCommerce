var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session=require('express-session')
var fileUpload=require('express-fileupload')
require('dotenv').config()


var userRouter = require('./routes/user');
var adminRouter = require('./routes/admin');
var hbs=require('express-handlebars')
var db=require('./config/connection')
const Mongostore=require('connect-mongo')

db.connect((err)=>{
  if(err){
    console.log('connection error'+err);
  }
  else{
    console.log('DB connected');
  }
})
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.engine('hbs',hbs({extname:'hbs',defaultLayout:'layout',layoutsDir:__dirname+'/views/layout/',partialsDir:__dirname+'/views/partials/'}))

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(fileUpload())

//user  session start
app.use(session({
  secret:"Key",
  resave:false,
  saveUninitialized:true,
  store:Mongostore.create({
    mongoUrl:`mongodb+srv://siraj:siraj123@projuctebuy.6vcgq.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`,
    ttl:2*24*60*60,
    autoRemove:'native'

  }),
  cookie:{maxAge:600000}
})) 
// user session end
app.use('/', userRouter);
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

var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');
var mongoose = require('mongoose');

// var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var punchclockRouter = require('./routes/punchclock');
var authRouter = require('./routes/auth')

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.set('trust proxy', 1);
app.enable('trust proxy');

app.use( cors({
    origin: [process.env.REACT_APP_URI]
  })
);

// app.use(cors());

// app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/punchclock', punchclockRouter);
app.use('/auth', authRouter);

mongoose
    .connect(process.env.MONGODB_URI)
    .then((res) => {
        console.log(`Connected to Mongo! Database name: '${res.connections[0].name}'`);
    })
    .catch((err) => {
        console.log('Error connecting to mongo: ', err);
    })

module.exports = app;
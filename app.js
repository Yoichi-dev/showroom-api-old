'use strict';

let express = require('express');
let path = require('path');
let cookieParser = require('cookie-parser');
let logger = require('morgan');
let helmet = require('helmet');

let indexRouter = require('./routes/index');
let usersRouter = require('./routes/users');
let eventsRouter = require('./routes/events');
let historiesRouter = require('./routes/histories');
let avatarsRouter = require('./routes/avatars');
let minecraftRouter = require('./routes/minecraft');

let app = express();

app.use(helmet());

app.use((req, res, next) => {
    // res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Origin", "https://point-history.yoichi.dev https://niconico-showroom.yoichi.dev");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/api/users', usersRouter);
app.use('/api/events', eventsRouter);
app.use('/api/histories', historiesRouter);
app.use('/api/avatars', avatarsRouter);
app.use('/api/minecraft', minecraftRouter);

module.exports = app;

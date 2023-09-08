require("dotenv").config();
const mongoose = require("mongoose");
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const http = require('http');
const socketIOServer = require('socket.io');
const { v4: uuidv4 } = require('uuid');

const path = require('path');

const UserRoute = require('./routes/UserRoute');
const socket = require('./socket.js');

mongoose.connect("mongodb://127.0.0.1:27017/test");
const {
  sessionSecret
} = process.env;

const app = express();
const server = http.createServer(app);

const io = socketIOServer(server);

app.use(session({
  secret: sessionSecret,
  resave: false,
  saveUninitialized: false,
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static(path.join(__dirname, 'public')));

app.set('socketio', io);
app.use('/', UserRoute);
server.listen(8080, () => console.log("Server started on port"));

socket.socketOn(io);
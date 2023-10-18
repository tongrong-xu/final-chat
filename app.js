const dotenv = require("dotenv");
dotenv.config();
const mongoose = require("mongoose");
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const http = require('http');
const socketIOServer = require('socket.io');
const {
  v4: uuidv4
} = require('uuid');

const path = require('path');

const UserRoute = require('./routes/UserRoute');
const socket = require('./socket.js');

mongoose
  .connect(process.env.DBServerUrl)
  .then(x => console.log(`Connected the Database: "${x.connections[0].name}"`))
  .catch(err => console.error('Error connecting to mongo', err));

const app = express();
const server = http.createServer(app);
const io = socketIOServer(server);
app.set('socketio', io);
app.use(session({
  secret: 'cai39kf299fk03k0f29',
  resave: false,
  saveUninitialized: true,
  cookie: {
    maxAge: 5 * 60 * 1000
  }
}));


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/', UserRoute);
server.listen(4000, () => console.log("Server started on port"));

socket.socketOn(io);
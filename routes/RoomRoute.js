//RoomRoute.js
const express = require('express');
const Room = express.Router();
const RoomController = require('../controllers/RoomController');
const bodyParser = require('body-parser');
Room.use(bodyParser.json());
const auth = require('../middlewares/auth');

Room.post('/', auth.requireLogin, RoomController.create);

Room.get('/Room_:roomCode', auth.requireLogin, RoomController.classroom);

Room.post('/joinClassroom', auth.requireLogin, RoomController.joinClassroom);

Room.post('/GoChat', auth.requireLogin, RoomController.GoChat);

Room.post('/topic', auth.requireLogin, RoomController.topic);

Room.use(express.static('public'));

module.exports = Room;
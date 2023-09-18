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

Room.get('/topic', auth.requireLogin, auth.isteacher, RoomController.topic);

Room.post('/topic', auth.requireLogin, auth.isteacher, RoomController.topic);

Room.post('/topic/QuestionBankName', auth.requireLogin, auth.isteacher, RoomController.QuestionBankName);

Room.post('/topic/Questiontopic', auth.requireLogin, auth.isteacher, RoomController.Questiontopic);

Room.post('/topic/QuestionBanktopic', auth.requireLogin, RoomController.QuestionBanktopic);

Room.use(express.static('public'));

module.exports = Room;
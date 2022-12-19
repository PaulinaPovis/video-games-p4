const { Router } = require('express');
const { userController } = require('../controller/UserController');
const { roomController } = require('../controller/RoomController');
const router = Router();

    router.post('/rooms', roomController.createRoom);
    router.get('/rooms', roomController.getAllRooms);
    router.get('/rooms/:id',roomController.getRoomById);
    router.delete('/rooms/:id',roomController.deleteRoomById);
    router.put('/rooms/:id',roomController.updateRoomById);
    router.post('/rooms/:id/users', roomController.addUserOnRoom);
    router.get('/rooms/:id/users', roomController.addUserOnRoom);

    router.delete('/rooms/:id/users/:id_user', roomController.deleteUserOnRoom);

    module.exports = router;
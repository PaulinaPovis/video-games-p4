const { Router } = require('express');
const { userController } = require('../controller/UserController');
const { roomController } = require('../controller/RoomController');
const router = Router();

    router.post('/users', userController.createUser);
    router.post('/users/:id/scores', userController.addScoresOnUser);

    router.get('/users', userController.getAllUsers);
    router.get('/users/:id',userController.getUserById);
    router.delete('/users/:id',userController.deleteUserById);
    router.put('/users/:id',userController.updateUserById);
    router.post('/login',userController.login);
   

    module.exports = router;
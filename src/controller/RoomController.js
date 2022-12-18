const { roomData } = require("../data/RoomData");
const { request, response } = require("express");
const { Rooms } = require("../database/schema/Rooms");
class RoomController {
  
  async getAllRooms(req, res = response) {
    
    // retorna todos las rooms
    const rooms = await Rooms.find({});
    res.status(200);
    res.json(rooms);

  }

  async getRoomById(req = request, res = response) {

    const { id } = req.params;
    try {
      const room = await Rooms.findById(id).exec();

      if(!room)
        throw new Error("Room not found by id " + id);

      res.status(200);
      res.json(room);
    } catch (e) {
      console.error(e);
      res.status(400);
      res.json({ msg:  "Room not found by id " + id });
     
    }

  }

  async deleteRoomById(req = request, res = response) {
    
    const { id } = req.params;
    try {
      //borramos el room
      console.log("el id es", id);
      await Rooms.deleteOne({ _id: id });
      res.status(204);
      res.json();
    } catch (e) {
      res.status(400);
      res.json({ msg: "" + e });
    }

  }

  updateRoomById(req = request, res = response) {
    const { id } = req.params;
    console.log("id " + id);
    const room = roomData.rooms.find((u) => u.id == id);
    console.log("room" + room);
    res.status(200);
    res.json(room);
  }

  createRoom(req = request, res = response) {
    try {
      const room = req.body;
      //creando el objeto que se insertara en mongodb
      const rooms = new Rooms(req.body);
      // guardando el objecto rooms en mongo
      rooms.save();
      res.status(200);
      res.json(rooms);
    } catch (e) {
      res.status(400);
      res.json({ msg: "" + e });
    }
  }

  addUserOnRoom(req = request, res = response) {
    const user = req.body;
    const { id } = req.params;

    var isAddUser = false;

    const selectedRoom = roomData.rooms.find((item) => item.id == Number(id));
    console.log(selectedRoom);

    roomData.rooms.forEach((room) => {
      if (room.players.some((item) => item.id === Number(user.id))) {
        isAddUser = true;
      }
    });

    if (selectedRoom.players.length < 2 && !isAddUser) {
      selectedRoom.players.push(user);
      res.status(200);
      res.json(roomData.rooms);
    } else if (selectedRoom.players.length === 2) {
      res.status(400);
      res.json({ mssg: "The room is full! Please choose another room!" });
    } else {
      res.status(400);
      res.json({ mssg: "You are already in a room, please exit the room!" });
    }
  }

  deleteUserOnRoom(req = request, res = response) {
    const user = req.body;
    const { id } = req.params;
    console.log("idRoom delete ", id);
    roomData.rooms.forEach((r) => {
      if ((u) => u.id == id) {
        const plays = r.players.filter((f) => f.id != user.id);
        r.players = plays;
      }
    });

    res.status(200);
    res.json(roomData.rooms);
  }
}

const roomController = new RoomController();
module.exports = { roomController };

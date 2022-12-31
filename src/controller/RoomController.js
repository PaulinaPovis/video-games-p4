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

      if (!room) throw new Error("Room not found by id " + id);

      res.status(200);
      res.json(room);
    } catch (e) {
      console.error(e);
      res.status(400);
      res.json({ msg: "Room not found by id " + id });
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

  async addUserOnRoom(req = request, res = response) {
    const user = req.body;
    const { id } = req.params;
    try {
      const room = await Rooms.findById(id).exec();
      // si no existe el room que se envia damos error porque no se puede agregar usuario
      if (!room) throw new Error("Room not found by id " + id);

      console.log("players ", room.players);

      if (room.players == null) {
        await Rooms.updateOne({ _id: id }, { $set: { players: req.body } });
      } else {
        const userRepeat = room.players.filter(
          (p) => p.userName == user.userName
        );

        if (userRepeat.length > 0)
          throw new Error(
            "For Room " + id + " already exists player " + user.userName
          );

        if (room.players != null && room.players.length == 2)
          throw new Error("For Room " + id + " already has 2 players");

        await Rooms.updateOne(
          { _id: id },
          { $addToSet: { players: req.body } }
        );
      }
      
      const roomResponse = await Rooms.findById(id).exec();
      res.status(200);
      res.json(roomResponse);
    } catch (e) {
      console.log(e);
      res.status(400);
      res.json({ msg: "" + e });
    }
  }

  async deleteUserOnRoom(req = request, res = response) {
    const { id, id_user } = req.params;

    console.log("idRoom delete ", id, id_user);
    try {
      // const room = await Rooms.findById(id).exec();
      // // si no existe el room que se envia damos error porque no se puede agregar usuario
      // if (!room) throw new Error("Room not found by id " + id);

      // const playerUpdated = room.players.filter((p) => p.id != id_user);

      // await Rooms.updateOne({ _id: id }, { $set: { players: null } });

      // if (playerUpdated.length > 0)
      //   await Rooms.updateOne(
      //     { _id: id },
      //     { $set: { players: playerUpdated } }
      //   );
      // await Rooms.updateOne({_id: id}, {$pull: {players: id_user}})

      // await Rooms.updateOne({ _id: id.trim() }, {
      //     $pullAll: {
      //       players: [{_id: id_user.trim()}],
      //     },
      // });

      const room = await Rooms.updateOne({ _id: id.trim() }, {
            $pull: {
              players: {_id: id_user.trim()},
            },
        });
    
      res.status(204);
      res.json();
    } catch (e) {
      res.status(400);
      res.json({ msg: "" + e });
    }
  }
}

const roomController = new RoomController();
module.exports = { roomController };

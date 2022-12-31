const { mongoose } = require("mongoose");

const schemaAvatar = new mongoose.Schema({

  id: Number,
  name: String,
  message: String

});

const schemaPlayer = new mongoose.Schema({
  id:{ type: String, required: true },
  userName: { type: String, required: true },
  avatar: schemaAvatar

});

const schema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    image: String,
    players: [schemaPlayer],
  },
  { autoCreate: true }
);

const Rooms = mongoose.model("Rooms", schema);
module.exports = { Rooms };

const { mongoose } = require("mongoose");

const schemaPlayer = new mongoose.Schema({
  id:{ type: String, required: true },
  userName: { type: String, required: true },
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

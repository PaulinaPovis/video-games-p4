const { mongoose } = require("mongoose");
const schemaScore = new mongoose.Schema({
  percentage: String,
  playerRival: String,
  roomId: Number,
  gameId: Number,
});

const schema = new mongoose.Schema(
  {
    id: {type:String, readOnly:true},
    userName: { type: String, required: [true, "userName is mandatory"],unique:true },
    email: { type: String, required:[true, "email is mandatory"],unique:true },
    password: { type: String, required: [true, "password is mandatory"] },
    avatar: String,
    scores: [schemaScore]
  },
  { autoCreate: true }
);

const Users = mongoose.model("Users", schema);
module.exports = { Users };

const { mongoose } = require("mongoose");
const schemaScore = new mongoose.Schema({
  percentage: {type:String,required:[true,'The percentage is mandatory']},
  playerRival: {type:String,required:[true,'The name of playerRival is mandatory']},
  roomId: {type:String,required:[true,'The room is mandatory']},
  gameId: Number,
});

const schemaAvatar = new mongoose.Schema({

    id: Number,
    name: String,
    message: String

});

const schema = new mongoose.Schema(
  {
    id:{type:String, transform: v=> v._id},
    userName: { type: String, required: [true, "userName is mandatory"],unique:true },
    email: { type: String, required:[true, "email is mandatory"],unique:true },
    password: { type: String, required: [true, "password is mandatory"] },
    avatar: schemaAvatar,
    scores: [schemaScore]
  },
  { autoCreate: true },
  {id:false}
);

const Users = mongoose.model("Users", schema);
module.exports = { Users };

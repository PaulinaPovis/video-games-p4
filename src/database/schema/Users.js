const { mongoose } = require('mongoose');
const schema  = new mongoose.Schema({
    id:Number,
    userName: {type:String, required:true},
    email: {type:String, required:true},
    password: String,
    avatar:String,
    color:String
   
  },{autoCreate:true});

const Users = mongoose.model('Users',schema);
module.exports = {Users};
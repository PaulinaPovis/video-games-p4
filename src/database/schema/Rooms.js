const { mongoose } = require('mongoose');
const schema  = new mongoose.Schema({
    id:Number,
    name: {type:String, required:true},
    description: {type:String, required:true},
    image: String,
    players:[]
   
   
  },{autoCreate:true});

const Rooms = mongoose.model('Rooms',schema);
module.exports = {Rooms};
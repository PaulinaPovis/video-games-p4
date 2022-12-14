// getting-started.js
const { mongoose } = require('mongoose');
require('dotenv').config();
const MONGO_CONNECTION_URL = process.env.MONGO_CONNECTION_URL;
const MONGO_DATABASE = process.env.MONGO_DATABASE;

class Connection {


    connectToDB = async () => {

        try {
            await mongoose.connect(MONGO_CONNECTION_URL);
           // mongoose.connection.useDb('videosgames');

           // mongoose.useDb(MONGO_DATABASE);
           // mongoose.set('strictQuery',false);
            console.log('Mongo is connected');
        } catch (error) {
            console.error(error);
            process.exit();
        }

    }

}
const connection = new Connection();
module.exports ={connection};
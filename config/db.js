const mongoose = require('mongoose');
const config = require('config'); // get config for DB from config file
const db = config.get('mongoURI');

// mongoose.connect returns a promise, use async await 
const connectDB = async() => {
    try {
        await mongoose.connect(db, {
            useUnifiedTopology: true,
            useCreateIndex: true,
            useNewUrlParser: true
        });
        console.log("Mongo DB connected");
    } catch (error) {
        console.log(err.message);
        process.exit(1); // exit process with failure
    }
}

module.exports = connectDB;
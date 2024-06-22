const mongoose = require('mongoose');

const connect = mongoose.connect("mongodb://localhost:27017/Blog-Website");

connect.then(() => {
    console.log("Database Connected Successfully");
}).catch((error) => {
    console.error("Error connecting to database:", error);
    console.log("Database cannot be Connected");
});

const Loginschema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    }
});

const collection = mongoose.model("users", Loginschema);

module.exports = collection;



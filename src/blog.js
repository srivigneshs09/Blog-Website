const mongoose = require('mongoose');

const connect = mongoose.connect("mongodb://localhost:27017/Blog-Website");

connect.then(() => {
    console.log("Database Connected Successfully");
}).catch((error) => {
    console.error("Error connecting to database:", error);
    console.log("Database cannot be Connected");
});

const BlogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  image: { data: Buffer, contentType: String },
  createdAt: { type: Date, default: Date.now }
});

const collection1 = mongoose.model('blogs', BlogSchema);
module.exports = collection1

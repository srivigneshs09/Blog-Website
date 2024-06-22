const moment = require('moment');
const express = require("express");
const path = require("path");
const bcrypt = require('bcryptjs');
const multer = require('multer');
const fs = require('fs');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);

const collection = require("./config");
const collection1 = require("./blog");

const port = 3000;
const app = express();

const store = new MongoDBStore({
    uri: 'mongodb://localhost:27017/session-store',
    collection: 'sessions'
});

store.on('error',function(error){
    console.error('Session store error:',error);
});

app.use(session({
    secret: 'your-secret-key', 
    resave: false, 
    saveUninitialized: false,
    store: store 
}));

app.use(express.json());

app.use(express.static("public"));

app.use(express.urlencoded({ extended: false }));

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.set("view engine", "ejs");

app.get("/", (req, res) => {
    res.render("login");
});

app.get("/signup", (req, res) => {
    res.render("signup");
});

app.get("/home", async (req, res) => {
    try {
        const blogs = await collection1.find({}).sort({ createdAt: -1 });
        const success = req.query.success === "true";
        res.render("home", { blogs: blogs, moment: moment, success: success });
    } catch (error) {
        console.error("Error retrieving blogs:", error);
        res.status(500).send("An error occurred while retrieving blogs");
    }
});



app.get("/blog",(req,res) => {
    res.render("blog");
})

app.post("/signup", async (req, res) => {

    const { username, password } = req.body;

    const existingUser = await collection.findOne({ username: username });

    if (existingUser) {
        return res.send('User already exists. Please choose a different username.');
    }

    try {
        const saltRounds = 10; 
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const newUser = {
            username: username,
            password: hashedPassword
        };

        await collection.create(newUser);

        res.redirect("/");
    } catch (error) {
        console.error("Error during user registration:", error);
        res.status(500).send("An error occurred during user registration");
    }
});

app.post("/login", async (req, res) => {
    try {
        const { username, password } = req.body;

        console.log("Logging in with username:", username);

        const user = await collection.findOne({ username: username });

        if (!user) {
            return res.send("User not found");
        }

        const isPasswordMatch = await bcrypt.compare(password, user.password);

        if (!isPasswordMatch) {
            return res.send("Incorrect password");
        }

        req.session.username = username;

        let isAdmin = false;
        if (username === "admin") {
            isAdmin = true;
        }
        console.log("isAdmin:", isAdmin);

        res.redirect("home");

    } catch (error) {
        console.error("Error during login:", error);
        res.send("An error occurred during login");
    }
});

app.post('/blog', upload.single('image'), (req, res) => {
    const { title, description } = req.body;
    const image = {
        data: req.file.buffer.toString('base64'),
        contentType: req.file.mimetype
    };

    const newBlog = new collection1({ title, description, image });
    newBlog.save()
        .then(() => {
            console.log('Blog saved successfully');
            res.redirect('/home?success=true');
        })
        .catch((err) => {
            console.error('Error saving blog:', err);
            res.status(500).send('Error saving blog');
        });
});

app.get('/search', async (req, res) => {
    const query = req.query.query;
    try {
        const blogs = await collection1.find({ $or: [{ title: new RegExp(query, 'i') }, { description: new RegExp(query, 'i') }] });
        res.render('home', { blogs, moment, success: false });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

app.use(express.static('public'));

app.listen(port, () => {
    console.log(`Server listening on port ${port}`)
});
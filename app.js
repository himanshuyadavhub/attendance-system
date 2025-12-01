const express = require("express");
const path = require('path');
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const config = require("config");

const userRoutes = require("./routes/userRoutes");
const adminRoutes = require("./routes/adminRoutes");
const studentRoutes = require("./routes/studentRoutes");

const isStudent = require("./middleware/is-student");
const isAdmin = require("./middleware/is-admin");

const connectDB = require("./config/db");
const mongoURI = config.get("mongoURI");

const app = express();
connectDB();

const store = new MongoDBStore({
  uri: mongoURI,
  collection: "mySessions",
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: false,
    store: store,
  })
);

app.use(express.static(path.join(__dirname,'public')))

// Routes:

// Landing Page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'views', 'home.html'));
});

app.use("/user", userRoutes);
app.use("/admin", adminRoutes);
app.use("/student", studentRoutes);



// LOGOUT:
app.post("/logout",(req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.log(err)
    }
  })

  res.status(200).json({ message: "Logged out successfully" });
});





app.listen(5000, console.log("App Running on http://localhost:5000"));

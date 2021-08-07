const express = require("express");
const routes = require("./controllers/routes");
const mongoose = require("mongoose");
const uri = require("./config/mongoURI");
const expressSession = require("express-session");
const cookieParser = require("cookie-parser");
var MemoryStore = require("memorystore")(expressSession);
const passport = require("passport");
const flash = require("connect-flash");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

app.set("view engine", "ejs");
app.set("views", __dirname + "/views/templates");
app.use("/assets", express.static(__dirname + "/assets"));
app.use("/alumni/assets", express.static(__dirname + "/assets"));
app.use("/admin/assets", express.static(__dirname + "/assets"));
app.use("/mentee/assets", express.static(__dirname + "/assets"));
app.use("/mentor/assets", express.static(__dirname + "/assets"));
mongoose
  .connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
  })
  .then(() => console.log("Connected!"));

app.use(cookieParser("random"));
app.use(
  expressSession({
    secret: "random",
    resave: true,
    saveUninitialized: false,
    maxAge: 60 * 1000,
    store: new MemoryStore({
      checkPeriod: 86400000,
    }),
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use((req, res, next) => {
  res.locals.success_message = req.flash("success_message");
  res.locals.error_message = req.flash("error_message");
  res.locals.error = req.flash("error");
  next();
});
app.use(routes);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log("Started on PORT: " + PORT));

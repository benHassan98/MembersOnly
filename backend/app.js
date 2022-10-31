require("dotenv").config();
const createError = require("http-errors");
const express = require("express");
const logger = require("morgan");
const indexRouter = require("./routes/index");
const messageRouter = require("./routes/message");
const passport = require("./config/passport");
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");
const cookieParser = require('cookie-parser');



const app = express();

mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.use(
  cors({
    origin: process.env.APP_URL,
    credentials:true
  })
);

app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(passport.initialize());
app.use(logger("dev"));


app.use("/message", messageRouter);
app.use("/", indexRouter);

app.use(function (req, res, next) {
  next(createError(404));
});

app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.json({ message: err.message });
});

module.exports = app;

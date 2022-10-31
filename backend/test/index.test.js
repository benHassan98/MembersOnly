require("dotenv").config();
const bcrypt = require("bcryptjs");
const User = require("../models/user");
const initializeMongoServer = require("../mongoConfigTesting");
const express = require("express");
const indexRouter = require("../routes/index");
const passport = require("../config/passport");
const bodyParser = require("body-parser");
const client = require("../config/redisClient");
const cookieParser = require('cookie-parser');

const app = express();

const request = require("supertest");
process.env.CODE = "123";
process.env.ADMIN = "123";
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(passport.initialize());



app.use("/", indexRouter);
app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.json({ message: err.message });
});

describe("/", () => {
  let token;

  before(async () => {
    await initializeMongoServer();
    await client.set("tokens", "");

    for (let i = 0; i < 5; i++) {
      let user = new User({
        userName: `fake${i + 1}`,
        password: `fakepassword${i + 1}`,
        isAdmin: false,
        isMember: false,
      });
      let hashed_password = await bcrypt.hash(user.password, 10);
      user.password = hashed_password;
      await user.save();
    }
   
  });

  it("should signUp", (done) => {
    request(app)
      .post("/signup")
      .send({
        username: "fake",
        password: "12345",
        passwordconfirm: "12345",
      })
      .expect(200)
      .then((res) => {
        if (res.body.message !== "User Created")
          throw new Error("User should be created");

        done();
      });
  });

  it("should login", (done) => {
    request(app)
      .post("/login")
      .send({ username: "fake", password: "12345" })
      .expect(200)
      .then((res) => {
        if (res.body.message !== "User LoggedIn")
          throw new Error("User should be loggedIn");
          token = res.body.token;
        done();
      });
  });

  it("login wih wrong credintials should throw error", (done) => {
    request(app)
      .post("/login")
      .send({ username: "fake", password: "123455555" })
      .expect(401)
      .then((res) => {
        if (res.body.message !== "Unauthorized")
          throw new Error("user should be unauthorized");

        done();
      });
  });

  it("should promote user to member", (done) => {
    request(app)
    .post("/become_member")
    .set("Cookie", `token=${token}`)
    .send({
      username: "fake",
      memberpassword: "123",
    })
    .expect(200)
    .then((res) => {
      if (res.body.message !== "User got the membership")
        throw new Error("User should be a member");
      done();
    });      

    
    
  });

  it("user should be unauthroized when using another user's token", (done) => {
    request(app)
      .post("/login")
      .send({ username: "fake1", password: "fakepassword1" })
      .then(() => {
        request(app)
          .post("/become_member")
          .set("Cookie", `token=${token}`)
          .send({
            username: "fake1",
            memberpassword: "123",
          })
          .expect(401)
          .then((res) => {
            if (res.body.message !== "Unauthorized")
              throw new Error("user shouold be unauthroized");
            done();
          });
      });
  });

  it("should promote user to admin", (done) => {
    request(app)
      .post("/become_admin")
      .set("Cookie", `token=${token}`)
      .send({ username: "fake", adminpassword: "123" ,})
      .expect(200)
      .then((res) => {
        if (res.body.message !== "User became admin")
          throw new Error("user should be an admin");
        done();
      });
  });

  it("should logout", (done) => {
    request(app)
      .post("/logout")
      .set("Cookie", `token=${token}`)
      .send({ username: "fake" ,})
      .expect(200)
      .then((res) => {
        if (res.body.message !== "User LoggedOut")
          throw new Error("user should be logged out");
        done();
      });
  });

});

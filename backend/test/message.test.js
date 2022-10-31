require("dotenv").config();
const bcrypt = require("bcryptjs");
const User = require("../models/user");
const Message = require("../models/message");
const initializeMongoServer = require("../mongoConfigTesting");
const express = require("express");
const cookieParser = require("cookie-parser");
const messageRouter = require("../routes/message");
const indexRouter = require("../routes/index");
const passport = require("../config/passport");
const bodyParser = require("body-parser");
const client = require("../config/redisClient");
const app = express();

const request = require("supertest");

process.env.CODE = "123";
process.env.ADMIN = "123";
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(passport.initialize());
app.use("/message", messageRouter);
app.use("/", indexRouter);

app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.json({ message: err.message });
});
describe("/message", () => {
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

      let message = new Message({
        author: user._id,
        title: `fake title${i + 1}`,
        content: `fake content${i + 1}`,
        time_stamp: new Date().toDateString(),
      });
      await message.save();
    }
    await request(app)
      .post("/login")
      .send({ username: "fake1", password: "fakepassword1" })
      .expect(200)
      .then((res) => {
        token = res.body.token;
      });
  });

  it("should return all messages", (done) => {
    request(app)
      .get("/message/all")
      .expect((res) => {
        if (res.body.documents.length !== 5)
          throw new Error("should return all messages");
      })
      .end(done);
  });
  it("should create message", (done) => {
    request(app)
      .post("/message/create")
      .set("Cookie", `token=${token}`)
      .send({ title: "title", content: "content", username: "fake1" })
      .expect(200)
      .then((res) => {
        if (res.body.message !== "Message Created")
          throw new Error("Message should be created");
        done();
      });
  });

    it("shouldn't delete message if not admin", (done) => {
      request(app)
        .get("/message/all")
        .expect(200)
        .then((res) => {
          const messages = res.body.documents;
          request(app)
            .post("/message/delete/" + messages[0]._id)
            .set('Cookie',`token=${token}`)
            .send({username:'fake1',})
            .expect(401)
            .then((res) => {
              if (res.body.message !== "Unauthorized")
                throw new Error("User should be unauthorized");
              done();
            });
        });
    });

  it('should delete message if user is admin',(done)=>{
    request(app)
    .post("/become_admin")
    .set('Cookie',`token=${token}`)
    .send({ username: "fake1", password: "fakepassword1" ,adminpassword:'123',})
    .expect(200)
    .then(()=>{
      request(app)
        .get("/message/all")
        .expect(200)
        .then((res) => {
          const messages = res.body.documents;
          request(app)
            .post("/message/delete/" + messages[0]._id)
            .set('Cookie',`token=${token}`)
            .send({username:'fake1'})
            .expect(200)
            .then((res) => {
              if (res.body.message !== "Message Deleted")
                throw new Error("Message should be deleted");
              done();
            });
        });

    });

  });
});

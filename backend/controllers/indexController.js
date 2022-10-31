require("dotenv").config();
const { body, validationResult } = require("express-validator");
const createError = require("http-errors");
const bcrypt = require("bcryptjs");
const User = require("../models/user");
const passport = require("../config/passport");
const client = require("../config/redisClient");
const filterAndValidateToken = require("../helpers/filterAndValidateToken");
const jwt = require("jsonwebtoken");
const _ = require("lodash");
exports.signup = [
  body("username")
    .trim()
    .escape()
    .isLength({ min: 1 })
    .withMessage("UserName must be specified"),
  body("password")
    .isLength({ min: 5 })
    .withMessage("Password length must be atleast 5 chars"),
  body("passwordconfirm").custom((value, { req }) => {
    if (value !== req.body.password)
      throw new Error("Password Confirm Must be the same password");
    return true;
  }),
  async (req, res, next) => {
    const error = validationResult(req);
    if (!error.isEmpty()) {
      return next(createError(400, JSON.stringify(error.array())));
    }
    try {
      let doc = await User.findOne({ userName: req.body.username });
      if (doc) return next(createError(400, "UserName Exists"));
    } catch (err) {
      next(err);
    }

    let new_doc = new User({
      userName: req.body.username,
      isMember: false,
      isAdmin: false,
    });

    bcrypt.hash(req.body.password, 10, (err, result) => {
      if (err) return next(err);
      new_doc.password = result;

      new_doc.save((err) => {
        if (err) return next(err);
        res.json({ message: "User Created" });
      });
    });
  },
];

exports.become_admin = [
  passport.authenticate("jwt", { session: false }),
  body("adminpassword").custom((value) => {
    if (value !== process.env.ADMIN) throw new Error("Wrong admin password");

    return true;
  }),
  async (req, res, next) => {
    const error = validationResult(req);
    if (!error.isEmpty())
      return next(createError(400, JSON.stringify(error.array())));

    const result = await filterAndValidateToken(
      req.cookies.token,
      req.body.username
    );

    if (!result) return next(createError(401));

    User.findByIdAndUpdate(
      req.user._id,
      { isAdmin: true },
      (err, saved_user) => {
        if (err) return next(err);
        if (!saved_user) next(createError(404, "User not found"));
        res.json({ message: "User became admin" });
      }
    );
  },
];

exports.become_member = [
  passport.authenticate("jwt", { session: false }),
  body("memberpassword").custom((value) => {
    if (value !== process.env.CODE) throw new Error("Wrong member password");

    return true;
  }),
  async (req, res, next) => {
    const error = validationResult(req);
    if (!error.isEmpty())
      return next(createError(400, JSON.stringify(error.array())));

    const result = await filterAndValidateToken(
      req.cookies.token,
      req.body.username
    );

    if (!result) return next(createError(401));
    User.findByIdAndUpdate(
      req.user._id,
      { isMember: true },
      (err, saved_user) => {
        if (err) return next(err);
        if (!saved_user) next(createError(404, "User not found"));
        res.json({ message: "User got the membership" });
      }
    );
  },
];

exports.login = [
  body("username")
    .trim()
    .escape()
    .isLength({ min: 1 })
    .withMessage("UserName must be specified"),
  body("password")
    .isLength({ min: 5 })
    .withMessage("Password length must be atleast 5 chars"),
  (req, res, next) => {
    const error = validationResult(req);
    if (!error.isEmpty()) {
      return next(createError(400, JSON.stringify(error.array())));
    }

    User.findOne({ userName: req.body.username }, async (err, user) => {
      if (err) return next(err);
      if (!user) return next(createError(401, "User not found"));

      const result = bcrypt.compareSync(req.body.password, user.password);
      if (!result) return next(createError(401));

      const token = jwt.sign(
        {
          userName: user.userName,
          isAdmin: user.isAdmin,
          isMember: user.isMember,
        },
        process.env.SECRET,
        { expiresIn: "2w" }
      );

      if (!(await client.get("tokens"))) await client.set("tokens", "[]");

      const tokensArr = JSON.parse(await client.get("tokens"));

      const exists = tokensArr.find((i) => i.userName === req.body.username);

      tokensArr.push({
        token,
        userName: user.userName,
        issuedAt: new Date().valueOf(),
      });

      await client.set(
        "tokens",
        JSON.stringify(tokensArr.filter((token) => !_.isEqual(token, exists)))
      );

      res.json({
        message: "User LoggedIn",
        token,
        user: {
          userName: user.userName,
          isAdmin: user.isAdmin,
          isMember: user.isMember,
        },
      });
    });
  },
];
exports.logout = [
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const result = await filterAndValidateToken(
      req.cookies.token,
      req.body.username
    );
    if (!result) return next(createError(401));

    const token = req.cookies.token;
    const newTokensArr = JSON.parse(await client.get("tokens")).filter(
      (i) => i.token !== token
    );

    await client.set("tokens", JSON.stringify(newTokensArr));

    res.json({ message: "User LoggedOut" });
  },
];

exports.check_token = [
  passport.authenticate("jwt", { session: false }),
  async (req, res, next) => {
    const result = await filterAndValidateToken(
      req.cookies.token,
      req.body.username
    );
    if (!result) return next(createError(401));
    res.json({ message: "Authorized" });
  },
];

exports.user = [
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    res.json({
      user: {
        userName: req.user.userName,
        isAdmin: req.user.isAdmin,
        isMember: req.user.isMember,
      },
    });
  },
];

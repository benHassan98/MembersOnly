const Message = require("../models/message");
const { body, validationResult } = require("express-validator");
const createError = require("http-errors");
const ObjectId = require("mongoose").Types.ObjectId;
const passport = require("../config/passport");
const filterAndValidateToken = require("../helpers/filterAndValidateToken");


exports.message_list = (req, res, next) => {
  Message.find({})
    .populate("author")
    .exec((err, documents) => {
      if (err) return next(err);

      res.json({ documents });
    });
};

exports.message_create = [
  passport.authenticate("jwt", { session: false }),
  body("title")
    .trim()
    .escape()
    .isLength({ min: 1 })
    .withMessage("Title Must be specified"),
  body("content")
    .trim()
    .escape()
    .isLength({ min: 1 })
    .withMessage("Content Must be specified"),
  async (req, res, next) => {
    const error = validationResult(req);
    if (!error.isEmpty()) {
      return next(createError(400, JSON.stringify(error.array())));
    }

    const result = await filterAndValidateToken(
      req.cookies.token,
      req.body.username
    );
    if (!result) return next(createError(401));
    let document = new Message({
      author: req.user._id,
      title: req.body.title,
      content: req.body.content,
      time_stamp: new Date().toDateString(),
    });

    document.save((err) => {
      if (err) return next(err);
      res.json({ message: "Message Created", document });
    });
  },
];
exports.message_delete = [
  passport.authenticate("jwt", { session: false }),
  async (req, res, next) => {
    if (!ObjectId.isValid(req.params.id))
      return next(createError(404, "Message not found"));
    const result = await filterAndValidateToken(
      req.cookies.token,
      req.body.username
    );
    if (!result || !req.user.isAdmin) return next(createError(401));

    Message.findByIdAndRemove(req.params.id, (err, document) => {
      if (err) return next(err);
      if (!document) return next(createError(404, "Message not found"));
      res.json({ message: "Message Deleted", document });
    });
  },
];

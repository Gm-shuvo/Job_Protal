import express from "express";
import passport from "passport";
import jwt from "jsonwebtoken";
import authKeys from "../lib/authKeys.js";

import User from "../db/User.js";
import JobApplicant from "../db/JobApplicant.js";
import Recruiter from "../db/Recruiter.js";


const router = express.Router();

router.post("/signup", (req, res) => {
  const data = req.body;
  // const data = {
  //   email: "gm.shuvo.ru@gmail.com",
  //   password: "123456",
  //   type: "recruiter",
  //   name: "Shuvo",
  //   contactNumber: "+91-8879456123",
  //   bio: "I am a recruiter",
  // };
  let user = new User({
    email: data.email,
    password: data.password,
    type: data.type,
  });

  user
    .save()
    .then(() => {
      const userDetails =
        user.type == "recruiter"
          ? new Recruiter({
              userId: user._id,
              name: data.name,
              contactNumber: data.contactNumber,
              bio: data.bio,
            })
          : new JobApplicant({
              userId: user._id,
              name: data.name,
              education: data.education,
              skills: data.skills,
              rating: data.rating,
              resume: data.resume,
              profile: data.profile,
            });

      userDetails
        .save()
        .then(() => {
          // Token
          const token = jwt.sign({ _id: user._id }, process.env.SECRET_OR_KEY);
          res.json({
            token: token,
            type: user.type,
          });
        })
        .catch((err) => {
          user
            .delete()
            .then(() => {
              res.status(400).json(err);
            })
            .catch((err) => {
              res.json({ error: err });
            });
          err;
        });
    })
    .catch((err) => {
      res.status(400).json(err);
    });
});

router.post("/login", (req, res, next) => {
  passport.authenticate(
    "local",
    { session: false },
    function (err, user, info) {
      if (err) {
        return next(err);
      }
      if (!user) {
        res.status(401).json(info);
        return;
      }
      // Token
      const token = jwt.sign({ _id: user._id }, process.env.SECRET_OR_KEY);
      res.json({
        token: token,
        type: user.type,
      });
    }
  )(req, res, next);
});

export default router;

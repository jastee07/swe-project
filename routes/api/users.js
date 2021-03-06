const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const keys = require("../../config/keys");
const passport = require("passport");

const validateUserRegisterInput = require("../../validation/userRegister");
const validateLoginInput = require("../../validation/userLogin");

//Load User Model
const User = require("../../models/User");

//Test
router.get("/test", (req, res) => res.json({ msg: "Users works" }));

// @route GET api/users/login
// @desc Login User / Return JWT
// @access Public

router.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  const { errors, isValid } = validateLoginInput(req.body);

  User.findOne({ email }).then(user => {
    //check for user
    if (!user) {
      errors.email = "User not found";
      return res.status(404).json(errors);
    }

    //Check Password
    bcrypt.compare(password, user.password).then(isMatch => {
      if (isMatch) {
        //Login Success

        const payload = {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          organization: user.organization,
          role: user.role,
          email: user.email
        };

        //Sign Token
        jwt.sign(
          payload,
          keys.secretOrKey,
          { expiresIn: 86400 },
          (err, token) => {
            res.json({ success: true, token: "Bearer " + token });
          }
        );
      } else {
        //Login Failed
        errors.password = "Password incorrect";
        return res.status(400).json(errors);
      }
    });
  });
});

// @route   GET api/users/register
// @desc    Registers a user with member role, admin must do this
// @access  Private/Admin
router.post(
  "/register",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { userErrors, isUserValid } = validateUserRegisterInput(req.body);

    //Check Validation
    if (!isUserValid) {
      return res.status(400).json(userErrors);
    }

    if (req.user.role !== "admin") {
      return res
        .status(400)
        .json({ error: "User needs admin status to do add other users" });
    }

    // Check if email already exists
    User.findOne({ email: req.body.email }).then(user => {
      if (user) {
        userErrors.email = "Email already exists";
        return res.status(400).json(userErrors);
      } else {
        Organization.findById(req.user.organization).then(organization => {
          const newUser = new User({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            password: req.body.password,
            role: "member",
            organization: organization,
            email: req.body.email
          });

          bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(newUser.password, salt, (err, hash) => {
              if (err) throw err;
              newUser.password = hash;
              newUser
                .save()
                .then(user => {
                  organization.members.push(user);
                  organization.save();
                  res.json(organization);
                })
                .catch(err => console.log(err));
            });
          });
        });
      }
    });
  }
);

// @route   GET api/users/current
// @desc    Return current user
// @access  Private
router.get(
  "/current",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    res.json({
      id: req.user.id,
      firstName: req.user.firstName,
      lastName: req.user.lastName,
      email: req.user.email
    });
  }
);

// @route PUT api/users/:id
// @desc Update specific user information
// @access Private
router.put(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    User.findById(req.params.id)
      .then(user => {
        if (req.user.role === "admin") {
          //TODO: Will need to change this to show error to user or just lock option all together
          user.role = req.body.role;
        }
        user.firstName = req.body.firstName;
        user.lastName = req.body.lastName;
        user.email = req.body.email;

        user
          .save()
          .then(user => res.json({ user: user }))
          .catch(err =>
            res.status(400).json({ error: "Unable to update user" })
          );
      })
      .catch(err => res.status(400).json(err));
  }
);

module.exports = router;

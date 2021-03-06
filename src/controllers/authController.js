const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const shortid = require('shortid');

const generateJwtToken = (_id, role) => {
  return jwt.sign({ _id, role }, process.env.JWT_SECRET, {
    expiresIn: '1d',
  });
};

exports.signup = (req, res) => {
  User.findOne({ email: req.body.email }).exec(async (error, user) => {
    if (user)
      return res.status(400).json({
        message: 'User already registered',
      });

    const { name, surname, email, password } = req.body;
    const hash_password = await bcrypt.hash(password, 10);

    const _user = new User({
      name,
      surname,
      email,
      hash_password,
      username: shortid.generate(),
    });

    _user.save((error, user) => {
      if (error) {
        return res.status(400).json({
          error,
        });
      }

      if (user) {
        const token = generateJwtToken(user._id, user.role);
        const { _id, name, surname, email, role, fullName } = user;
        return res.status(201).json({
          token,
          user: { _id, name, surname, email, role, fullName },
        });
      }
    });
  });
};

exports.signin = (req, res) => {
  User.findOne({ email: req.body.email }).exec(async (error, user) => {
    if (error) return res.status(400).json({ error });
    if (user) {
      const isPasswordPromise = await user.authenticate(req.body.password);
      if (isPasswordPromise && user.role === 'user') {
        const token = jwt.sign(
          { _id: user._id, role: user.role },
          process.env.JWT_SECRET,
          {
            expiresIn: '1d',
          }
        );
        const { _id, name, surname, email, role, fullName } = user;
        res.status(200).json({
          token,
          user: {
            _id,
            name,
            surname,
            email,
            role,
            fullName,
          },
        });
      } else {
        return res.status(400).json({
          message: 'Invalid user email or Password',
        });
      }
    } else {
      return res.status(400).json({ error });
    }
  });
};

const User = require('../../models/userModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const shortid = require('shortid');

exports.signup = (req, res) => {
  User.findOne({ email: req.body.email }).exec(async (error, user) => {
    if (user)
      return res.status(400).json({
        message: 'Admin already registered',
      });

    const { name, surname, email, password } = req.body;
    const hash_password = await bcrypt.hash(password, 10);
    const _user = new User({
      name,
      surname,
      email,
      hash_password,
      username: shortid.generate(),
      role: 'admin',
    });

    _user.save((error, data) => {
      if (error) {
        return res.status(400).json({
          message: 'Something went wrong!',
        });
      }

      if (data) {
        return res.status(201).json({
          message: 'Admin created successfully...!',
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
      if (isPasswordPromise && user.role === 'admin') {
        const token = jwt.sign(
          { _id: user._id, role: user.role },
          process.env.JWT_SECRET,
          {
            expiresIn: '1d',
          }
        );
        const { _id, name, surname, email, role, fullName } = user;
        res.cookie('token', token, { expiresIn: '1d' });
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
          message: 'Invalid admin email or Password',
        });
      }
    } else {
      return res.status(400).json({ message: 'Something went wrong!' });
    }
  });
};

exports.signout = (req, res) => {
  res.clearCookie('token');
  res.status(200).json({
    message: 'Signout successfully...!',
  });
};
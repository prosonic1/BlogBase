const express = require('express');
const Joi = require('joi');

const { generatePassword, comparePassword } = require('lib/bcrypt');
const { generateToken } = require('lib/token');
const User = require('db/models/user');

const router = express.Router();

router.get('/', (req, res) => {
  const { user } = req;
  if (user) {
    res.status(200).json({ success: true, data: { user } });
  } else {
    res.status(401).end();
  }
});

router.post('/register', async (req, res, next) => {
  const { body } = req;
  const {
    email,
    password,
    displayName,
  } = body;

  // check validate user info
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).max(15).required(),
    displayName: Joi.string().regex(/^[a-zA-Z0-9ㄱ-힣]{3,12}$/).required(),
  });
  const validate = Joi.validate(body, schema);
  if (validate.error) {
    return res.status(409).json({ success: false, message: validate.error.details[0].message });
  }

  try {
    // check email
    const emailExists = await User.findByEmail(email);
    if (emailExists) return res.status(409).json({ success: false, message: 'Email is already exists' });

    // generate password
    const hashPassword = await generatePassword(password);

    // create user
    const user = await User.localRegister({
      email,
      displayName,
      password: hashPassword,
    });

    // create access token
    const userData = {
      id: user._id,
      displayName: user.commonProfile.displayName,
    };
    // access token and refresh token set cookie
    const accessToken = await generateToken({ user: userData }, '3h');
    const refreshToken = await generateToken({ user: userData }, '1d');
    res.cookie('access_token', accessToken);
    res.cookie('refresh_token', refreshToken);
    return res.status(201).json({ success: true, data: { user: userData } });
  } catch (err) {
    console.error(err);
    return next(err);
  }
});

router.post('/login', async (req, res, next) => {
  const { body } = req;
  const { email, password } = body;

  // check validate user info
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).max(15).required(),
  });
  const validate = Joi.validate(body, schema);
  if (validate.error) {
    return res.status(409).json({ success: false, message: validate.error.details[0].message });
  }

  try {
    // find by username
    const user = await User.findByEmail(email);
    if (!user) return res.status(409).json({ success: false, message: 'user is incorrect!' });

    // find one user compare password
    const result = await comparePassword(password, user.password);
    if (!result) return res.status(409).json({ success: false, message: 'user is incorrect!' });

    // create access token
    const userData = { id: user._id, displayName: user.common_profile.displayName };
    // access token and refresh token set cookie
    const accessToken = await generateToken({ user: userData }, '3h');
    const refreshToken = await generateToken({ user: userData }, '1d');
    res.cookie('access_token', accessToken);
    res.cookie('refresh_token', refreshToken);
    return res.status(200).json({ success: true, message: 'success local login' });
  } catch (err) {
    console.error(err);
    return next(err);
  }
});

module.exports = router;

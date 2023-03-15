const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator/check');

const User = require('../models/user');
const { authMiddleware } = require('./middlewars/auth');
const { adminMiddleware } = require('./middlewars/admin');


router.post('/sign-up', [
  check('email')
    .isEmail()
    .withMessage('Please provide valid email')
    .custom(async value => {
      const result = await User.findOne({ email: value });
      if (result) throw 'Email allready in use';
    }),
  check('password')
    .isLength({ min: 6, max: 30 })
    .withMessage('Password should contain at least 6 symbols, and less than 30')
],
async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    const user = new User({ email, password });

    const createdUser = await user.save();
    if (!createdUser) {
      return res.status(500).json({ message: 'User did not created'});
    }

    res.status(200).json({ message: 'User created' });
  } catch (err) {
    console.log(err);
    res.status(err.code).json({ message: err.message });
  }
});
router.post('/sign-in', [
  check('email')
    .isEmail()
    .withMessage('Please provide valid email')
    .custom(async value => {
      const result = await User.findOne({ email: value });
      if (!result) throw 'Email doesn\'t fit our records, or password is incorrect';
    }),
  check('password')
    .isLength({ min: 6, max: 30 })
    .withMessage('Invalid password')
],
async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(422).json({ errors: [{ param: 'email', message: 'Email doesn\'t fit our records' }] });
    }

    const result = await user.comparePassword(password);
    if (!result) {
      return res.status(422).json({ errors: [{ param: 'email or password', message: 'Email doesn\'t fit our records, or password is incorrect' }] });
    }

    res.status(200).json({ token: user.generateMainToken(), user: user.getUserData() });
  } catch (err) {
    res.status(err.code).json({ message: err.message });
  }
}
);
router.get('/user', authMiddleware, async (req, res) => {
  try {
    const user = await User.findOne({ email: req.email });
    if (!user) {
      return res.status(400).json({message: 'Email doesn\'t feet our records'});
    }

    res.status(200).json(user.getUserData());
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Unexpected error, details at logs' });
  }
});
router.patch('/update', [authMiddleware], async (req, res) => {
  try {
    const userForUpdate = await User.findOne({ email: req.email });

    if (!userForUpdate) {
      res.status(400).json({ message: 'Email doesn\'t feet our records'});
    }
    for (const prop in req.body) {
      userForUpdate[prop] = req.body[prop];
    }

    const savedUser = await userForUpdate.save();

    res.status(200).json(savedUser.getUserData());
  } catch (err) {
    console.log(err);
    res.status(err.code).json({ message: err.message });
  }
});

router.post('/add-su', [
  authMiddleware,
  adminMiddleware,
  check('email')
    .isEmail()
    .withMessage('Please provide valid email')
    .custom(async value => {
      const result = await User.findOne({ email: value });
      if (result) throw 'Email allready in use';
    }),
  check('password')
    .isLength({ min: 6, max: 30 })
    .withMessage('Password should contain at least 6 symbols, and less than 30')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    const { email, password } = req.body;

    const user = new User({ email, password, isAdmin: true });

    const createdUser = await user.save();
    if (!createdUser) {
      return res.status(400).json({ message: 'Error while creating admin' });
    }

    res.status(200).json(createdUser.getUserData());
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Unexpected error, details at logs' });
  }
});

module.exports = router;

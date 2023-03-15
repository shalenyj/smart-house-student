const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator/check');

const Setup = require('../models/setup');
const User = require('../models/user');
const Report = require('../models/report');

const createReport = async(id, email, geoPosition, type) => {
    const report = new Report({
      user: email,
      type,
      status: 'new',
      idOfDevice: id,
      geoPosition,
    })
    return report.save()
}

router.get('/', async(req, res) => {
  try{
    const userSetup = await Setup.findOne({ user: req.email });
  
    if (!userSetup) {
      return res.status(200).json({ elements: [] });
    }

    res.status(200).json({ elements: userSetup.elements});
  } catch(error){
    console.log(err);
    res.status(500).json({ status: false, message: 'Unexpected error, details at logs' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userSetup = await Setup.findOne({ user: req.email });

    if (!userSetup) {
      return res.status(400).json({ message: 'Empty setup list'});
    }

    const item = userSetup.elements.find(el => el._id == id);

    if (!item) {
      return res.status(400).json({ message: 'Incorrect id of setup'});
    }

    res.status(200).json(item);

  } catch (err) {
    console.log(err);
    res.status(500).json({ status: false, message: 'Unexpected error, details at logs' });
  }
});

router.post('/', [
  check('element.type')
    .exists()
    .withMessage('type is required')
    .isIn(['windows', 'water', 'curtains'])
    .withMessage('Should be one of windows, water, curtains'),
  check('element.name')
    .exists()
    .withMessage('name is required'),
  check('element.settings')
    .exists()
    .withMessage('settings is required'),
  check('element.settings.start')
    .optional()
    .isString()
    .withMessage('should be string, ex 20:15'),
  check('element.settings.end')
    .optional()
    .isString()
    .withMessage('should be string, ex 20:15'),
  check('element.settings.count')
    .optional()
    .isInt()
    .withMessage('should be integer'),
  check('element.settings.duration')
    .optional()
    .isInt()
    .withMessage('should be integer number of seconds'),
  check('element.settings.weatherSupport')
    .optional()
    .isBoolean()
    .withMessage('should be boolean'),
],
async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  try {
    const email = req.email;
    const { element } = req.body;

    const userSetup = await Setup.findOne({ user: email });

    const { geoPosition } = await User.findOne({ email });

    if (userSetup) {
      userSetup.elements.push(element);
      userSetup.geoPosition = {...geoPosition};
      await userSetup.save();

      const { _id  } = userSetup.elements[userSetup.elements.length - 1];
      await createReport(_id, req.email, userSetup.geoPosition,  'connect');

      res.status(200).json({ status: true });
    } else {

      const setup = new Setup({
        user: email,
        elements: [
          element
        ],
        geoPosition,
      });
      
      await setup.save();
      const { _id  } = setup.elements[setup.elements.length - 1];
      
      await createReport(_id, req.email, geoPosition,  'connect');
   
    }
    res.status(200).json({ status: true });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Unexpected error, details at logs' });
  }
});
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userSetup = await Setup.findOne({ user: req.email });

    if (!userSetup) {
      return res.status(400).json({ message: 'Empty setup list'});
    }

    const item = userSetup.elements.find(el => el._id == id);

    if (!item) {
      return res.status(400).json({ message: 'Incorrect id of setup'});
    }

    userSetup.elements[userSetup.elements.indexOf(item)].isActive = false;

    await userSetup.save();
    await createReport(id, req.email, userSetup.geoPosition,  'disconnect');

    res.status(200).json({ status: true });

  } catch (err) {
    console.log(err);
    res.status(500).json({ status: false, message: 'Unexpected error, details at logs' });
  }
});

router.patch('/:id', [
  check('element.settings.start')
    .optional()
    .isString()
    .withMessage('should be string, ex 20:15'),
  check('element.settings.end')
    .optional()
    .isString()
    .withMessage('should be string, ex 20:15'),
  check('element.settings.count')
    .optional()
    .isInt()
    .withMessage('should be integer'),
  check('element.settings.duration')
    .optional()
    .isInt()
    .withMessage('should be integer number of seconds'),
  check('element.settings.weatherSupport')
    .optional()
    .isBoolean()
    .withMessage('should be boolean'),
], async (req, res) => {
    
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  try {
    const { element } = req.body;
    const { id } = req.params;

    const userSetup = await Setup.findOne({ user: req.email });

    const item = userSetup.elements.find(el => el._id == id);

    if (!item) {
      res.status(400).json({ message: 'Incorrect id of setup'});
    }

    if (!userSetup) {
      throw { message: 'Empty setup list', code: 400 };
    }

    for (const prop in element) {
      userSetup.elements[userSetup.elements.indexOf(item)][prop] = element[prop];
    }

    const result = await userSetup.save();

    res.status(200).json(result.elements.find(el => el._id == id));
  } catch (err) {
    console.log(err);

    res.status(500).json({ status: false, message: 'Unexpected error, details at logs' });
  }
});
module.exports = router;
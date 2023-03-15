const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator/check');

const crypto = require('crypto');

const Setup = require('../models/setup');
const Report = require('../models/report');

const updateSetup = async (email, id, type) => {
  try{
    const userSetup = await Setup.findOne({ user: email });
    const item = userSetup.elements.find(el => el._id == id);
    
    if (!item) {
      throw { message: 'Incorrect id of setup'};
    }
    const isActivation = type === 'connect';

    if(isActivation){
      item.isActive = true;
      item.motherBoardId = crypto.randomUUID();
    } else {
      userSetup.elements.splice(userSetup.elements.indexOf(item), 1);
    }
    await userSetup.save()
    return Promise.resolve()
  } catch (error){
    return Promise.reject(error)
  }
  
}

router.get('/', async(req, res) => {
  try{
    const setups = await Report.find();
  
    return res.status(200).json({ setups });
  } catch(error){
    console.log(err);
    res.status(500).json({ status: false, message: 'Unexpected error, details at logs' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const report = await Report.findOne({ _id: id });

    if (!report) {
      return res.status(400).json({ message: 'Incorrect id of report'});
    }

    res.status(200).json(report);

  } catch (err) {
    console.log(err);
    res.status(500).json({ status: false, message: 'Unexpected error, details at logs' });
  }
});

router.patch('/:id', [
  check('status')
    .exists()
    .isString()
    .withMessage('should be string'),
], async (req, res) => {
    
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  try {
    const { id } = req.params;

    const report = await Report.findOne({ _id: id });

    if (!report) {
      res.status(400).json({ message: 'Incorrect id of setup'});
    }

    report.status = req.body.status;
    console.log(report.status, report)
    await report.save()
    await updateSetup(req.email, report.idOfDevice, report.type)

    res.status(200).json(report);
  } catch (err) {
    console.log(err);

    res.status(500).json({ status: false, message: 'Unexpected error, details at logs' });
  }
});
module.exports = router;
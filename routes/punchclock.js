var express = require('express');
var router = express.Router();

const PunchClock = require('../models/PunchClock');

//Still missing the get all checkIns
router.get('/', (req, res, next) => {
  PunchClock.find()
    .populate('user')  // This populates the user field with the User document
    .then((punchclock) => {
      console.log('Retrieved punchclock ===> ', punchclock);
      res.json(punchclock);
    })
    .catch((error) => {
      console.error('Error while retrieving punchclock ===> ', error);
      res.status(500).json({ error: "Failed to retrieve punchclock" });
    });
});

// GET punchClock by its id
router.get('/:punchclockId', (req, res, next) => {
  const { punchclockId } = req.params;

  PunchClock.findById(punchclockId)
    .populate('user')
    .then((punchclock) => {
      console.log('Retrieved PunchClock ===> ', punchclock);
      res.json(punchclock);
    })
    .catch((error) => {
      console.log('Error while retrieving punchclock ==>', error);
      res.status(500).json({ error: 'Failed to retrieve punchclock' });
    });
});

// Get a limit amount of punchin and punchout as not to overload the server
router.get('/new/:skip/:limit', (req, res, next) => {
    const { skip, limit } = req.params; 

    PunchClock.find({})
        .skip(skip)
        .limit(limit)
        .then((punchclock) => {
            console.log('Retrieved PunchClock ===> ', punchclock);
            res.json(punchclock);
        })
        .catch((error) => {
            console.error('Error while retrieving PunchClock ===> ', error);
            res.status(500).json({ error: "Failed to retrieve PunchClock" });
        });
});

// POST punchIn information
router.post('/', function(req, res, next) {
    PunchClock.create({
        user: req.body.user,
        punchIn: req.body.punchIn,
        punchOut: req.body.punchOut,
        time: req.body.time
    })
    .then((createdPunchClock) => {
        console.log('PunchClock created ===> ', createdPunchClock);
        res.status(201).json(createdPunchClock);
    })
    .catch((error) => {
        console.error('Error while creating PunchClock ===> ', error);
        res.status(400).json({ error: 'Failed to create PunchClock' });
    });
});

// PUT update punchclock by its id
router.put('/:punchclockId', (req, res, next) => {
  const { punchclockId } = req.params;

  PunchClock.findByIdAndUpdate(punchclockId, req.body, { new: true })
    .then((updatedPunchClock) => {
      console.log('Updated PunchClock ===> ', updatedPunchClock);
      res.status(200).json(updatedPunchClock);
    })
    .catch((error) => {
      console.error('Error while updating PunchClock ===> ', error);
      res.status(500).json({ error: 'Failed to update PunchClock' });
    });
});

// DELETE punchClock by its id
router.delete('/:punchclockId', (req, res, next) => {
  const { punchclockId } = req.params;

  PunchClock.findByIdAndDelete(punchclockId)
    .then((result) => {
      console.log('PunchClock deleted!');
      res.status(200).json(result);
    })
    .catch((error) => {
      console.error('Error while deleting PunchClock ===> ', error);
      res.status(500).json({ error: 'Deleting PunchClock failed' });
    });
});

module.exports = router;
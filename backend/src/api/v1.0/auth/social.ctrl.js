const express = require('express');

const oAuth = require('lib/oauth');

const router = express.Router();

router.get('/facebook', oAuth.authenticate('facebook', {}), (req, res) => {
  res.json({});
});

module.exports = router;

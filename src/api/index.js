const express = require('express');

const auth = require('./auth/auth.controller');
const user = require('./user/user.controller');

const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    message: 'API - 👋🌎🌍🌏'
  });
});

router.use('/auth', auth);
router.use('/user', user);

module.exports = router;
const express = require('express')
const router = express.Router()
const { isAuthenticated } = require('../../middlewares');
const { checkProfile } = require('./user.service');

router.get('/profile', isAuthenticated, async (req, res, next) => {
    try {
      const { userId } = req.payload;
      const user = await checkProfile(userId)
      res.json(user);
    } catch (err) {
      next(err);
    }
});

module.exports = router;
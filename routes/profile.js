var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  if (!req.user) {
    return res.redirect('/login');
  }

  if (req.user.role === 'trainer') {
    return res.redirect(`/trainer-profile.html?id=${req.user.id}`);
  } else {
    return res.redirect(`/user-profile.html?id=${req.user.id}`);
  }
});

module.exports = router;

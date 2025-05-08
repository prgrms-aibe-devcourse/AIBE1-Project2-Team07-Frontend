var express = require('express');
var router = express.Router();
var path = require('path');

/* GET community page. */
router.get('/', function (req, res, next) {
    res.sendFile(path.join(__dirname, '../public/trainer-list.html'));
});

router.get('/profile', function (req, res, next) {
    res.sendFile(path.join(__dirname, '../public/trainer-profile.html'));
});

module.exports = router;
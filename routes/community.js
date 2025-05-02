var express = require('express');
var router = express.Router();
var path = require('path');

/* GET community page. */
router.get('/', function (req, res, next) {
    res.sendFile(path.join(__dirname, '../public/community.html'));
});

router.get('/write', function (req, res, next) {
    res.sendFile(path.join(__dirname, '../public/community-write.html'));
});

module.exports = router;


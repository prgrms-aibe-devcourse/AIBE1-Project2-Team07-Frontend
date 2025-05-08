var express = require('express');
var router = express.Router();
var path = require('path');

router.use('/profile', express.static(path.join(__dirname, '../public')));


/* GET community page. */
router.get('/', function (req, res, next) {
    res.sendFile(path.join(__dirname, '../public/trainer-list.html'));
});

router.get('/profile/:trainerNickname', function(req, res, next) {
    const trainerNickname = req.params.trainerNickname;

    res.sendFile(path.join(__dirname, '../public/trainer-profile.html'));
});

module.exports = router;
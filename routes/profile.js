var express = require('express');
var router = express.Router();
const path = require("path");

/* GET users listing. */
router.get('/', function (req, res, next) {
    const user = JSON.parse(req.cookies.user);

    if (user === null) {
        return res.redirect('/');
    }

    if (user.userRole === 'TRAINER') {
        res.sendFile(path.join(__dirname, '../public/trainer-mypage.html'));
        // return res.redirect(`/trainer-profile.html?id=${req.user.id}`);
    } else {
        res.sendFile(path.join(__dirname, '../public/user-mypage.html'));
        // return res.redirect(`/user-profile.html?id=${req.user.id}`);
    }
});

module.exports = router;

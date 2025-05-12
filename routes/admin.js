var express = require('express');
const path = require("path");
var router = express.Router();

let user;
router.get('/cert', function(req, res, next) {
    try {
        user = JSON.parse(req.cookies.user);
    } catch (e) {
        console.error('사용자 쿠키 파싱 오류:', e);
        return res.sendFile(path.join(__dirname, '../public/home.html'));
    }
    if (user.userRole === 'ADMIN') {
        return res.sendFile(path.join(__dirname, '../public/admin-cert.html'));
    }
});

router.get('/post', function(req, res, next) {
    return res.sendFile(path.join(__dirname, '../public/admin-post.html'));
});

router.get('/comment', function(req, res, next) {
    return res.sendFile(path.join(__dirname, '../public/admin-comment.html'));
});

router.get('/user', function(req, res, next) {
    return res.sendFile(path.join(__dirname, '../public/admin-user.html'));
});


module.exports = router;
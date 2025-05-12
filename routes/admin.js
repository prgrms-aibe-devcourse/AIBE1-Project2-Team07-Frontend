var express = require('express');
const path = require("path");
var router = express.Router();

router.get('/cert', function(req, res, next) {
    return res.sendFile(path.join(__dirname, '../public/admin-cert.html'));
});

router.get('/post', function(req, res, next) {
    return res.sendFile(path.join(__dirname, '../public/admin-post.html'));
});

router.get('/comment', function(req, res, next) {
    return res.sendFile(path.join(__dirname, '../public/admin-comment.html'));
});

module.exports = router;
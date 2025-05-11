var express = require('express');
var router = express.Router();
var path = require('path');

router.use('/post', express.static(path.join(__dirname, '../public')));
router.use('/write', express.static(path.join(__dirname, '../public')));
router.use('/edit', express.static(path.join(__dirname, '../public')));



/* GET community page. */
router.get('/', function (req, res, next) {
    res.sendFile(path.join(__dirname, '../public/community.html'));
});

router.get('/post/:postId', function (req, res, next) {
    const postId = req.params.postId;

    res.sendFile(path.join(__dirname, '../public/community-post.html'));
});

router.get('/edit/:postId', function (req, res, next) {
    const postId = req.params.postId;

    res.sendFile(path.join(__dirname, '../public/community-edit.html'));
});

router.get('/write', function (req, res, next) {
    res.sendFile(path.join(__dirname, '../public/community-write.html'));
});

module.exports = router;


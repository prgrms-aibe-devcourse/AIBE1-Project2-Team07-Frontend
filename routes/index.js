var express = require('express');
var path = require('path');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
    // 헤더 설정
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    // Content-Length 헤더 제거 (필요시)
    res.removeHeader('Content-Length');

    let user;
    try {
        user = JSON.parse(req.cookies.user);
    } catch (e) {
        console.error('사용자 쿠키 파싱 오류:', e);
        return res.redirect('/login.html'); // 로그인 페이지로 리다이렉트
    }

    // 사용자 역할에 따라 다른 페이지 제공
    if (user && user.userRole === 'ADMIN') {
        return res.sendFile(path.join(__dirname, '../public/cert.html'));
    } else {
        return res.sendFile(path.join(__dirname, '../public/home.html'));
    }
});

// 오류 처리를 위한 추가 미들웨어
router.use(function(err, req, res, next) {
    console.error('라우터 오류:', err);
    res.status(err.status || 500);
    res.send('오류가 발생했습니다. 관리자에게 문의하세요.');
});

module.exports = router;
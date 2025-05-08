var express = require('express');
const path = require("path");
var router = express.Router();

router.use('/user-mypage', express.static(path.join(__dirname, '../public')));
router.use('/trainer-mypage', express.static(path.join(__dirname, '../public')));

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>페이지 리다이렉션</title>
      <script>
        document.addEventListener('DOMContentLoaded', function() {
          // localStorage에서 사용자 정보 가져오기
          const userDataStr = localStorage.getItem('user');
          
          if (userDataStr) {
            try {
              const userData = JSON.parse(userDataStr);
              
              // 역할에 따라 다른 페이지로 리다이렉트
              if (userData.userRole === 'USER') {
                window.location.href = '/profile/user-mypage';
              } else if (userData.userRole === 'TRAINER') {
                window.location.href = '/profile/trainer-mypage';
              }
            } catch (error) {
              console.error('사용자 데이터 파싱 오류:', error);
            }
          }
        });
      </script>
    </head>
    </html>
  `);
});

// 각 페이지에 대한 라우트 추가
router.get('/user-mypage', function (req, res, next) {
  res.sendFile(path.join(__dirname, '../public/user-mypage.html'));
});

router.get('/trainer-mypage', function (req, res, next) {
  res.sendFile(path.join(__dirname, '../public/trainer-mypage.html'));
});

module.exports = router;
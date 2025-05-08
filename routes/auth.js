require("dotenv").config();

const express = require("express");
const router = express.Router();
const path = require("path");

function handleLogin(req, res) {
  const BACKEND_URL = process.env.BACKEND_URL;
  const requestUrl = BACKEND_URL + `/api/v1/auth/login`;
  console.log(requestUrl);

  fetch(requestUrl, {
    method: "POST",
    headers: {
      cookie: req.headers.cookie,
    },
    credentials: "include",
  })
    .then((response) => response.json())
    .then((data) => res.json(data))
    .catch((error) => {
      console.error(error);
      res.status(500).json({
        message: "로그인 요청 중 문제가 발생했습니다.",
      });
    });
}

function handleKakaoLogin(req, res) {
  const KAKAO_AUTH_URL = process.env.KAKAO_AUTH_URL;
  res.redirect(KAKAO_AUTH_URL);
}

function handleNaverLogin(req, res) {
  const NAVER_AUTH_URL = process.env.NAVER_AUTH_URL;
  res.redirect(NAVER_AUTH_URL);
}

// 토큰이 쿠키에 담겨서 옴
function handleOAuthCallBack() {
  return (req, res) => {
    return res.redirect(`/auth/login`);
  };
}

router.post("/", handleLogin);
router.get("/kakao", handleKakaoLogin);
router.get("/naver", handleNaverLogin);
router.get("/oauth2/callback", handleOAuthCallBack());
router.get("/login", function (req, res, next) {
  res.sendFile(path.join(__dirname, "../public/login.html"));
});

module.exports = router;

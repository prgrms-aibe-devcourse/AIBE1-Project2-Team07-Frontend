require("dotenv").config();

const express = require("express");
const router = express.Router();
const path = require("path");

function requestUser(req, res) {
  const BACKEND_URL = process.env.BACKEND_URL;
  const requestUrl = BACKEND_URL + `/api/v1/users/me`;
  const accessToken = req.headers.authorization;

  if (!accessToken || !accessToken.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Authorization 헤더 없음" });
  }

  fetch(requestUrl, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `${accessToken}`,
    },
  })
    .then((response) => response.json())
    .then((data) => res.json(data))
    .catch((error) => {
      console.error(error);
      res.status(500).json({
        message: "API 요청 중 문제가 발생했습니다.",
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

function handleOAuthCallBack() {
  return (req, res) => {
    const accessToken = req.query.accessToken;
    const refreshToken = req.query.refreshToken;

    return res.redirect(
      `/auth/login?accessToken=${accessToken}&refreshToken=${refreshToken}`
    );
  };
}

router.post("/my", requestUser);
router.get("/kakao", handleKakaoLogin);
router.get("/naver", handleNaverLogin);
router.get("/oauth2/callback", handleOAuthCallBack());
router.get("/login", function (req, res, next) {
  res.sendFile(path.join(__dirname, "../public/login.html"));
});

module.exports = router;

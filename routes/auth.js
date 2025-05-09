require("dotenv").config();

const express = require("express");
const router = express.Router();
const path = require("path");
const fetchWithAuth = require("../middlewares/authMiddleware");

router.use(fetchWithAuth);

router.get("/kakao", (req, res) => {
    res.redirect(process.env.KAKAO_AUTH_URL);
});

router.get("/naver", (req, res) => {
    res.redirect(process.env.NAVER_AUTH_URL);
});

router.all("/oauth2/callback", (req, res) => {
    const {accessToken, refreshToken} = req.query;

    res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: true,
        maxAge: 72000000 * 1000, // 2시간
    });

    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true,
        maxAge: 3600 * 24 * 30 * 1000, // 30일
    });

    res.redirect(`/auth/login?accessToken=${accessToken}&refreshToken=${refreshToken}`);
});

router.get("/my", async (req, res, next) => {
    try {
        req.originalUrl = "/api/v1/users/me"; // 백엔드 URL로 매핑
        await fetchWithAuth(req, res, async () => {
            // fetchWithAuth 미들웨어가 완료된 후 실행
            const userData = req.apiResponse; // 미들웨어에서 설정된 응답 데이터
            if (!userData) {
                return res.status(500).json({message: "응답 데이터가 없습니다."});
            }

            // 쿠키에 사용자 데이터 저장
            res.cookie("user", JSON.stringify(userData), {
                httpOnly: true,
                maxAge: 7200 * 1000, // 2시간
                path: "/",
            });

            res.json(userData); // 클라이언트에 응답 반환
        });
    } catch (error) {
        console.error("라우터 처리 중 오류 발생:", error);
        res.status(500).json({message: "서버 오류"});
    }
});

router.get("/login", (req, res) => {
    res.sendFile(path.join(__dirname, "../public/login.html"));
});

module.exports = router;

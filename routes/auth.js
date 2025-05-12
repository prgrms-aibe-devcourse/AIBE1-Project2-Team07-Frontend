require("dotenv").config();

const express = require("express");
const router = express.Router();
const path = require("path");
const isProduction = process.env.PROFILES === "prod";

// 쿠키 옵션 공통 정의
const cookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: !isProduction ? "Lax" : "Strict",
    path: "/"
};

// 로그인 리디렉션
router.get("/kakao", (req, res) => {
    res.redirect(process.env.KAKAO_AUTH_URL);
});

router.get("/naver", (req, res) => {
    res.redirect(process.env.NAVER_AUTH_URL);
});

// 콜백 처리
router.all("/oauth2/callback", async (req, res) => {
    const {accessToken, refreshToken, accessTokenExpiresIn, refreshTokenExpiresIn} = req.query;

    const response = await fetch(`${process.env.BACKEND_URL}/api/v1/users/me`, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json"
        }
    });

    if (!response.ok) {
        const errObj = await response.json().catch(() => ({}));
        console.error("❌ 사용자 정보 조회 실패:", errObj);
        res.redirect("/?error");
    }

    const user = await response.json();

    res.cookie("accessToken", accessToken, {
        ...cookieOptions,
        maxAge: accessTokenExpiresIn * 1000,
    });

    res.cookie("refreshToken", refreshToken, {
        ...cookieOptions,
        maxAge: refreshTokenExpiresIn * 1000,
    });

    res.cookie("expiresIn", accessTokenExpiresIn, {
        ...cookieOptions,
        maxAge: accessTokenExpiresIn * 1000,
    });

    res.cookie("user", JSON.stringify(user), {
        ...cookieOptions,
        maxAge: refreshTokenExpiresIn * 1000,
    });

    res.redirect(`/auth/login?accessToken=${accessToken}&refreshToken=${refreshToken}`);
});

// 로그아웃
router.post("/logout", async (req, res) => {
    try {
        const response = await fetch(`${process.env.BACKEND_URL}/api/v1/auth/logout`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${req.cookies.accessToken}`,
            },
            body: null,
        });

        res.clearCookie("accessToken", cookieOptions);
        res.clearCookie("refreshToken", cookieOptions);
        res.clearCookie("expiresIn", cookieOptions);
        res.clearCookie("user", cookieOptions);

        const result = await response.json();
        return res.json(result);
    } catch (error) {
        console.error("❌ 로그아웃 중 오류 발생:", error);
        return res.status(404).json({message: "로그아웃 실패"});
    }
});

// 로그인 HTML
router.get("/login", (req, res) => {
    res.sendFile(path.join(__dirname, "../public/login.html"));
});

router.get("/status", (req, res) => {
    const {refreshToken} = req.cookies || {};
    const isLoggedIn = !!refreshToken;

    if (isLoggedIn) {
        return res.status(200).json({isLoggedIn});
    }

    return res.status(401).json({isLoggedIn});
});

module.exports = router;

require('dotenv').config();
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const BACKEND_URL = process.env.BACKEND_URL;

async function reissueAccessToken(refreshToken) {
    const response = await fetch(`${BACKEND_URL}/api/v1/token/reissue`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({refreshToken}),
    });

    if (!response.ok) {
        throw new Error("토큰 재발급 실패");
    }

    const {accessToken} = await response.json();
    return accessToken;
}

async function fetchWithAuth(req, res, next) {
    const excludedPaths = ["/kakao", "/naver", "/oauth2/callback", "/login"];
    if (excludedPaths.includes(req.path)) {
        return next(); // 미들웨어를 건너뜀
    }

    // 기존 fetchWithAuth 로직
    try {
        // let accessToken = req.headers.authorization?.split(" ")[1];
        let accessToken = req.cookies.accessToken;
        const refreshToken = req.cookies.refreshToken;

        if (!accessToken || !refreshToken) {
            return res.status(401).json({message: "인증 정보가 없습니다."});
        }

        const apiResponse = await fetch(`${BACKEND_URL}${req.originalUrl}`, {
            method: req.method,
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
            },
            body: ["GET", "POST", "PUT", "PATCH"].includes(req.method) ? JSON.stringify(req.body) : undefined,
        });

        if (apiResponse.status === 401) {
            accessToken = await reissueAccessToken(refreshToken);
            res.cookie("accessToken", accessToken, {httpOnly: true, secure: true});

            const retryResponse = await fetch(`${BACKEND_URL}${req.originalUrl}`, {
                method: req.method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`,
                },
                body: ["GET", "POST", "PUT", "PATCH"].includes(req.method) ? JSON.stringify(req.body) : undefined,
            });

            req.apiResponse = await retryResponse.json();
            return next();
        }

        req.apiResponse = await apiResponse.json();
        next();
    } catch (error) {
        console.error("API 요청 중 오류 발생:", error);
        res.status(500).json({message: "서버 오류"});
    }
}

module.exports = fetchWithAuth;

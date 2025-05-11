require("dotenv").config();
const fetch = (...args) => import("node-fetch").then(({default: fetch}) => fetch(...args));

const BACKEND_URL = process.env.BACKEND_URL;
const isProduction = process.env.PROFILES === "prod";

// 쿠키 설정을 위한 공통 옵션
const cookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: !isProduction ? "Lax" : "Strict",
    path: "/"
};

// 인증이 필요 없는 경로 목록
const excludedPaths = ["/kakao", "/naver", "/oauth2/callback", "/login", "/logout"];

/**
 * 리프레시 토큰으로 새 액세스 토큰 발급
 * @param {string} refreshToken 리프레시 토큰
 * @returns {Promise<Object>} 새 토큰 객체
 */
async function reissueAccessToken(refreshToken) {
    if (!refreshToken) {
        throw new Error("리프레시 토큰이 없습니다.");
    }

    const res = await fetch(`${BACKEND_URL}/api/v1/auth/reissue`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({refreshToken})
    });

    if (!res.ok) {
        const errObj = await res.json().catch(() => ({}));
        throw new Error(`토큰 재발급 실패: ${res.status} ${errObj.message || ''}`);
    }

    return res.json();
}

/**
 * 인증 쿠키 제거
 * @param {Object} res Express 응답 객체
 */
function clearAuthCookies(res) {
    ["accessToken", "refreshToken", "expiresIn"].forEach(name => {
        res.clearCookie(name, cookieOptions);
    });
}

/**
 * 토큰 쿠키 설정
 */
function setTokenCookies(res, tokens) {
    res.cookie("accessToken", tokens.accessToken, {
        ...cookieOptions,
        maxAge: tokens.accessTokenExpiresIn * 1000
    });
    res.cookie("refreshToken", tokens.refreshToken, {
        ...cookieOptions,
        maxAge: tokens.refreshTokenExpiresIn * 1000
    });
    res.cookie("expiresIn", tokens.accessTokenExpiresIn, {
        ...cookieOptions,
        maxAge: tokens.accessTokenExpiresIn * 1000
    });
    return tokens.accessToken;
}

/**
 * API 요청 옵션 생성
 */
function createRequestOptions(method, body, token) {
    const headers = {"Content-Type": "application/json"};
    if (token) headers.Authorization = `Bearer ${token}`;
    return {
        method,
        headers,
        body: ["POST", "PUT", "PATCH"].includes(method) && body ? JSON.stringify(body) : undefined
    };
}

/**
 * 인증 미들웨어
 */
async function fetchWithAuth(req, res, next) {
    // 인증 제외 경로
    if (excludedPaths.some(path => req.path.includes(path))) {
        return next();
    }

    const {accessToken, refreshToken} = req.cookies || {};

    // 토큰 모두 없으면 401 처리
    if (!accessToken && !refreshToken) {
        clearAuthCookies(res);
        return res.status(401).json({message: "인증 정보가 없습니다. 로그인 해주세요."});
    }

    let token = accessToken;
    const originalUrl = req.originalUrl.replace(/^\/api\/v1/, "");
    const apiUrl = `${BACKEND_URL}/api/v1${originalUrl}`;

    // 액세스 토큰 없고 리프레시만 있으면 재발급
    if (!token && refreshToken) {
        try {
            const tokens = await reissueAccessToken(refreshToken);
            token = setTokenCookies(res, tokens);
        } catch (err) {
            console.error("토큰 재발급 실패:", err);
            clearAuthCookies(res);
            return res.status(401).json({message: "토큰이 만료되었습니다. 다시 로그인 해주세요."});
        }
    }

    // 백엔드 호출 함수
    const callBackend = async (tok) => {
        const options = createRequestOptions(req.method, req.body, tok);
        return fetch(apiUrl, options);
    };

    try {
        let response = await callBackend(token);

        // 401 시 재발급 후 재시도
        if (response.status === 401 && refreshToken) {
            try {
                const tokens = await reissueAccessToken(refreshToken);
                token = setTokenCookies(res, tokens);
                response = await callBackend(token);
            } catch (err) {
                console.error("토큰 재발급 실패:", err);
                clearAuthCookies(res);
                return res.status(401).json({message: "인증에 실패했습니다. 로그인 해주세요."});
            }
        }

        // 응답 처리
        const ct = response.headers.get("content-type") || "";
        let data;
        if (ct.includes("application/json")) {
            data = await response.json();
        } else {
            const text = await response.text();
            try {
                data = JSON.parse(text);
            } catch {
                data = text;
            }
        }

        // 최종 응답 전달
        res.status(response.status).json(data);
    } catch (err) {
        console.error("프록시 처리 오류:", err);
        clearAuthCookies(res);
        res.status(500).json({message: "프록시 서버 오류"});
    }
}

module.exports = fetchWithAuth;

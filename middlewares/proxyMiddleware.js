require("dotenv").config();
const fetch = (...args) => import("node-fetch").then(({default: fetch}) => fetch(...args));

const BACKEND_URL = process.env.BACKEND_URL;
const isProduction = process.env.PROFILES === "prod";

const cookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: !isProduction ? "Lax" : "Strict",
    path: "/"
};

const excludedPaths = ["/kakao", "/naver", "/oauth2/callback", "/login", "/logout"];

function isOpenEndpoint(url) {
    return url.endsWith("/open");
}

async function reissueAccessToken(refreshToken) {
    if (!refreshToken) throw new Error("리프레시 토큰이 없습니다.");

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

function clearAuthCookies(res) {
    ["accessToken", "refreshToken", "expiresIn"].forEach(name => {
        res.clearCookie(name, cookieOptions);
    });
}

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

function createRequestOptions(method, body, token, headers = {}) {
    const isMultipart = headers['content-type']?.startsWith('multipart/form-data');

    const requestHeaders = {...headers};
    if (token) requestHeaders.Authorization = `Bearer ${token}`;
    if (!isMultipart && !requestHeaders["Content-Type"]) {
        requestHeaders["Content-Type"] = "application/json";
    }

    return {
        method,
        headers: requestHeaders,
        body: ["POST", "PUT", "PATCH"].includes(method) && body ? body : undefined
    };
}

async function fetchWithAuth(req, res, next) {
    const originalUrl = req.originalUrl.replace(/^\/api\/v1/, "");
    const apiUrl = `${BACKEND_URL}/api/v1${originalUrl}`;

    if (excludedPaths.some(path => req.path.includes(path)) || isOpenEndpoint(req.path)) {
        try {
            const token =  req.cookies["accessToken"] || null;
            console.log("token:", token);
            const options = createRequestOptions(req.method, req.body, token);
            const response = await fetch(apiUrl, options);

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

            return res.status(response.status).json(data);
        } catch (err) {
            console.error("프록시 처리 오류:", err);
            return res.status(500).json({message: "프록시 서버 오류"});
        }
    }

    const {accessToken, refreshToken} = req.cookies || {};

    if (!accessToken && !refreshToken) {
        clearAuthCookies(res);
        return res.status(401).json({message: "인증 정보가 없습니다. 로그인 해주세요."});
    }

    let token = accessToken;

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

    const rawHeaders = {...req.headers};
    delete rawHeaders["host"];
    delete rawHeaders["cookie"];

    const isMultipart = rawHeaders["content-type"]?.startsWith("multipart/form-data");

    const callBackend = async (tok) => {
        const body = isMultipart
            ? req.rawBody // multipart의 경우 Buffer 그대로 사용
            : req.method === "GET"
                ? null
                : JSON.stringify(req.body);

        const options = createRequestOptions(req.method, body, tok, rawHeaders);
        return fetch(apiUrl, options);
    };

    try {
        let response = await callBackend(token);

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

        res.status(response.status).json(data);
    } catch (err) {
        console.error("프록시 처리 오류:", err);
        clearAuthCookies(res);
        res.status(500).json({message: "프록시 서버 오류"});
    }
}

module.exports = fetchWithAuth;

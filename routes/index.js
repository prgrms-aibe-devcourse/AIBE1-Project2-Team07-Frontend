var express = require('express');
var path = require('path');
var router = express.Router();
const fetchWithAuth = require("../middlewares/authMiddleware");

/* GET home page. */
router.get('/', function (req, res, next) {
    res.sendFile(path.join(__dirname, '../public/home.html'));
});

router.get("/chat", async (req, res, next) => {
    try {
        const prompt = req.query.prompt;
        req.originalUrl = `/api/v1/mcp/chat?prompt=${prompt}`;
        await fetchWithAuth(req, res, async () => {
            const aiResponse = req.apiResponse;
            if (!aiResponse) {
                return res.status(500).json({message: "응답 데이터가 없습니다."});
            }
            res.json(aiResponse);
        });
    } catch (error) {
        console.error("AI 요청 처리 중 오류 발생:", error);
        res.status(500).json({message: "서버 오류"});
    }
});

module.exports = router;

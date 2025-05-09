var express = require('express');
var router = express.Router();
var path = require('path');
const fetchWithAuth = require("../middlewares/authMiddleware");

router.use('/profile', express.static(path.join(__dirname, '../public')));


/* GET community page. */
router.get('/', function (req, res, next) {
    res.sendFile(path.join(__dirname, '../public/trainer-list.html'));
});

router.get('/profile/:trainerNickname', function (req, res, next) {
    const trainerNickname = req.params.trainerNickname;

    res.sendFile(path.join(__dirname, '../public/trainer-profile.html'));
});

router.get('/users', async (req, res, next) => {
    try {
        const page = req.query.page || 0;
        req.originalUrl = `/api/v1/trainers?page=${page}`;
        await fetchWithAuth(req, res, async () => {
            const data = req.apiResponse;
            if (!data) {
                return res.status(500).json({message: "응답 데이터가 없습니다."});
            }
            res.json(data);
        });
    } catch (error) {
        console.error("AI 요청 처리 중 오류 발생:", error);
        res.status(500).json({message: "서버 오류"});
    }
});

router.get('/reviews', async (req, res, next) => {
    try {
        req.originalUrl = `/api/v1/reviews`;
        await fetchWithAuth(req, res, async () => {
            const data = req.apiResponse;
            if (!data) {
                return res.status(500).json({message: "응답 데이터가 없습니다."});
            }
            res.json(data);
        });
    } catch (error) {
        console.error("AI 요청 처리 중 오류 발생:", error);
        res.status(500).json({message: "서버 오류"});
    }
});

module.exports = router;
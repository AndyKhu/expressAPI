const express = require('express')
const { Register, Login, RefreshToken } = require('./auth.service')
const router = express.Router()

const serviceResponse = (statusData,res) => {
    if(statusData.status === 200){
        res.json(statusData.data);
    }
    else
        res.status(400).send(statusData.err)
}

router.post("/register", async (req, res, next) => {
    try{
        const userData = req.body
        const statusData = await Register(userData)
        serviceResponse(statusData,res)
    }catch(err){
        next(err);
    }
})

router.post('/login', async (req, res, next) => {
    try {
        const { username, password } = req.body;
        const statusData = await Login(username,password)
        serviceResponse(statusData,res)
    } catch (err) {
        next(err);
    }
});

router.post('/refreshToken', async (req, res, next) => {
    try {
        const { refreshToken } = req.body;
        const statusData = await RefreshToken(refreshToken)
        serviceResponse(statusData,res)
    } catch (err) {
        next(err);
    }
});

module.exports = router;
const Router = require("express").Router;
const {
    tokenGenerator,
    voiceResponse,
    twilioCallback,
    hangup,
} = require("../handler.js");

const router = new Router();

router.get("/token", (req, res) => {
    res.send(tokenGenerator());
});

router.post("/voice", (req, res) => {
    res.set("Content-Type", "text/xml");
    res.send(voiceResponse(req.body));
});

router.post("/twilioCallback", (req, res) => {
    const response = twilioCallback(req.body, req.query);
    res.status(200).send(response);
});

router.post("/hangup", (req, res) => {
    res.set("Content-Type", "text/xml");
    const response = hangup(req.body, req.query);
    res.send(response);
});

module.exports = router;

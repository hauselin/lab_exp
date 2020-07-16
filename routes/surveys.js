// SURVEY TEMPLATES
var express = require("express");
var router = express.Router()

router.get('/gritshort', function (req, res) {
    res.sendFile('task.html', { root: '../lab_exp/surveys/gritshort' });
});

router.get('/bigfiveaspect', function (req, res) {
    res.sendFile('task.html', { root: '../lab_exp/surveys/bigfiveaspect' });
});

module.exports = router;
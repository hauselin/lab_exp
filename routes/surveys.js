// SURVEY TEMPLATES
var express = require("express");
var router = express.Router()

router.get('/grit-short', function (req, res) {
    res.sendFile('task.html', { root: '../lab_exp/surveys/grit_short' });
});

router.get('/bigfive-aspect', function (req, res) {
    res.sendFile('task.html', { root: '../lab_exp/surveys/bigfive_aspect' });
});

module.exports = router;
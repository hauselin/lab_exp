// TASK TEMPLATES
var express = require("express");
var router = express.Router()

router.get('/delaydiscount', function (req, res) {
    res.sendFile('task.html', { root: '../lab_exp/tasks/delaydiscount' });
});

router.get('/symbolcount', function (req, res) {
    res.sendFile('task.html', { root: '../lab_exp/tasks/symbolcount' });
});

router.get('/stroop', function (req, res) {
    res.sendFile('task.html', { root: '../lab_exp/tasks/stroop' });
});

module.exports = router;
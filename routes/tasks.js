// TASK TEMPLATES
var express = require("express");
var router = express.Router()

router.get('/delay-discount', function (req, res) {
    res.sendFile('task.html', {root: '../lab_exp/tasks/delay_discount'});
});

router.get('/symbol-count', function (req, res) {
    res.sendFile('task.html', {root: '../lab_exp/tasks/symbol_count'});
}); 

router.get('/stroop', function (req, res) {
    res.sendFile('task.html', {root: '../lab_exp/tasks/stroop'});
});

module.exports = router;
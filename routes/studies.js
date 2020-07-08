// STUDIES
var express = require("express");
var router = express.Router()

router.get('/studyA', function (req, res) {
    res.sendFile('runstudy.html', {root: '../lab_exp/studies/studyA'});
});

module.exports = router;
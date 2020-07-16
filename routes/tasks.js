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

// TODO Maham: dynamic route; the way we've set up our routes now (/:uniquestudyid), we'll have to do error handling or try/catch: first the root is lab_exp/tasks; if not found, then studies (lab_exp/studies); if still not found, then surveys (lab_exp/surveys)
// dynamic task route
// router.get('/:uniquestudyid', function (req, res) {
//     const root = '../lab_exp/tasks/' + req.params.uniquestudyid;
//     res.sendFile('task.html', { root: root })
// });

module.exports = router;
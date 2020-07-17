// SHOW ROUTES (STUDIES, SURVEYS, TASKS)
var express = require("express");
var router = express.Router()

// TODO Maham: I think this single rotue is enough for all tasks/studies/surveys?
router.get('/:type/:uniquestudyid', function (req, res) {
    const root = '../lab_exp/' + req.params.type + '/' + req.params.uniquestudyid;
    res.sendFile('task.html', { root: root })
});

module.exports = router;
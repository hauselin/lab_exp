// SHOW ROUTES (STUDIES, SURVEYS, TASKS)
var express = require("express");
var router = express.Router();
const fs = require('fs');

// TODO Maham: I think this single rotue is enough for all tasks/studies/surveys?
router.get('/:type/:uniquestudyid', function (req, res, next) {
    const root = '../app/' + req.params.type + '/' + req.params.uniquestudyid;
    // check if file exists without opening it
    fs.access(root + '/' + 'task.html', fs.F_OK, (err) => {
        if (err) {
            console.log(err);
            console.log('Route not found. Moving to next route.')
            next(); // if file doesn't exist, go to next route
        } else {
            res.sendFile('task.html', { root: root })
        }
    })
});

module.exports = router;
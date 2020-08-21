// SHOW ROUTES (STUDIES, SURVEYS, TASKS)
const express = require("express");
const router = express.Router();
const fs = require('fs');

router.get('/:type/:uniquestudyid', function (req, res, next) {
    const root = '../lab_exp/' + req.params.type + '/' + req.params.uniquestudyid;

    // check if file exists without opening it
    fs.access(root + '/' + 'task.html', fs.F_OK, (err) => {
        if (err) {
            if (root.endsWith(".map")) { // to catch weird issue with consent forms
                res.sendStatus(100);
            } else {
                console.log('Route not found. Moving to next route.')
                console.log(err);
                next(); // if file doesn't exist, go to next route
            }
        } else {
            res.sendFile('task.html', { root: root })
        }
    })
});

module.exports = router;
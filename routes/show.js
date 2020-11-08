// SHOW ROUTES (STUDIES, SURVEYS, TASKS)
const express = require("express");
const router = express.Router();
const fs = require('fs');
const helper = require('../routes/helpers/helpers');

router.get('/:type/:uniquestudyid', function (req, res, next) {

    var home = "lab_exp";
    if (process.env.NODE_ENV == 'production') {
        home = "app";
    }
    const root = '../' + home + '/' + req.params.type + '/' + req.params.uniquestudyid;

    // check if file exists without opening it
    fs.access(root + '/' + 'task.html', fs.F_OK, (err) => {
        if (err) {
            if (root.endsWith(".map")) { // to catch weird issue with consent forms
                res.sendStatus(100);
            } else {
                console.log('Route not found. Moving to next route.')
                // console.log(err);
                helper.cssFix(req, res, "comingSoon", 200);
                // next(); // if file doesn't exist, go to next route
            }
        } else {
            res.sendFile('task.html', { root: root })
        }
    })
});

// render comingSoon.ejs for all other routes
router.get("/:type/:uniquestudyid", function (req, res) {
    helper.cssFix(req, res, "comingSoon", 200);
})

module.exports = router;
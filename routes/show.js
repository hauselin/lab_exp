// SHOW ROUTES (STUDIES, SURVEYS, TASKS)
const express = require("express");
const router = express.Router();
const fs = require("fs");
const helper = require("../routes/helpers/helpers");

router.get("/:type/:uniquestudyid", function (req, res, next) {
  var home = "lab_exp";
  if (process.env.NODE_ENV == "production") {
    home = "app";
  }
  const root =
    "../" + home + "/" + req.params.type + "/" + req.params.uniquestudyid;

  // TODO if has query parameter "count=true", query database to count no. of items counter (else don't query)
  // http://localhost:8080/surveys/gritshort/?counter=true
  let counter = 0;
  if (req.query.counter) {
    // count=true exist in query string
    console.log("query database");
    // TODO: retrieve in data the number of people who completed the task -> do them inside DataLibrary
    counter = 9999999;
  }

  // check if html static file exists without opening it
  fs.access(root + "/" + "task.html", fs.F_OK, (err) => {
    if (err) {
      if (root.endsWith(".map")) {
        // catch weird issue with consent forms
        res.sendStatus(100);
      } else {
        console.log("Route not found. Moving to next route.");
        helper.cssFix(req, res, "comingSoon", 200);
        // next(); // if file doesn't exist, go to next route
      }
    } else {
      // TODO query datalibrary here
      console.log(root + "/" + "task.html");
      res.sendFile("task.html", {
        root: root,
        headers: {
          "X-counter": counter,
        },
      });
    }
  });
});

// render comingSoon.ejs for all other routes
router.get("/:type/:uniquestudyid", function (req, res) {
  helper.cssFix(req, res, "comingSoon", 200);
});

module.exports = router;

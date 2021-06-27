// SHOW ROUTES (STUDIES, SURVEYS, TASKS)
const express = require("express");
const router = express.Router();
const fs = require("fs");
const helper = require("../routes/helpers/helpers");
const DataLibrary = require("../models/datalibrary");

router.get("/:type/:uniquestudyid", function (req, res, next) {
  var home = "lab_exp";
  if (process.env.NODE_ENV == "production") {
    home = "app";
  }
  const root =
    "../" + home + "/" + req.params.type + "/" + req.params.uniquestudyid;

  // TODO if has query parameter "count=true", query database to count no. of items counter (else don't query)
  // http://localhost:8080/surveys/gritshort/?counter=true
  var promise = new Promise(function(resolve, reject) {
    if (req.query.count) {
      DataLibrary.countDocuments({ uniquestudyid: req.params.uniquestudyid }, function(err, count){
        console.log( "Number of docs: ", count );
        // count=true exist in query string
        console.log("query database");
        resolve(count);
      });
    } else {
      resolve(0);
    }
  });
  promise.then(function(value) {
      counter=value;
  }).then(function() {
      console.log(counter)
  }).then(function() {
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
});

// render comingSoon.ejs for all other routes
router.get("/:type/:uniquestudyid", function (req, res) {
  helper.cssFix(req, res, "comingSoon", 200);
});

module.exports = router;

var express = require("express");
var router = express.Router()

router.get('/', function (req, res) {
    // TODO Maham/Frank: move remaining contents of routes.js here
    // render {uniquestudyid}.ejs in views directory
    res.render("index.ejs", { num_tasks: 1, num_studies: 2, num_entries: 3, entries_delaydiscount: 4, entries_stroop: 5, entries_symbolcount: 6, entries_mentalmath: 6 });
});

module.exports = router;
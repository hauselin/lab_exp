var express = require("express");
var router = express.Router();

router.get("/:uniquestudyid/viz", function (req, res) {
    res.render('viz/' + req.params.uniquestudyid + ".ejs"); // render {uniquestudyid}.ejs in views directory
});

module.exports = router;
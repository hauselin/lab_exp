var express = require("express");
var router = express.Router();

router.get("/:type/:uniquestudyid/viz", function (req, res) {
    const file = 'viz/' + req.params.uniquestudyid + '.ejs';
    res.render(file); // render {uniquestudyid}.ejs in views directory
});

module.exports = router;
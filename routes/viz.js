var express = require("express");
var router = express.Router(); 

router.get("/delay-discount/viz", function (req, res) {
    res.render("delay_discount.ejs"); // render delay_discount.ejs in views directory
});

module.exports = router;
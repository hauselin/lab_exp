var express = require("express");
var router = express.Router();
var DataLibrary = require("../models/datalibrary")

router.get("/:type/:uniquestudyid/viz", function (req, res) {
    Promise.all([
        DataLibrary.find({uniquestudyid:req.params.uniquestudyid}).lean(),
    ])
        .then(([data]) => {
            console.log(data);
            const file = 'viz/' + req.params.uniquestudyid + '.ejs';
            res.render(file, {data: data}); // render {uniquestudyid}.ejs in views directory
        })
});

module.exports = router;
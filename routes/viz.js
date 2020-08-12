var express = require("express");
var router = express.Router();
var DataLibrary = require("../models/datalibrary")

router.get("/:type/:uniquestudyid/viz", function (req, res) {
    Promise.all([
        DataLibrary.find({ uniquestudyid: req.params.uniquestudyid }).lean(),
    ])
        .then(([data]) => {
            console.log(data);
            data_array = [];
            for (i = 0; i < data.length; i++) {
                data_array.push.apply(data_array, data[i].data);
            }
            // TODO Frank: now that we know which figures we want to plot, we know what variables we want to pass to the client, so we might want to do all the processing/filtering here instead? this way, we don't end up passing lots of identifying information too....

            const file = 'viz/' + req.params.uniquestudyid + '.ejs';
            res.render(file, { data: data, data_array: data_array }); // render {uniquestudyid}.ejs in views directory
        })
});

module.exports = router;
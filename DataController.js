const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/datalibrary',
    { useUnifiedTopology: true, useNewUrlParser: true });

var dataLibrarySchema = new mongoose.Schema({}, { strict: false });
var DataLibrary = mongoose.model('DataLibrary', dataLibrarySchema);

module.exports = {
    create(req, res) {
        DataLibrary.create({
            subject: req.body[0].subject,
            task: req.body[0].task,
            experiment: req.body[0].experiment,
            condition: req.body[0].condition,
            browser: req.body[0].browser,
            datetime: req.body[0].datetime,
            data: req.body,
        }, function (err, data) {
            if (err) { // error
                console.log(err); // print error to nodejs console
                res.sendStatus(500);  // send internal server error (500: http status code internal server error)
            } else { // success
                // console.log(data); // print req.body in nodejs console
                res.sendStatus(200); // send OK to client (200: http status code OK)
            }
        });
    }
}
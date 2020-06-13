const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/jspsych',
    { useUnifiedTopology: true, useNewUrlParser: true });

var jspsychDataSchema = new mongoose.Schema({}, { strict: false });
var DataCollection = mongoose.model('DataCollection', jspsychDataSchema);

module.exports = {
    create(req, res) {
        DataCollection.create({
            subject: req.body[0].subject,
            task: req.body[0].task,
            experiment: req.body[0].experiment,
            condition: req.body[0].condition,
            browser: req.body[0].browser,
            datetime: req.body[0].datetime,
            data: req.body
        })
    }
}
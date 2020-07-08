// TASK TEMPLATES

module.exports = function (app) {

    app.get('/delay-discount', function (req, res) {
        res.sendFile('../tasks/delay_discount/task.html');
    });
    app.get('/symbol-count', function (req, res) {
        res.sendFile(path.join(__dirname + '/tasks/symbol_count/task.html'));
    });
    app.get('/stroop', function (req, res) {
        res.sendFile(path.join(__dirname + '/tasks/stroop/task.html'));
    });

}
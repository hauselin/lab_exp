// TASK TEMPLATES
app.get('/delay-discount', function (req, res) {
    res.sendFile(path.join(__dirname + '/tasks/delay_discount/task.html'));
});
app.get('/symbol-count', function (req, res) {
    res.sendFile(path.join(__dirname + '/tasks/symbol_count/task.html'));
});
app.get('/stroop', function (req, res) {
    res.sendFile(path.join(__dirname + '/tasks/stroop/task.html'));
});
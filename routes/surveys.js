// SURVEY TEMPLATES
app.get('/grit-short', function (req, res) {
    res.sendFile(path.join(__dirname + '/surveys/grit_short/task.html'));
});
app.get('/bigfive-aspect', function (req, res) {
    res.sendFile(path.join(__dirname + '/surveys/bigfive_aspect/task.html'));
});
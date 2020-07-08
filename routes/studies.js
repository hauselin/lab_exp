// STUDIES
app.get('/studyA', function (req, res) {
    res.sendFile(path.join(__dirname + '/studies/studyA/runstudy.html'))
});
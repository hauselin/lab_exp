module.exports = (app) => {
        // FIND STATIC FILES
    app.use('/jsPsych', express.static(__dirname + "/jsPsych"));
    app.use(express.static(path.join(__dirname, 'tasks/symbol_counting')));

    // ROUTING
    app.get('/', function(req, res) {
        res.sendFile(path.join(__dirname + '/tasks/symbol_counting/experiment.html'));
    });
}
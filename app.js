var express = require('express'); 
var app = express();
var server = app.listen(8080, function() {
    console.log("Server started on port %d", server.address().port);
});
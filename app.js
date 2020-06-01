// LOAD MODULES 
const express = require('express'); 
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');       // GET THE CURRENT PATH
const {sequelize} = require('./models')
const config = require('./config/config');
const app = express();              // INSTANTIATE THE APP

app.use(morgan('combine'));
app.use(bodyParser.json());         // allow app to parse any json request 
app.use(cors());                    // allow any host to access this app

// FIND STATIC FILES
app.use('/jsPsych', express.static(__dirname + "/jsPsych"));
app.use(express.static(path.join(__dirname, 'tasks/symbol_counting')));
    
require('./routes')(app)

// START SERVER
sequelize.sync().then(() => {
    app.listen(config.port);
    console.log(`Server started on port ${config.port}`)
})

const express = require('express');
const fileUpload = require('express-fileupload');
const bodyParser = require('body-parser');
const mysql = require('promise-mysql');
const path = require('path');
const app = express();

const {currentStatus} = require('./routes/current-status');
const port = 5005;
const basicAuth = require('express-basic-auth')
 
app.use(basicAuth({
    challenge: true,
    users: { 
        'admin': 'Biometrix123abc',
        'oscar': 'ThinkVision.24'
    }
}))

// create connection to database
// the mysql.createConnection function takes in a configuration object which contains host, user, password and the database name.
const db = mysql.createConnection ({
    host: 'localhost',
    port: '3312',
    user: 'root',
    password: 'ThinkVision.24',
}).then((db) => {
    global.db = db;

    // configure middleware
    app.set('port', process.env.port || port); // set express to use this port
    app.set('views', __dirname + '/views'); // set express to look in this folder to render our view
    app.set('view engine', 'ejs'); // configure template engine
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(bodyParser.json()); // parse form data client
    app.use(express.static(path.join(__dirname, 'public'))); // configure express to use public folder
    app.use(fileUpload()); // configure fileupload
    
    // routes for the app
    app.get('/', currentStatus);
    
    
    // set the app to listen on the port
    app.listen(port, () => {
        console.log(`Server running on port: ${port}`);
    });
});

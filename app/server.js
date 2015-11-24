var express = require('express');
var exphbs  = require('express-handlebars');
var routes = require('./configuration/routes');
var events = require('./configuration/events');
var app = express();

app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

app.get('/', routes.index);

// Disable etag headers on responses
app.disable('etag');

// Set /static as our static content dir
app.use('/static', express.static(__dirname + "/static/"));

var server = app.listen(5000, events.express.onStartup);

var io = require('socket.io').listen(server);

io.on('connection', events.socket.socketUserConnected);
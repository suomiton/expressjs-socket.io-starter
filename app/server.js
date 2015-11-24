var express = require('express');
var exphbs  = require('express-handlebars');
var routes = require('./configuration/routes');
var events = require('./configuration/events');
var app = express();

var port = process.env.PORT || 8080;

app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

if(process.env.NODE_ENV === "production") {
	// Enable handlebars view cache when in production mode
	app.enable('view cache');
}

app.get('/', routes.index);

// Disable etag headers on responses
app.disable('etag');

// Set /static as our static content dir
app.use('/static', express.static(__dirname + "/static/"));

var server = app.listen(port, events.express.onStartup);

var io = require('socket.io').listen(server);

io.on('connection', events.socket.onUserConnected);
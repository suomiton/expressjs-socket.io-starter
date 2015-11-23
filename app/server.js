var express = require('express');
var exphbs  = require('express-handlebars');
var app = express();

app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

app.get('/', function (req, res) {
  res.render('home');
});

var server = app.listen(5000, function () {
  var host = this.address().address;
  var port = this.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});

var io = require('socket.io').listen(server);

io.on('connection', function(socket){
  console.log('a user connected');
});

var seconds = 0;

setInterval(function() {
	seconds++;
	console.log('broadcasting');
	io.emit('interval event', 'Time passed: ' + seconds + 's');
}, 1000);
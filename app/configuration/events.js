module.exports = {
	express: {
		onStartup: function () {
			var host = this.address().address;
			var port = this.address().port;

			console.log('Example app listening at http://%s:%s', host, port);
		}	
	},
	socket: {
		socketUserConnected: function(socket) {
			console.log('A user connected. Starting polling sequence');

			var seconds = 0,
				interval = 5; // seconds

			setInterval(function() {
				seconds = seconds + interval;				
				socket.emit('interval event', 'Time passed: ' + seconds + 's');
			}, (interval * 1000));
		}
	}	
};
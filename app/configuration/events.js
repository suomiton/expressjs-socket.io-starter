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
			console.log('a user connected');
		}
	}	
};
var static = require("node-static");


var files = new static.Server("./public");

var http = require("http").createServer(function(request, response) {
	request.addListener("end", function() {
		files.serve(request, response);
	});
}).listen(8080);

var io = require("socket.io").listen(http);

io.sockets.on("connection", function(socket) {

	// Registration:
	socket.on("register", function(register) {
		var currentTime = new Date();
		var timeString = currentTime.getHours() + ":" + currentTime.getMinutes();
		switch (register.who) {
			case "client":
					socket.set("name", register.name);
					socket.emit("register", {
						message: "Вы были успешно подключены! Ожидайте оператора.",
						time: timeString
					});
					socket.broadcast.emit("new-client", {
						time: timeString
					});
				break;
				
			case "operator":
					socket.emit("register", {
						message: "Вы были успешно подключены к серверу!",
						time: timeString
					});
					socket.broadcast.send("Оператор подключился!");
				break;
		}
	});

	socket.on("message", function(message) {
			socket.broadcast.send(message);
	});
	
	socket.on("cursor", function(coordinates) {
		socket.broadcast.emit("cursor", coordinates);
	});
	
	socket.on("disconnect", function(disconnect) {
		socket.broadcast.emit("other-side-disconnect", {
			time: new Date()
		});
	});
});

console.log("Server has started!");
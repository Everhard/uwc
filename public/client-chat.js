// Клиентский HTML:
var chatCode = '\
<script src="/socket.io/socket.io.js"></script>\
<link rel="stylesheet" type="text/css" href="style.css" />\
<div id="support-messenger">\
	<div id="messenger-head">Support <img class="close" src="/images/close.png" /></div>\
	<div id="messenger-talk-window"></div>\
	<button id="messenger-send-button"></button>\
	<div id="messenger-input"><textarea></textarea></div>\
</div>\
<div id="support-messenger-button">Задать вопрос</div>\
<div id="operator-arrow"></div>';

// Вывод сообщения в чат:
function putMessage(message, fromWho, time) {
	$("#messenger-talk-window").append("<div class='message'><div class='name'>" + fromWho + "</div><div class='time'>" + time + "</div><div class='text'>" + message + "</div></div>");
	var scrollTo = $("#messenger-talk-window .message").size() * 60;
	$("#messenger-talk-window").scrollTop(scrollTo);
	$("#messenger-input textarea").val('');
}

// Запуск чата:
function startChat() {
	var socket = io.connect('http://localhost:8080');
	
	socket.emit("register", {
		who: "client"
	});
	
	// Статус подключения:
	socket.on("register", function(register) {
		putMessage(register.message, "Сервер", register.time);
	});
	
	socket.on('message', function (message) {
		var time = new Date();
		putMessage(message, "Оператор", time.getHours() + ":" + time.getMinutes())
	})
	
	socket.on('cursor', function (cursor) {
		console.log(cursor.x + " " + cursor.y);
		moveCursor(cursor);
	})
	
	// Отправка сообщения:
	$("#messenger-send-button").click(function() {
		var message = $("#messenger-input textarea").val();
		socket.send(message, function() {
			var time = new Date();
			putMessage(message, "Я", time.getHours() + ":" + time.getMinutes());
		});
	});
	
	$("#messenger-input textarea").keypress(function(event) {
		if (event.which == 13) $("#messenger-send-button").click();
	});
	
}

// Передвижение курсора:
function moveCursor(coordinations) {
	$("#operator-arrow").animate({
		"top" : coordinations.y,
		"left": coordinations.x
	});
}

$(document).ready(function() {

	// Добавляем HTML:
	$("body").append(chatCode);

	var chatConnected = false;

	$("#support-messenger").draggable({
		handle: "#messenger-head"
	});
	
	// Запускаем чат:
	$("#support-messenger-button").click(function() {
		$("#support-messenger, #operator-arrow").fadeIn(500);
		if (!chatConnected) {
			startChat();
			chatConnected = true;
		}
	});
	
	$("#messenger-head .close").click(function() {
		$("#support-messenger, #operator-arrow").fadeOut(500);
	});
	
	
});

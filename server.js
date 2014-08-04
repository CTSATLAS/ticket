var express 	= require('express');
var mongoose 	= require('mongoose');
var app 		= express();
var server		= require('http').Server(app);
var io			= require('socket.io')(server);

mongoose.connect('mongodb://localhost/ticketsystem');

var ticket_schema = mongoose.Schema({
	firstname : String,
	lastname : String,
	email : String,
	description : String,
	error_url : String,
	user_id : Number,
	location : String,
	viewed : { type : Boolean, default : false },
	open : { type : Boolean, default : true }
});

var Ticket = mongoose.model('Ticket', ticket_schema);

app.use(express.static(__dirname + '/client'));

app.get('/', function(req, res){
	res.sendfile('client/html/index.html')
});

app.get('/ticket', function(req, res){
	Ticket.find(req.query, function(err, tickets){
		res.send(tickets);
	});
});

app.get('/ticket/create', function(req, res){
	var ticket = new Ticket(req.query);

	ticket.save(function(){
		io.sockets.emit('ticket:created');
		res.send({ success : true, output : ticket});
	});
});

app.get('/ticket/all', function(req, res){
	
	Ticket.find({})
	.exec(function(err, tickets){
		res.send(tickets);
	});
});

app.get('/ticket/update', function(req, res){
	res.send({ success : true, output : 'update'});
});

app.get('/ticket/delete', function(req, res){
	res.send({ success : true, output : 'delete'});
});

io.on('connection', function(socket){

	socket.on('ticket', function(data){
		Ticket.find({}, function(err, tickets) {
			socket.emit('ticket', tickets);
		});
	});

	socket.on('ticket:update', function(data){
		Ticket.update({
			_id : data._id
		}, data.data,
		function(err, rowsAffected, ticket){
			socket.emit('ticket:update', ticket);
		});
	});

	socket.on('ticket:viewed', function(data){
		Ticket.update(data, {
			viewed : true
		}, function(err, rowsAffected, ticket){
			socket.emit('ticket:viewed', ticket);
		});
	});

	socket.on('ticket:resolved', function(data){
		Ticket.update(data, {
			open : false
		}, function(err, rowsAffected, ticket){
			io.sockets.emit('ticket:resolved', ticket);
		});
	});
});

server.listen(2028);
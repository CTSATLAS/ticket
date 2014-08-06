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
	open : { type : Boolean, default : true },
	comments : [{
		author : String,
		body : String,
		created : { type : Date, default : Date.now() }
	}],
	opened : { type : Date, default : Date.now() },
	created : { type : Date, default : Date.now() }
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

app.get('/ticket/:id', function(req, res){

	ticket.find(req.query, function(err, tickets){
		res.send(tickets);
	});

});

io.on('connection', function(socket){

	socket.on('ticket:get', function(data){
		Ticket.find({}, function(err, tickets) {
			socket.emit('ticket:get', tickets);
		});
	});

	socket.on('ticket:update', function(data){
		Ticket.update(data.search, data.update,
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

	socket.on('ticket:addComment', function(data){
		Ticket.find({ _id : data.search._id }, function(err, ticket){
			console.log(ticket.comments);
			ticket.comments.push(data.update.comment);
			ticket.save();
		});
	});
});

server.listen(2028);
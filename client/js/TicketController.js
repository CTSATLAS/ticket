angular.module('app')
.controller('TicketController', function($scope, $http, $stateParams, socket){
	console.log($stateParams);
	socket.emit('ticket');

	socket.on('ticket', function(tickets){
		$scope.tickets = tickets;
	});

	socket.on('ticket:update', function(ticket){
		console.log(ticket);
	});

	$scope.resolve = function(ticket, data) {
		socket.emit('ticket:update', { _id : ticket._id, data : data});
	};

	$scope.update = function(_id, data) {
		socket.emit('ticket:update', { _id : _id, data : data});
	};
});
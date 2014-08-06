angular.module('app')
.service('Ticket', function(socket){
	this.init = function(callback) {
		socket.emit('ticket:get');
		socket.on('ticket:get', callback);
	};

	this.markViewed = function(id) {
		socket.emit('ticket:update', {
			search : {
				_id : id
			},
			update : {
				viewed : true
			}
		});
	};

	this.markUnviewed = function(id) {
		socket.emit('ticket:update', {
			search : {
				_id : id
			},
			update : {
				viewed : false
			}
		});
	};

	this.markResolved = function(id) {
		socket.emit('ticket:update', {
			search : {
				_id : id
			},
			update : {
				open : false
			}
		});
	};

	this.markOpened = function(id) {
		socket.emit('ticket:update', {
			search : {
				_id : id
			},
			update : {
				open : true
			}
		});
	};

	this.addComment = function(id, author, body) {
		socket.emit('ticket:addComment', {
			search : {
				_id : id
			},
			update : {
				comment : {
					author : author,
					body : body
				}
			}
		});
	}
})
.controller('TicketController', function($scope, $http, tickets) {
	$scope.tickets = tickets;
});
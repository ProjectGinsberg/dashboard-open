angular.module('gb.resources')
.factory('Sleep', ['$resource',
	function($resource) {
		return $resource('/data/o/sleep/:id', {id: '@id'});
	}
]);

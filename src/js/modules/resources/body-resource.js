angular.module('gb.resources')
.factory('Body', ['$resource',
	function($resource) {
		return $resource('/data/o/body/:id', {id: '@id'});
	}
]);

angular.module('gb.resources')
.factory('Tags', ['$resource',
	function($resource) {
		return $resource('/data/tags');
	}
]);

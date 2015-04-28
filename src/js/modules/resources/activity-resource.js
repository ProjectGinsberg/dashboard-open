angular.module('gb.resources')
.factory('Activity', ['$resource', function($resource) {
	return $resource('/data/o/activity/:id', {id: '@id'});
}]);

'use strict';
/**
TODO: DOCUMENT
TODO: Not really a resource is it?
 */
angular.module('gb.resources')
.factory('Stats', ['$resource', '$log', '$rootScope', function($resource, $log, $rootScope) {
 	var resource = $resource('/data/stats/:series', {})
	return resource;
}]);

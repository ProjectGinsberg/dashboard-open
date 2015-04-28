'use strict';

angular.module('gb.resources', ['ngResource']);

angular.module('gb.resources')
	.factory('Nutrition', ['$resource',
		function($resource) {
			return $resource('/data/o/nutrition/:id', {
				id: '@id'
			});
		}
	])
// DEPRECATED??
.factory('Social', ['$resource',
	function($resource) {
		return $resource('/data/o/social', {
			id: '@id'
		});
	}
]);

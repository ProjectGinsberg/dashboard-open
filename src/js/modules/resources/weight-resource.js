angular.module('gb.resources')
.factory('Weight', ['$resource',
		function($resource) {
			return $resource('/data/o/weight/:id', {
				id: '@id'
			});
		}
]);

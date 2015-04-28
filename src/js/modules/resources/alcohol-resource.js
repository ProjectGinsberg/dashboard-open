angular.module('gb.resources')
.factory('Alcohol', ['$resource',
		function($resource) {
			return $resource('/data/o/alcohol/:id', {
				id: '@id'
			});
		}
]);

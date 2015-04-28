angular.module('gb.resources')
.factory('Nutrition', ['$resource',
		function($resource) {
			return $resource('/data/o/Nutrition/:id', {
				id: '@id'
			});
		}
]);

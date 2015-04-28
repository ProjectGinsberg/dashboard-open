angular.module('gb.resources')
.factory('Wellbeing', ['$resource',
		function($resource) {
			return $resource('/data/wellbeing/:id', {
				id: '@id'
			});
		}
]);

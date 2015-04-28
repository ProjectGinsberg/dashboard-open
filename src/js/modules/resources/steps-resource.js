angular.module('gb.resources')
.factory('StepCount', ['$resource',
		function($resource) {
			return $resource('/data/o/stepcount/:id', {
				id: '@id'
			});
		}
]);

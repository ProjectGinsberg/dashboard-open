directives.directive('objectiveDataSelection', function() {
	return {
		controller: ['$scope', '$cookies', 'Social', 'Alcohol', 'Exercise', 'StepCount', 'Sleep', 'Nutrition', 'Body',
		function($scope, $cookies, Social, Alcohol, Exercise, StepCount, Sleep, Nutrition, Body) {
			'use strict';
			// I suppose this isn't unreasonable
			// A lot of this is made redundant by the introduction of data series
			var objectiveSelectionRange = [
				{id: 'sleep',		name: 'Sleep',		units: 'Time', 	property: 'total_sleep', url: '/data/o/sleep', resource: Sleep},
				{id: 'exercise', 	name: 'Exercise',	units: 'Activities',	property: 'activity_type',		url: '/data/o/exercise', resource: Exercise},
				{id: 'steps', 	name: 'Step Count',	units: 'Steps',	property: 'step_count',		url: '/data/o/stepcount', resource: StepCount},
				{id: 'alcohol', 	name: 'Alcohol',	units: 'Units',	property: 'units',		url: '/data/o/alcohol', resource: Alcohol},
				{id: 'social',		name: 'Social',		units: 'Posts',			property: 'posts',	 detail_property: 'posts' ,	url: '/data/o/social', resource: Social},
				{id: 'nutrition',	name: 'Nutrition', 	units: 'kCals', property: 'calories', url: '/data/o/nutrition', resource: Nutrition},
				{id: 'weight',		name: 'Weight',		units: 'kg', 	property: 'weight', url: '/data/o/body', resource: Body},
			];

			$scope.objectiveSelectionRange = function() {
				 return objectiveSelectionRange;
			};

			$scope.objectiveSelection = function(objectiveId) {
				if (objectiveId) {
					$cookies.objectiveSelection = objectiveId;
				}
				return _.findWhere(objectiveSelectionRange, {id: $cookies.objectiveSelection}) || objectiveSelectionRange[0];
			};

			$scope.objectiveSelectionTemplate = function() {
				var template = '/app/partials/tracker/' + $scope.objectiveSelection().id + '.html';
				return template;
			};
		}]
	};
});

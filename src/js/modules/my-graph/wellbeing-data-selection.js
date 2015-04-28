// FIXME: This doesn't backend onto a cookie properly for some reason
directives.directive('wellbeingDataSelection', function() {
	'use strict';
	return {
		controller: ["$scope", "$cookies", "UserService", function($scope, $cookies, UserService) {
			var wellbeingSelectionRange;

			$scope.wellbeingSelectionIndex = function(wellbeingIndex) {
				if (angular.isDefined(wellbeingIndex)) {
					$cookies.wellbeingSelectionIndex = "" + wellbeingIndex; // Cookies *must* be strings!
				}
				return $cookies.wellbeingSelectionIndex || 0;
			};

			$scope.wellbeingSelection = function() {
				if (!wellbeingSelectionRange) return undefined;
				return wellbeingSelectionRange[$scope.wellbeingSelectionIndex()];
			};

			$scope.wellbeingSelectionRange = function() {
				return wellbeingSelectionRange;
			};

			// Initialise from the user profile
			UserService.get().then(function(profile) {
				wellbeingSelectionRange = profile.wellbeing_metrics;
			});

		}]
	};
});

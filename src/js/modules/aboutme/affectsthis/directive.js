angular.module('gb.aboutMe')
.directive('affectsThis',
  ['CorrelationScaleService',function(CorrelationScaleService) {
	return {
		restrict: 'E',
		link: function(scope, element, attrs) { 
			scope.correlationRatingsScale = CorrelationScaleService.getRatingScale();
		},
		templateUrl: '/app/partials/aboutme/affectsthis.html'
	};
}]);
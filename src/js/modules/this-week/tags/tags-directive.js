angular.module('gb.thisWeek')
.directive('tags',
  ['TagHighlightService',function(TagHighlightService) {
  	var maxFontSize = 22;
  	var minFontSize = 13;

	return {
		restrict: 'E',
		link: function(scope, element, attrs) {
		  	scope.mouseover = function(tag) {
		  		TagHighlightService.activeTag(tag);
		  	};
		  	scope.mouseout = function(tag) {
		  		TagHighlightService.activeTag(null);
		  	};
		},
		templateUrl: '/app/partials/this-week/tags.html'
	};
}]);

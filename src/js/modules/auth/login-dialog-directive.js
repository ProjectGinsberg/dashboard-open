angular.module('gb.auth')
.directive('loginDialog', ['$log', 'AUTH_EVENTS', function ($log, AUTH_EVENTS) {
	return {
		restrict: 'E',
		template: '<div ng-if="visible" ng-include="\'/templates/auth/login-dialog.html\'">',
		link: function (scope) {
			var showDialog = function () {
				$log.log("Showing login dialog");
				scope.visible = true;
			};

			var hideDialog = function() {
				scope.visible = false;
			};

			scope.visible = false;
			scope.$on(AUTH_EVENTS.notAuthenticated, showDialog);
			scope.$on(AUTH_EVENTS.sessionTimeout, showDialog);
			scope.$on(AUTH_EVENTS.loginSuccess, hideDialog);
		}
	};
}]);

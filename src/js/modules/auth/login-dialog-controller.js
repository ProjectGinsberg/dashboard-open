// Should we just merge this into the directive?
angular.module('gb.auth')
.controller('LoginDialogController',
	['$scope', 'UserService', '$log',
	function($scope, UserService, $log) {
		$scope.email = '';
		$scope.password = '';
		$scope.error = "";
		$scope.submitting = false;

		$scope.submit = function() {
			$scope.error = "";
			$scope.submitting = true;
			UserService
				.login($scope.email, $scope.password)
				.then(function(resp) {
					$scope.error = "";
					$scope.submitting = false;
				},
				function(resp) {
					if (resp.data.status === 307) { // user disabled their account
											   // so push them onto the activation
											   // url
						var redirectUrl = resp.data.redirect_url;
						window.location.href = redirectUrl;
					}
					$scope.error = "Sorry! " + resp.data.message;
					$scope.submitting = false;
				});
		};
	}]
);

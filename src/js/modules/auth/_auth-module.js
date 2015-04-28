// Heavily inspired by
// https://medium.com/opinionated-angularjs/techniques-for-authentication-in-angularjs-applications-7bbf0346acec
angular.module('gb.auth', ['gb.auth.httpBuffer']);
angular.module('gb.auth')
.config(['$httpProvider', function($httpProvider) {
 	$httpProvider.interceptors.push('AuthInterceptor');
}]);

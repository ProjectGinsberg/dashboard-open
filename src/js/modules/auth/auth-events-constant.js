angular.module('gb.auth')
.constant('AUTH_EVENTS', {
	loginSuccess: 		'auth-login-success', // Hurrah
	loginFailed: 		'auth-login-failed', // An attempt to login failed
	logoutSuccess: 		'auth-logout-success', // Logout
	sessionTimeout: 	'auth-session-timeout', // Session timed out, unused
	notAuthenticated: 	'auth-not-authenticated', // Received a 40x
	notAuthorized: 		'auth-not-authorized' // Received a 40x
});

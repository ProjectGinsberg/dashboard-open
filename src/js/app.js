angular.module('gb.dashboard', [
	'ngAnimate',
	'ngCookies',
	'ngRoute',
	'ngResource',
	'LocalStorageModule',
	'angulartics',
	'angulartics.google.analytics',
	'angulartics.localytics',
	'gbDashboard.services',
	'gbDashboard.controllers',
	'gbDashboard.directives',
	'gbDashboard.filters',
	'dropdown',
	'gb.resources',
	'gb.home',
	'gb.myGraph',
	'gb.dayByDay',
	'gb.popover',
	'gb.notifications',
	'gb.aboutMe',
	'gb.aboutMeTags',
	'gb.thisWeek',
	'gb.tooltip',
	'gb.hopscotch',
	'gb.todayOnGinsberg',
	'anotherpit/angular-rollbar',
	'gb.utils',
	'gb.auth'
])
.config(['$routeProvider', function($routeProvider) {
	$routeProvider.when('/home', 		{templateUrl: '/templates/home/home.html'});
	$routeProvider.when('/recently-tracked', 		{templateUrl: '/app/partials/recentlytracked.html'});
	$routeProvider.when('/my-graph',    {templateUrl: '/templates/my-graph/my-graph.html'});
	$routeProvider.when('/day-by-day',  {templateUrl: '/templates/day-by-day/day-by-day.html'});
	$routeProvider.when('/this-week',  	{templateUrl: '/app/partials/this-week/this-week.html'});
	$routeProvider.when('/today', 		{templateUrl: '/templates/today-on-ginsberg/today-on-ginsberg.html'});
	$routeProvider.when('/me/tags',		{templateUrl: '/templates/about-me-tags/about-me-tags.html'});
	$routeProvider.when('/me/:visibleMetric', {
		templateUrl: '/app/partials/aboutme/aboutme.html',
		controller: 'AboutMeController'
	});
	$routeProvider.when('/me', {
		templateUrl: '/app/partials/aboutme/aboutme.html',
		controller: 'AboutMeController'
	});
	$routeProvider.when('/connections', {templateUrl: '/app/partials/connections.html'});
	$routeProvider.when('/account',     {templateUrl: '/app/partials/account.html'});
	$routeProvider.when('/wellbeing-results', {
		templateUrl: '/app/partials/survey_results.html',
		controller: 'SurveyResultsController'});
	$routeProvider.when('/signup', {
		templateUrl: '/templates/signup/signup.html',
		allowAnonymous: true,
	});
	$routeProvider.when('/test-screen', {templateUrl: '/templates/test-screen/test-screen.html'});
	$routeProvider.when('/sg', {
		templateUrl: '/app/partials/styleguide.html',
	});

	// Backwards compatibility
	$routeProvider.when('/environment', {redirectTo: '/my-graph'});
	$routeProvider.when('/reports', {redirectTo: '/day-by-day'});
	$routeProvider.otherwise({redirectTo: '/home'});
}])
.config(['$logProvider', function($logProvider) {
	$logProvider.debugEnabled(true);
}])
.config(['localStorageServiceProvider', function(localStorageServiceProvider){
  localStorageServiceProvider.setPrefix('gb.dashboard');
  localStorageServiceProvider.setStorageCookie(0, '/');
}])
.config(['$rollbarProvider', function($rollbarProvider) {
	$rollbarProvider.config.accessToken = '56b70ba9c833408b9a241c14e02cec68';
	$rollbarProvider.config.captureUncaught = false;
	// Uncomment to spew a load of rollbar debugging info
	//$rollbarProvider.config.verbose = true;
	$rollbarProvider.config.payload = {
		client: {
			javascript: {
				source_map_enabled: true,
				code_version: Ginsberg.version,
				// Optionally have Rollbar guess which frames the error was thrown from
				// when the browser does not provide line and column numbers.
				guess_uncaught_frames: true
		  }
		}
	};
}])
.config(['$analyticsProvider', function($analyticsProvider) {
	 // We're going to fire this manually once we've configured the plugins
	$analyticsProvider.firstPageview(false);
}])
.factory('$exceptionHandler', ["$rollbar", "$injector", "SourceMappingService",
	function($rollbar, $injector, SourceMappingService) {
	return function(err) {
		var Environment = $injector.get('Environment');
		if (!Environment) return;
		var UserService = $injector.get('UserService');
		if (!UserService) return;
		var userId = UserService.current() ? UserService.current().id : '-1';

		$rollbar.configure({payload: {
			environment: Environment.name,
			person: {id: userId},
		}});
		$rollbar.error(err.message, err);
		SourceMappingService.printStacktrace(err);
	};
}])
.config(['$animateProvider', function($animateProvider) {
	// Restrict animations to items with the class angular-animate
	$animateProvider.classNameFilter(/angular-animate/);
}])
.config(['$httpProvider', function ($httpProvider) {
	$httpProvider.interceptors.push('ApiRequestInterceptor');
}])
// Presumably it's marginally more efficient to combine than chain
.factory('ApiRequestInterceptor',
	['$log', '$location', '$q', '$window', 'Environment', '$rollbar',
	function($log, $location, $q, $window, Environment, $rollbar) {
		return {
			request: function (config) {

				config.withCredentials = true;

				// Rewrite /data URLs to point to API.
				// This was originally a backwards compatibilityhack, but in the end
				// it seemed more elegant than scattering explicit api wrappers
				// everywhere
				if (config.url.indexOf('/data/') === 0) {
					var newUrl = Environment.api(config.url.substring(5));
					//$log.log("API rewrite", config.url, '->', newUrl);
					config.url = newUrl;
					// Add a cache buster to work around issues with IE8 caching data reqs
					// https://github.com/angular/angular.js/issues/1418#issuecomment-11750815
					var forceCache = false;
					if(config.method=='GET' && !forceCache) {
						if (!angular.isDefined(config.params)) config.params = {};
						config.params.noCache = new Date().getTime();
					}
				}

				// Add a local timezone header. Aggregating endpoints can use this to determine
				// the correct aggregation window.
				if (config.url.match(/api/)) config.headers['X-Timezone-Offset'] = moment().format('ZZ');

				//$log.log(config.method, config.url, config.params);
				return config;
			},
			responseError: function(response) {
				// FIME: Separate this out? Maybe just switch it off
				if (response.config && response.status !== 401 && response.status !== 0) {
					// Push it up to rollbar too
					$rollbar.error(response.status + " on " + response.config.method + " " + response.config.url);
				}
				return $q.reject(response);
			}
		};
	}
])
.run(['$rootScope', 'AUTH_EVENTS', 'UserService', function ($rootScope, AUTH_EVENTS, UserService) {
	$rootScope.$on('$stateChangeStart', function(event, next) {
		var allowAnonymous = next.data.allowAnonymous || false;
		if (allowAnonymous) UserService.loginCancelled();
	});
}])
.run(
	["$rootScope", "$location", "$log", '$route', "UserService", "Environment", "$rollbar", '$window', '$analytics',
	function($rootScope, $location, $log, $route, UserService, Environment, $rollbar, $window, $analytics) {

	// Poke the current environment onto the root scope and rollbar
	$rootScope.env = Environment;
	$rollbar.configure({payload: { environment: Environment.name }});

	var hideSplash = function() {
		angular.element('body').removeClass('loading');
		// HACK: Hide splash altogether on older versions of IE
		// NB Standard polyfill forwards events, which doesn't work for us as
		// we need mouseenter etc.
		var agent = navigator.userAgent;
		if (agent.match(/MSIE ([0-9]{1,}[\.0-9]{0,})/) !== null){
			var version = parseFloat( RegExp.$1 );
			if(version < 11) angular.element('#splash').addClass('ng-hide');
		}
	};

	// HACK: If page is anonymous clear splash immediately
	$rootScope.$on('$routeChangeSuccess', function() {
		$log.log($route.current);
		if ($route.current.$$route.allowAnonymous) hideSplash();
	});

	UserService.get().then(function(user) {
		// Generally, keep the splash up till the user profile has loaded
		hideSplash();

		// Setup Rollbar user
		$rollbar.configure({payload: {person: {id: user.id} } });

		// Google analytics
		ga('create',    'UA-44891997-2', 'auto');
		ga('require',   'displayfeatures');
		ga('set',       '&uid', user.id);

		// Localytics
		// We had problems with the Localytics CDN, so switched to using a local
		// copy of their lib
		// FIXME: Switch to using the command queue approach provided in newer
		// versions of the Localytics web lib
		var localyticsKey = '199e497728ebdc4f38698c6-5e8dfbaa-27a9-11e4-a02d-005cf8cbabd8';
		var localyticsOptions = {logger:false, namespace:"websdk"};
		$window.localytics = LocalyticsSession(localyticsKey, localyticsOptions);
		$window.localytics.setCustomerId(user.id);
		$window.localytics.open();

		// Track landing page (auto track disabled in config block above)
		$analytics.pageTrack($location.absUrl());
	});

}]);

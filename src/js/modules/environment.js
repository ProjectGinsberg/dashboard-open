angular.module('gb.dashboard')
.factory('Environment',
	['$location', '$log', '$sce', function($location, $log, $sce) {
	'use strict';

	var PRODUCTION = 'Production';
	var STAGING = 'Staging';
	var DEVELOPMENT = 'Development';

	var Environment = function(name, prefix, domain) {
		var env = {};

		env.platform = function(path) {
			return $sce.trustAsResourceUrl("https://" + prefix + "platform." + domain + path);
		};
		env.api = function(path) {
			return "https://" + prefix + "api." + domain + "/v1" + path;
		};
		env.name = name;
		env.isProduction = (name === PRODUCTION);
		return env;
	};

	var environments = {
		'dashboard.ginsberg.io': 	new Environment(PRODUCTION, 	'', 	'ginsberg.io'),
		'sdashboard.ginsberg.io': 	new Environment(STAGING, 		's', 	'ginsberg.io'),
		'devdashboard.ginsberg.io': new Environment(DEVELOPMENT, 	'dev', 	'ginsberg.io')
	};

	var environment = environments[$location.host()];
	if (!angular.isDefined(environment)) {
		environment = new Environment('Local (live)', '', 'ginsberg.io');
		//environment = new Environment('Local (staging)', 's', 'ginsberg.io');
		//environment = new Environment('Local (develop)', 'dev', 'ginsberg.io');
	}
	return environment;
}]);

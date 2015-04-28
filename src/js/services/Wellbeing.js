'use strict';

/**
 * Wellbeing data service
 */
gbDashboardServices.factory('Wellbeing', ['$resource', '$rootScope', function($resource, $rootScope) {

	var service = $resource('/data/wellbeing/measure/:id', {id: "@id"}, {
		query: {method: 'GET', isArray: true},
		delete: {method: 'DELETE', url: '/data/wellbeing/:id', params: {id: "@id"}}
	});

	return service;

}]);

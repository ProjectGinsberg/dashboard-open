'use strict';

/**
 * Returns metadata about the wellbeing measures.
 */
gbDashboardServices.factory('WellbeingMeasures', ['$resource', function($resource) {

	var service = $resource('/data/measures', {}, {
		query: {method: 'GET', isArray: true}
	});

	service.find = function(measureId, cb) {
		return service.query(function (measures) {
			return cb(_.find(measures, function(item) { return item.id == measureId; }));
		});
	}

	return service;
}]);

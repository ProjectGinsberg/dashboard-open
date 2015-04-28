/**
{
series: "sleep",
unit: "Minutes",
data: [
	{t: "2014-06-05T00:00:00Z", v: 420, c: 1},
	{t: "2014-06-06T00:00:00Z", v: 420, c: 1},
	{t: "2014-06-07T00:00:00Z", v: 300, c: 1}
]}

The data endpoint isn't really RESTful, but let's use a resource anyway.

Params:
interpolate
scope
window
 */
angular.module('gb.resources')
.factory('DataSeries', ['$resource', '$log', function($resource, $log) {
	'use strict';
	// FIXME: This might be better modelled as a service, since
	// it's not very resource like i.e. no save() or delete()
 	var resource = $resource('/data/data/:series', {}, {
		get: {
			method: 'GET',
			transformResponse: function(body, headers) {
				if (!body) return body;
				var series = angular.fromJson(body);
				_.map(series.data, function(d) {
				 	d.timestamp = new moment(d.t).toDate();
	 		 		d.count = d.c;
	 		 		d.value = d.v;
	 		 		return d;
				});
				return series;
			}
		},
	});
	return resource;
}]);

angular.module('gb.utils')
.service('Utils', ['$log', function($log) {
	'use strict';
	var service = {};

	/**
	 * Returns the ISO representation for the day. In Ginsberg, by convention
	 * we use 6am as the sentinel value for a day.
	 * My graph editors should run through this.
	 */
	service.dayTimestamp = function(d) {
		return moment(d).startOf('day').add(6, 'hours').toDate();
	};

	/**
	 * The start of a given day in the current local timezone
	 */
	service.startOfDay = function(d) {
		return moment(d).clone().startOf('day');
		//d = moment(d);
		//return moment().startOf('day').year(d.year()).month(d.month()).date(d.date());
	};

	/**
	 * A date prior to the Ginsberg launch
	 */
	service.beginningOfTime = function() {
		return new Date('2014-1-1');
	};

	/**
	 * Return the ISO representation of the provided Date or moment instance.
	 */
	//service.exactTimestamp = function(d) {
	//	return moment(d).toISOString();
	//};

	return service;
}]);

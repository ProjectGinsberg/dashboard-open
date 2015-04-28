/**
	{
		id: 123456,
		type: "hopscotch-tour",
		published: 123456,
		expiry: 654432,
		status: unread,
		title: "Introductory tour",
		body: {
			id: "introduction"
		}
	}
	 */
gbDashboardServices.factory('Notifications', ['$http', '$resource', '$log',
	function($http, $resource, $log) {
		'use strict';

		var Notifications = $resource('/data/notifications/:id', {id: '@id'}, {
			get: {
				transformResponse: function(body, headers) {
					if (!body) return body; // Give interceptors a chance
					var n = angular.fromJson(body.replace(/&lt;/g, '<').replace(/&gt;/g, '>'));
					return n;
				},
			},
			query: {
				isArray: false,
				transformResponse: function(body, headers) {
					if (!body) return body; // Give interceptors a chance
					var results = angular.fromJson(body.replace(/&lt;/g, '<').replace(/&gt;/g, '>'));
					results.notifications = _.map(results.notifications, function(o) { return new Notifications(o); });
					$log.log(results);
					return results;
				},
			},
		});

		// FIXME: These look like they are actually part of a controller :/
		Notifications.busy = false;
		Notifications.beforeId = 0;

		Notifications.seen = function(notification) {
			notification.read = true;
			Notifications.save(notification);
		};

		return Notifications;
	}
]);

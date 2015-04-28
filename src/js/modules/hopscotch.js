/**
 * A service for running hopscotch tours that are defined server-side.
 * A lot of the complexity comes from the fact that these are bound into the
 * scope of a page via the hopscotch directive.
 */
angular.module('gb.hopscotch', []);
angular.module('gb.hopscotch')
.factory('HopscotchService', ['Notifications', '$log', '$rootScope', '$location', '$injector', '$q',
	function(Notifications, $log, $rootScope, $location, $injector, $q) {
	'use strict';

	var $analytics = $injector.get('$analytics'); // It's a soft dependency
	var enableAnalytics = true; // TODO: Provider property!
	var notificationToRun = null;
	var service = {};

	/**
	 * Augment an (optionally) existing callback with a new callback.
	 * TODO: This is generically useful
	 */
	var hook = function(obj, hookName, hookFn) {
		var oldHook = obj[hookName],
			newHook = hookFn;
		if (oldHook) {
			// FIXME: The logging will double up, if this is called
			// recursively
			newHook = function() {
				try { oldHook(); } 	catch (e) { $log.error(e); }
				try { hookFn(); } 	catch (e) { $log.error(e); }
			};
		}
		obj[hookName] = newHook;
		return newHook;
	};

	/**
	 * TODO: This is generically useful
	 */
	var retry = function(fn, dt) {
		var r = function() { if (!fn()) setTimeout(r, dt); };
		r();
	};

	/**
	 * Clone a tour and bind its event handlers. This allows tours loaded
	 * over the network to define event handlers. The directive scope is
	 * available via '_scope'.
	 * This function also instruments the tour for analytics.
	 */
	var bindTour = function(tour, _scope) {
		tour = $.extend(true, {}, tour);

		// Global events
		if ($analytics && enableAnalytics) {
			tour.onStart = function() {
				$analytics.eventTrack('Start', 	{category: tour.id + '-0-started'});
			};
			tour.onEnd = function() {
				$analytics.eventTrack('End', 	{category: tour.id + '-' + (tour.steps.length - 1) + '-end'});
			};
			tour.onError = function() {
				$analytics.eventTrack('Error',	{category: tour.id + '-error'} );
			};
		}
		// Per-step events
		tour.steps = _.map(tour.steps, function(step, index) {
			// Bind event handlers. A bit of a hack, but useful and more powerful
			// than Hopscotch's registry-based approach
			_.each(['onNext', 'onPrev', 'onShow', 'onCTA'], function(evt) {
				if (angular.isString(step[evt])) step[evt] = eval('(' + step[evt] + ')');
			});

			if ($analytics && enableAnalytics) {
				var category = tour.id + '-' + index;

				//$log.debug('Binding analytics events');
				hook(step, 'onNext', function() {
					var e = category + '-next';
					$analytics.eventTrack(e, { category: e });
				});
				hook(step, 'onPrev', function() {
					var e = category + '-prev';
					$analytics.eventTrack(e, { category: e });
				});
			}
			return step;
		});
		return tour;
	};

	/**
	 * Look for the element on the page with a hopscotch directive matching
	 * the specified id.
	 */
	var findScope = function(tourId) {
		var element = angular.element('[hopscotch=' + tourId + ']');
		$log.log(element);
		return element.scope();
	};

	/**
	 *	Run the provided tour object. This may change the current page, if
	 * required.
	 */
	var startTourNotification = function(tourNotification, force) {
		$log.log("Attempting to start tour", tourNotification);
		if (!tourNotification) return;


		// HACK: This should be in the bloody tour objects
		var path = tourNotification.body.path;
		if (!path) path = tourNotification.body.id;
		if (tourNotification.body.id == 'introduction') path = '/home';
		if (tourNotification.body.id == 'environment') path = '/my-graph';

		// If we're not on the right page change it!
		if ($location.path() != path) {
			notificationToRun = tourNotification;
			$location.path(path);
			return;
		}

		//$log.log('State', notificationToRun, tourNotification);
		if (!(force || !tourNotification.read || (notificationToRun && notificationToRun.id == tourNotification.id))) return;
		notificationToRun = null;

		// Mark as read
		Notifications.seen(tourNotification);

		// Otherwise we're on the correct page - so bind and run the tour
		var scope = findScope(tourNotification.body.id);
		//$log.debug('Tour scope', scope);
		var tour = bindTour(tourNotification.body, scope);
		// HACK: Wait a little while for the page to settle down
		setTimeout(function() {
			$log.log('Starting tour ' + tour.id);
			hopscotch.configure({showPrevButton: true});
			hopscotch.startTour(tour);
			scope.$on('$destroy', function() { hopscotch.endTour(); });
		}, 500);
	};

	var getTourNotification = function(tourId) {
		return initialise.then(function(notifications) {
			return _.find(notifications, function(n) {
				return n.body.id == tourId;
			});
		});
	};

	/**
	 * Starts the tour with the specified ID, if it exists
	 */
	service.startTour = function(tourId, force) {
		getTourNotification(tourId).then(function(tourNotification) {
			startTourNotification(tourNotification, force);
		});
	};

	var initialise;
	var updateTourNotifications = function() {
		initialise = Notifications.get({type: 'hopscotch'})
			.$promise
			.then(function(results) { return results.notifications; });
		return initialise;
	};
	updateTourNotifications();

	return service;
}])

/**
 * A directive identifying that a tour (with the specified ID) may run here.
 * Tour objects are provided as a notification via the UserProfile resource.
 */
.directive('hopscotch', ['$q', '$log', '$timeout', '$location', 'Notifications', 'HopscotchService',
	function($q, $log, $timeout, $location, Notifications, HopscotchService) {
	'use strict';


	var directive = {};
	directive.scope = true;
	directive.link = function (scope, element, attrs) {
		var tourId = attrs.hopscotch;
		HopscotchService.startTour(tourId, false);
	};

	return directive;
}]);

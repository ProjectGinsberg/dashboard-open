(function() {
	'use strict';

	// FIXME: Split into a controller and a notifications service
	angular.module('gb.notifications')
		.controller('NotificationController',
			["$scope", "$route", "$location", "$timeout", "$log", "$sce", "Notifications", "UserService", "Modal", "HopscotchService",
			function($scope, $route, $location, $timeout, $log, $sce, Notifications, UserService, Modal, HopscotchService) {

				var POLL_SECONDS = 30 * 1000;
				var PAGE_SIZE = 10;
				var TYPES_TO_SHOW = "general,who5,who5_results,hopscotch,connection_error";

				$scope.loading = false;
				$scope.notifications = [];
				$scope.unreadNotificationCount = 0;

				function getOlderNotifications(num) {
					if ($scope.reachedOldestNotification) return;
					$scope.loading = true;
					var options = {};
					options.numResults = PAGE_SIZE;
					options.type = TYPES_TO_SHOW;
					if ($scope.notifications.length > 0) {
						options.beforeId = $scope.notifications[$scope.notifications.length - 1].id;
					}
					Notifications.query(options, function(n) {
						var ns = n.notifications;
						if (ns.length < num) $scope.reachedOldestNotification = true;
						$scope.notifications = $scope.notifications.concat(ns);
						$scope.loading = false;
						$scope.unreadNotificationCount = n.total_unread_notifications;
					});
				}
				getOlderNotifications();

				$scope.trusted = function(html) {
					return $sce.trustAsHtml(html);
				};

				// FIXME: Helper method, should move to a notification-type specific controller
				$scope.more = function(n) {
					$scope.currentNotification = n;
					Modal.show("#" + n.type + "_notification");
					var unbindModal = $scope.$on('$includeContentLoaded', function() {
						Modal.show("#" + n.type + "_notification");
						unbindModal();
					});
				};

				// FIXME: Helper method, should move to a notification-type specific controller
				$scope.go = function(path) {
					if ($location.path() == path) {
						$route.reload();
					} else {
						$location.path(path);
					}
				};

				// FIXME: Helper method, should move to a notification-type specific controller
				$scope.takeTour = function(n) {
					HopscotchService.startTour(n.body.id, true);
				};

				$scope.markNotificationsAsRead = function(open) {
					if (open) return;
					$log.log("Marking messages as read");
					_.each($scope.notifications, function(n, i) {
						if (n.type === 'hopscotch') return;
						if (n.read) return;
						Notifications.seen(n);
					});
					$scope.unreadNotificationCount = 0;
				};

				// Infinite scrolling to get older notifications
				$('#notification-list').bind('scroll', function() {
					var scrolltop = $(this).scrollTop();
					var scrollheight = $(this)[0].scrollHeight;
					var windowheight = $(this).innerHeight();
					var scrolloffset = 20;
					var isScrollBottom = scrolltop >= (scrollheight - (windowheight + scrolloffset));
					if (isScrollBottom && !$scope.loading) {
						getOlderNotifications();
					}
				});

				// Poll for new notifications every minute
				function pollNotifications() {
					if (UserService.user) {
						Notifications.query({
							numResults: PAGE_SIZE,
							type: TYPES_TO_SHOW,
							read: false
						}, function(n) {
							var latestId = $scope.notifications.length > 0 ? $scope.notifications[0].id : -1;
							var unseen = _.filter(n.notifications, function(n) { return (n.id > latestId); });
							$scope.notifications = _.union(unseen, $scope.notifications);
							$scope.unreadNotificationCount = n.total_unread_notifications;
						});
					}
					setTimeout(pollNotifications, POLL_SECONDS);
				}
				setTimeout(pollNotifications, POLL_SECONDS);

			}
		]);
})();

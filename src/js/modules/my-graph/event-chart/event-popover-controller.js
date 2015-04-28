controllers.controller('EventPopoverController',
	['$scope', '$http', '$route', 'Popover', '$log', 'Events', 'UserService',
	function EventController($scope, $http, $route, Popover, $log, Events, UserService) {
	'use strict';
	// Some suggestions in case the user hasn't tagged before
	var SUGGESTED_TAGS = ['baby', 'gym', 'ill', 'job', 'parents', 'rain', 'read', 'yolo', 'work'];

	$scope.submitting = false;
	$scope.text = 'Placeholder from EventController';
	$scope.tags = SUGGESTED_TAGS;
	$scope.suggestedTags = null;

	$scope.updateTags = function() {
		// Populate the tags array
		UserService.get().then(function(profile) {
			$log.log('Event popover tags', profile.tags_used);
			// FIXME: The uniq shouldn't be necessary!
			if (!profile.tags_used) return;
			$scope.tags = _.union(_.uniq(profile.tags_used), SUGGESTED_TAGS);
		});
	};

	$scope.updateTags();

	$scope.setTagPrefix = function(prefix) {
		if (prefix === null) {
			$scope.suggestedTags = null;
			return;
		}
		//$log.log('Prefix:', prefix)
		$scope.suggestedTags = _.filter($scope.tags, function(tag) {
				return tag.indexOf(prefix) === 0;
		});
		//$log.log('Suggested tags:', $scope.suggestedTags);
	};

	$scope.canSubmit = function() {
		var canSubmit = !($.trim($scope.text));
		return canSubmit;
	};

	$scope.hide = function() {
		Popover.hide();
	};

	$scope.submit = function() {
		$scope.submitting = true;
		Popover.lock();

		// Update the selected event (an 'Events' resource object)
		$scope.selectedEvent.entry = $scope.text;
		$scope.selectedEvent.tags = Events.extractTags($scope.selectedEvent.entry);

		$scope.selectedEvent.$save().then(
			function(success) {
				$log.log('Event submitted', success);
				$scope.submitting = false;
				Popover.unlock();
				Popover.hide();
				$scope.updateEventData();
				$scope.updateTags();
			},
			function(error) {
				$log.log('Failed to submit event ' + error);
				$scope.submitting = false;
				Popover.unlock();
				$scope.error = 'FAILED! Please reload the page and try again';
			});
	};

	$scope.$watch('selectedEvent', function() {
		if (!$scope.selectedEvent) return;
		$log.log('Got new event'); $log.log($scope.selectedEvent);
		$scope.text = $scope.selectedEvent.entry;
		$scope.clearSelection();
		$scope.suggestedTags = null;
	});

}]);

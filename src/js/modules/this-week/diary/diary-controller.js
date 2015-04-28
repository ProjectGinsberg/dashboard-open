angular.module('gb.thisWeek')
.controller('DiaryController',
	['$scope','Events','ThisWeekPeriodSelection','UserService',function($scope,Events,ThisWeekPeriodSelection,UserService) {
		var addMissingDays = function(entries,start,end) {
			var findDay = function(date) {
				for (var i = 0; i < entries.length; i++)
				{
					var entryDay = entries[i].entryDay;
					if (entryDay.isSame(date,'day'))
						return true;
				}
				return false;
			};
			var currentDay = start.clone();
			var newEntries = [];
			while (!currentDay.isSame(end,'day'))
			{
				if (findDay(currentDay) === false) {
						// add an empty entry for this day
						newEntries.push({
							entryDay: currentDay.clone(),
							entryContent: null
						})
				}
				currentDay.add(1,'days');
			}
			if (newEntries.length > 0) {
				_.each(newEntries,function(e) {
						entries.push(e);
				});
			}
		};
		var getForPeriod = function(period) {
			var startDate = period.start;
			var endDate = period.end;

			Events.query(
			{
				start: endDate,
				end: startDate
			},
			function(data) {
				var entries = [];
				_.each(data,function(d) {
					entries.push({
						entryDay: moment(d.timestamp),
						entryContent: d.entry
					});
				});
				// sort the entries oldest to newest
				addMissingDays(entries,moment(endDate),moment(startDate).add(1,'days'));
				// with blank posts	and fill in any gaps
				entries.sort(function(a,b) {
					return a.entryDay.diff(b.entryDay);
				});

				$scope.entries = entries;
			},
			function(e) {
				$scope.eventData = [];
			});
		};

		$scope.ThisWeekPeriodSelection = ThisWeekPeriodSelection;
		//$scope.$watch('ThisWeekPeriodSelection');
		$scope.$watch('ThisWeekPeriodSelection.getPeriod()',function(newVal)
		{
			getForPeriod(newVal);
		},true);

		$scope.trusted = function(html) {
			return $sce.trustAsHtml(html);
		};

		var SUGGESTED_TAGS = ['baby', 'gym', 'ill', 'job', 'parents', 'rain', 'read', 'yolo', 'work'];

		$scope.submitting = false;
		$scope.tags = SUGGESTED_TAGS;
		$scope.suggestedTags = null;

		$scope.updateTags = function() {
			// Populate the tags array
			UserService.update().then(function(profile) {
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
		$scope.$watch('selectedEvent', function() {
			if (!$scope.selectedEvent) return;
			$log.log('Got new event'); $log.log($scope.selectedEvent);
			$scope.text = $scope.selectedEvent.entry;
			$scope.clearSelection();
			$scope.suggestedTags = null;
		});
}]);

'use strict';

angular.module('gb.myGraph')
	.controller('WellbeingChartController', ['$scope', '$log', 'DataSeries', 'Popover',
			function($scope, $log, DataSeries, Popover) {

				$scope.subjectiveData = [];

				$scope.fetchGraphData = function() {
					// FIXME: This could happen during initialisation, maybe?
					if (!angular.isDefined($scope.wellbeingSelection())) return;

					DataSeries.get({
							series: 'wellbeing-' + $scope.wellbeingSelection().id,
							start: $scope.periodStart().format(),
							end: $scope.periodUpperBound().format(),
							interpolate: 'linear',
							'window': 'day'
						},
						function(dataset) {
							$log.log('Got ' + dataset.data.length + ' wellbeing data points');
							$log.log('Wellbeing data', dataset.data);
							$scope.subjectiveData = dataset.data;
						},
						function(e) {
							$log.log(e);
							$scope.eventData = [];
						});
				}

				$scope.hide = function() {
					Popover.hide();
				};

				$scope.$watch('periodSelection()', function(newVal, oldVal) {
					if (newVal === oldVal) return;
					$scope.wellbeing = $scope.wellbeingSelection();
					$scope.fetchGraphData();
				});
				$scope.$watch('wellbeingSelection()', function() {
					$scope.wellbeing = $scope.wellbeingSelection(); // FIXME: Needed by wellbeing question template
					$scope.fetchGraphData();
				});

		}
	]
);

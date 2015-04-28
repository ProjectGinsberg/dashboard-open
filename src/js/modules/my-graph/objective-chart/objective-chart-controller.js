// FIXME: Almost all the code here can be replaced by calls to the SeriesResource
angular.module('gb.myGraph')
	.controller('ObjectiveChartController', ['$scope', '$filter', '$log', '$q', 'Popover', 'DataSeries', 'Sleep', 'Utils',
		function($scope, $filter, $log, $q, Popover, DataSeries, Sleep, Utils) {
			'use strict';

			$scope.objectiveData = undefined;

			// FIXME: Does this really need to be on the scope!?
			$scope.fetchGraphData = function() {

				var options = {
					series: $scope.objectiveSelection().id,
					start: $scope.periodStart().toISOString(),
					end: $scope.periodUpperBound().toISOString(),
					window: 'day',
					interpolate: 'linear',
				};

				var p = DataSeries.get(options).$promise;
				// HACK: special case for sleep till we get a sleep quality end point
				// Sorry, this is a bit horrendous, but hopefully temporary
				if (options.series == 'sleep') {
					var p2 = Sleep.query({
						start: $scope.periodStart().clone().subtract(12, 'hours').toISOString(),
						end: $scope.periodUpperBound().clone().add(12, 'hours').toISOString()
					}).$promise;
					p = $q.all([p, p2]).then(function(results) {
						var data = results[0];
						var sleepData = results[1];
						$log.debug('Knitting', data, sleepData);
						_.forEach(data.data, function(d) {
							// Search is backwards...
							var date = Utils.startOfDay(d.timestamp);
							//$log.log(date);
							var sleepDatum = _.find(sleepData, function(q) {
								//$log.debug(Utils.startOfDay(q.timestamp).unix(), date.unix());
								return (q.quality && Utils.startOfDay(q.timestamp).unix() == date.unix());
							});
							//$log.log('Knitted', d, sleepDatum);
							if (sleepDatum) d.quality = sleepDatum.quality.value;
						});
						return data; // Now augmented
					});
				}
				// Poke the resulting data onto the scope
				p.then(function(data) {
					$scope.objectiveData = data;
				});
			};

			// FIXME
			$scope.hide = function() {
				Popover.hide();
				$scope.objectiveDeleteDate = undefined;
			};

			var open_blob;

			// FIXME
			$scope.add_more = function(e) {
				Popover.hide();
				$scope.date = $scope.objectiveDeleteDate;
				Popover.show('#add-objective-data-point', open_blob);
			};

			$scope.show = function(dialog, target) {
				open_blob = target;
				Popover.show(dialog, target);
			}

			$scope.$watch('objectiveSelection()', function(newVal, oldVal) {
				$scope.fetchGraphData();
			});

			$scope.$watch('periodSelection()', function(newVal, oldVal) {
				// I *think* this prevents a duplicate call during initialisation 'cos the
				// ojectiveSelection() watch gets hit first
				if (newVal === oldVal) return;
				$scope.fetchGraphData();
			});

		}
	]);

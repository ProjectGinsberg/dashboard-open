angular.module('gb.aboutMe')
.service('AboutMeService',
	['$log', '$sce', '$q', 'Events', 'Stats', 'DataSeries','Correlations', 'Sleep', 'Modal',
	function($log, $sce, $q, Events, Stats, DataSeries, Correlations, Sleep, Modal) {

		// responsible for defining the methods used by the about me
		// directives so that we can do the data binding etc such that
		// when a user selects a new metric to be viewed, the charts update
		// to reflect the new metric
		var aboutMeService = function() {
			var today = moment().endOf('day').format('YYYY-MM-DD'),
				lastWeek = moment().startOf('day').subtract(7, 'days').format('YYYY-MM-DD'),
				lastThirtyDays = moment().startOf('day').subtract(30, 'days').format('YYYY-MM-DD'),
				lastMonth = moment().startOf('month').subtract(1, 'days').format('YYYY-MM-DD'),
				lastQuarter = moment().subtract(3, 'months').toISOString();

			// constants that define how we interact with the restful APIs
			// for each metric type
			var metricProperties = {};
			metricProperties.sleep = {
				rangeStart: 300,
				rangeEnd: 600,
				numBuckets:10
			};
			metricProperties.steps = {
				rangeStart: 2000,
				rangeEnd:20000,
				numBuckets:9
			};
			metricProperties.nutrition = {
				rangeStart:1000,
				rangeEnd:3000,
				numBuckets:10
			};

			var impl = function() {};

			impl.get30DayGraphData = function(metric,callback) {
				// Rolling Average Graph Data
				//$scope.sleepChange = undefined;

				DataSeries.get({
					series: metric,
					interpolate: 'none',
					window: 'day',
					start: lastThirtyDays,
					end: today
				}, function(sleep) {
					DataSeries.get({
						series: metric,
						interpolate: 'rolling',
						window: 'day',
						start: lastThirtyDays,
						end: today
					}, function(sleep2) {
						var rollingAverageData = sleep2.data;
						if (sleep2.data) {
							var d = sleep2.data;
							var values = _.map(d, function(s) {
								return s.v
							});
							var max = _.max(values);
							var min = _.min(values);
							if (min != 0 || max != 0)
								var sleepChange = d[sleep2.data.length - 1].v - d[0].v;
							callback({
								'sleepData':sleep.data,
								'sleepChange':sleepChange,
								'rollingAverageData':rollingAverageData
							});
						}
					});
				});
			};
			impl.get6MonthComparisionData = function(metric,callback) {
				Stats.get({
					series: metric,
					start: lastWeek,
					end: today
				}, function(data) {
					// TODO: look into what these vars should be named and used for
					var mean = Math.round(data.mean);
					// Total Average Graph - data for all time
					Stats.get({series: metric}, function(data) {
						// Determine the vertical scale for the 'chart'
						var scale = Math.max(mean * 2, 1.1 * data.max, 1.1 * (data.mean + 2 * data.stddev));

						var sleep6MonthHighPercentile = Math.min(data.max, data.mean + 2 * data.stddev);
						var sleep6MonthLowPercentile  = Math.max(data.min, data.mean - 2 * data.stddev);
						callback({
							'mean':mean,
							'month6HighPercentile':sleep6MonthHighPercentile,
							'month6LowPercentile':sleep6MonthLowPercentile,
							'scale':scale
						});
					});
				});
			};
			impl.getAffectsThisData = function(metric,callback) {
				Correlations.getInsights(metric).then(function(d) {
					var insights = d;
					//$scope.currentInsight = $scope.insights[Object.keys($scope.insights)[0]];
					callback(insights);
				});
			};
			impl.getChangeOverTimeData = function(metric,callback) {
				// Monthly Average Graph Data
				var monthByMonthRange = 4;
				//need to get a month earlier to get difference from last
				var monthByMonthStartDate = moment().startOf('month').subtract('months', (monthByMonthRange + 1)).format('YYYY-MM-DD')
				DataSeries.get({
					series: metric,
					interpolate: 'linear',
					window: 'month',
					start: monthByMonthStartDate,
					end: lastMonth
				}, function(sleep) {
					var monthlyAverages = sleep;
					var sleepInRange = sleep.data.slice(0); // clone array
					sleepInRange.shift(); //only work with months in range
					var values = _.map(sleepInRange, function(s) {
						return +s.v;
					});
					var highSleep = _.findWhere(sleepInRange, {
						v: Math.max.apply(Math, values)
					});
					var lowSleep = _.findWhere(sleepInRange, {
						v: Math.min.apply(Math, values)
					});
					var highMonth = moment(highSleep.t).format('MMM');
					var lowMonth = moment(lowSleep.t).format('MMM');

					var max = _.max(values);
					var min = _.min(values);
					if (min != 0 || max != 0)
						var monthByMonthSleepChange = sleepInRange[sleepInRange.length - 1].v - sleepInRange[0].v;

					callback({
						monthByMonthRange: monthByMonthRange,
						monthByMonthSleepChange: monthByMonthSleepChange,
						monthlyAverages:monthlyAverages,
						lowMonth: lowMonth,
						highMonth: highMonth
					})
				});
			};
			impl.getComparisionHistogramData = function(metric,callback) {
				Stats.get({
				    series: metric,
				    scope: 'user',
				    start: lastWeek,
				    end: today,
			        rangeStart: metricProperties[metric].rangeStart,
			        rangeEnd: metricProperties[metric].rangeEnd,
			        numBuckets: metricProperties[metric].numBuckets
					}, function(data) {
				    //$scope.userAverageForComparison = Math.floor(data.mean);
				    $log.log('User average ' + metric, Math.floor(data.mean));
				    Stats.get({
				        series: metric,
				        scope: 'everyone',
				        numBuckets: metricProperties[metric].numBuckets,
				        start: lastQuarter,
				        end: today,
				        rangeStart: metricProperties[metric].rangeStart,
				        rangeEnd: metricProperties[metric].rangeEnd
				    }, function(data) {
				        $log.log('Population histogram data', data);

				        getComparisonData(data.mean, metric,function(comparisonData){
				        	var histogram = data.histogram;

				        	var lowest = _.first(histogram).lower;
							var highest = _.last(histogram).upper;

							var less = {
							    count: data.less,
							    lower: lowest
							};
							var more = {
							    count: data.more,
							    lower: highest
							};
							if (data.mean < lowest) {
					            more.highlight = true;
					        } else if (data.mean >= highest) {
					            less.highlight = true;
					        } else {
					            histogram = _.map(data.histogram, function(d) {
					                if (d.lower <= data.mean && d.upper > data.mean) {
					                    d.highlight = true;
					                }
					                return d;
					            });
					        }
							callback({
								'mean':data.mean,
								'similar':comparisonData.similar,
								'more': comparisonData.more,
								'less': comparisonData.less,
								'histogram':histogram,
								comparisonHistogramLess:less,
								comparisonHistogramMore:more
							});
						});
				        // FIXME: Just pass through the histogram
				        /*var less = {
				            count: data.less,
				            lower: lowest
				        };
				        var more = {
				            count: data.more,
				            lower: highest
				        };
				        if ($scope.userAverageForComparison < lowest) {
				            more.highlight = true;
				        } else if ($scope.userAverageForComparison >= highest) {
				            less.highlight = true;
				        } else {
				            histogram = _.map(data.histogram, function(d) {
				                if (d.lower <= $scope.userAverageForComparison && d.upper > $scope.userAverageForComparison) {
				                    d.highlight = true;
				                }
				                return d;
				            });
				        }
				        $scope.comparisonHistogramLess = less;
				        $scope.comparisonHistogramMore = more;
				        $scope.comparisonHistogram = histogram;*/
				    });
				});
			};

			/**
			 * Build up distributions for the tags associated with high and low
			 * days for the specified metric (a data series ID)
			 */
			var getTags = function(metric, cb) {
				var start = moment().startOf('month').subtract('months', 6).toISOString();
				// A little auxilliary function to help maintain a map of item counts
				$q
					.all([Events.query({'start': start}).$promise,
						DataSeries.get({'series': metric, 'start': start, 'window': 'day'}).$promise,
						Stats.get({'series': metric, 'start': start}).$promise])
					.then(function(results) {

						// 1. Build a date -> tags lookup table
						var dayTags = {};
						_.each(results[0], function(evt) {
							var day = moment(evt.timestamp).format('YYYY-MM-DD'); // TZ?
							if (dayTags[day]) dayTags[day] = _.union(dayTags, evt.tags);
							else dayTags[day] = evt.tags;
						});
						//$log.log(dayTags);

						// 2. Iterate over the data, filing day tags into the
						// appropriate bucket
						var stats = results[2];
						var lo = stats.mean - 0.001 * stats.stddev; // Hm. Why bother?
						var hi = stats.mean + 0.001 * stats.stddev;
						var loTags = {}; 	// Low days
						var hiTags = {}; 	// High days
						var avgTags = {}; 	// Average days, not really used
						_.each(results[1].data, function(d) {
							var bucket = avgTags;
							if (d.value > hi) { bucket = hiTags; }
							if (d.value < lo) { bucket = loTags; }

							var day = moment(d.timestamp).format('YYYY-MM-DD');
							//$log.log(day, dayTags[day]);
							_.each(dayTags[day], function(tag) {
								if (bucket[tag]) bucket[tag] += 1;
								else bucket[tag] = 1;
							});
						});
						//$log.log(loTags, hiTags, avgTags);

						// 3. Get top tags
						loTags = _.map(loTags, function(c, tag) { return [tag, c]; });
						hiTags = _.map(hiTags, function(c, tag) { return [tag, c]; });
						loTags.sort(function(a,b) { return b[1] - a[1]; });
						hiTags.sort(function(a,b) { return b[1] - a[1]; });
						//$log.log(loTags, hiTags, avgTags);

						// 4. Pack it into our ugly results object
						// FIXME: Use better names, and slice elsewhere
						var result = {
							'topGood': 	hiTags.slice(0, 5),
							'topBad': 	loTags.slice(0, 5),
							'tagsWithGoodSleepQuality': hiTags,
							'tagsWithBadSleepQuality': loTags,
						};

						//$log.log("Tags for " + metric, result);
						cb(result); // Better to use a promise?
					});
			};



			impl.getWritesData = function(metric, callback) {
				if (metric === 'sleep') metric = 'sleep-quality';
				getTags(metric, callback);
			};

			var getComparisonData = function(mean,metric,callback) {
				// similar sleeps are defined as those that
				// are within 15mins either side of a user's average
				var userRangeStart = mean - 15;
				var userRangeEnd = mean + 15;
				Stats.get({
					series: metric,
					scope: 'everyone',
					numBuckets: 1,
					start: lastQuarter,
					end: today,
					rangeStart: userRangeStart,
					rangeEnd: userRangeEnd
				}, function(data2) {
					if (data2.histogram) {
						callback({
							'similar':data2.histogram[0].count / data2.count,
							'more': data2.more / data2.count,
							'less': data2.less / data2.count
						});
					}
				});
			};
			return impl;
		};
		return aboutMeService();
	}]);

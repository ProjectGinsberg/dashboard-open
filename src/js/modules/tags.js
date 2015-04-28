/**
 * Module to supplement the tags API. Not sure this is actually used anywhere!
 * Status: EXPERIMENTAL!
 */
angular.module('gb.tags', ['gb.resources'])
.factory('TagsService',
	['$log', 'Events', 'UserService',
	function($log, Events, UserService) {

	// Tag -> average mood
	// Knitting tags with other data series...
	var tags = null;
	var getTags = function() {
		if (tags === null) tags = $http.get('/data/tags');
		return tags;
	};

	var getRelatedTags = function() {
		getTags().then(function(tags) {
			// FIXME: Slice?
			$log.log("Fetching correlations for ", tags);
		});
	};

	/**
	 * Build up distributions for the tags associated with high and low
	 * days for the specified metric (a data series ID)
	 * Returns a promise
	 */
	var getHiLoTags = function(metric) {
		var start = moment().startOf('month').subtract('months', 6).toISOString();
		// A little auxilliary function to help maintain a map of item counts
		return $q
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
				var lo = stats.mean - 0.1 * stats.stddev;
				var hi = stats.mean + 0.1 * stats.stddev;
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
}]);

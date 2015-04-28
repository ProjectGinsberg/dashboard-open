angular.module('gb.thisWeek')
.service('WellbeingService',
['UserService','Stats',function(UserService,Stats) {
	'use strict';
	var impl = function() {};
	impl.getWellbeingScores = function(startDate,endDate,callback) {
		/*var startDate = moment().endOf('day'),
		endDate = moment().startOf('day').subtract(7, 'days');*/

		UserService.get().then(function(profile) {
			var wellbeingMetrics = profile.wellbeing_metrics;

			var resultSet = [];
			// iterate over the metrics and pull down the stats
			_.each(wellbeingMetrics,function(m) {
				var returnObj = {
					'id': m.id,
					'question':m.question
				};
				Stats.get({
				    series: 'wellbeing-'+m.id,
				    scope: 'user',
				    start: endDate,
				    end: startDate,
			        rangeStart: 1,
			        rangeEnd: 5,
			        numBuckets: 5
					}, function(data) {
						// translate from the API object into the format that the chart uses
						var scores = data.histogram;
						for (var i = 0; i < scores.length; i++)
						{
							scores[i].score = i+1;
						}
						returnObj.scores = scores;
						resultSet.push(returnObj);
						if (resultSet.length === 3) // FIXME: use a promise instead of a crappy probably ß
							callback(resultSet);	// not-going-to-work hack
					});
			});
		});
	};
	impl.getWellbeingScoreForId = function(startDate,endDate,id,callback) {
		Stats.get({
			series: 'wellbeing-'+id,
			scope: 'user',
			start: endDate,
			end: startDate,
			rangeStart: 1,
			rangeEnd: 5,
			numBuckets: 5
		}, function(data) {
			var returnObj = {
				'id': data.id,
				'question':data.question
			};
			// translate from the API object into the format that the chart uses
			var scores = data.histogram;
			for (var i = 0; i < scores.length; i++)
			{
				scores[i].score = i+1;
			}
			returnObj.scores = scores;
			callback(returnObj);	// not-going-to-work hack
		});
	};
	return impl;
}]);

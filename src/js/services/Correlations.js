gbDashboardServices.factory('Correlations', ['$resource', '$http', '$q', '$log', 'UserService', function($resource, $http, $q, $log, UserService) {
	'use strict';
	var Correlations = $resource('/data/correlations', {}, {
		query: {
			method: 'GET'
		}
	});

	var insightHTMLFromVariance = function(variance) {
		var i = Math.abs(+variance);
		var c = "<strong class='none'>no</strong>";
		if (i >= 0.3 && i < 0.7) {
			c = "<strong class='small'>little</strong>";
		} else if (i >= 0.7) {
			c = "<strong class='large'>a strong</strong>";
		}
		return c;
	};

	Correlations.generateInsight = function(primary_series, secondary_series, variance) {
		if (+variance) {
			return "Your " + primary_series + " has " + insightHTMLFromVariance(variance) + " relationship with <strong>" + secondary_series + "</strong>";
		} else {
			return "Ginsberg doesn't have enough data to determine the relationship between your " + primary_series + " and <strong>" + secondary_series + "</strong>";
		}
	};

	Correlations.insightObject = function(primary_series, secondary_series, variance) {
		var obj = {
			body: {
				series: [primary_series, secondary_series],
				significance: variance,
				generator: "dashboard-aboutme-correlations"
			}
		};
		var re = /wellbeing-(\d+)/;
		var wellbeingId = re.exec(secondary_series);
		if (wellbeingId) {
			UserService.get().then(function(data) {
				var id = +wellbeingId[1];
				var m = _.findWhere(data.wellbeing_metrics, {
					id: id
				});
				if (m) {
					obj.body.insight = Correlations.generateInsight(primary_series, '"' + m.question + '"', variance);
				}
			});
		} else {
			obj.body.insight = Correlations.generateInsight(primary_series, secondary_series, variance);
		}
		return obj;
	};

	Correlations.getInsights = function(series) {
		var d = $q.defer();
		$http.get('/data/correlations').success(function(data) {
			var index = data.series.indexOf(series);
			var correlations = {};
			_.each(data.correlations[index], function(c, i) {
				var s = data.series[i];
				if (series != s) {
					correlations[s] = Correlations.insightObject(series, s, c);
				}
			});
			return d.resolve(correlations);
		});
		return d.promise;
	};

	Correlations.postInsightResponseObject = function(insightObject, callback) {
		var notification = {
			type: "insight-response",
			title: "Insight",
			rating: insightObject.rating,
			published_time: new Date(),
			rating_time: new Date(),
			read: true,
			body: insightObject
		};
		$http.post("/data/notifications", notification).error(function() {
			$log.log("FAILED! Please reload the page and try again");
		}).then(function() {
			if (callback)
				callback();
			$log.log("Complete");
		});
	};

	return Correlations;
}]);

angular.module('gb.aboutMeTags')
	.controller('AboutMeTagsController', ['$scope', '$log', '$q', 'Alcohol', 'Activity', 'DataSeries', 'Events', 'Utils',
		function($scope, $log, $q, Alcohol, Activity, DataSeries, Events, Utils) {

			// Indexed by the actual score (which is on a 1-5 scale)
			var MOODS = ['Not possible', 'Bad', 'Meh', 'Okay', 'Good', 'Great', 'Not possible'];

			$scope.activities = null;
			$scope.alcohol = null;
			$scope.tags = [];

			/**
			 * Given a timestamp, return a string identified the *day* in the local
			 * timezone. Candidate for Utils?
			 */
			var getDay = function(timestamp) {
				return moment(timestamp).format('YYYY-MM-DD');
			};

			/**
			 * Return a setter function for the specified field.
			 * Candidate for Utils?
			 */
			var store = function(obj, field) {
				return function(data) {
					obj[field] = data;
					return data;
				};
			};

			/**
			 * Maintain a count of items in a map. Creates an entry (with value 1)
			 * for unseen items. Candidate for Utils?
			 */
			var count = function(map, item) {
				if (map[item]) map[item] += 1;
				else map[item] = 1;
			};

			var augment = function(results) {
				var eventMap = results[0];
				var data = results[1];
				_.each(data, function(d) {
					var date = getDay(d.timestamp);
					d.tags = _.uniq(_.flatten(_.pluck(eventMap[date], 'tags')));
				});
				return data;
			};



			var mergeEvent = function(profile, evt) {
				//$log.log("Merging", evt, "into", profile)
				profile.count += 1;
				profile.totalWellbeing += evt.wellbeing;

				var timestamp = moment(evt.timestamp);
				if (timestamp.isAfter(profile.lastUsed)) {
					profile.lastUsed = timestamp;
				}

				_.each(evt.tags, function(tag) {
					if (tag === profile.name) return;
					count(profile.relatedTags, tag);
				});
				return profile;
			};

			/**
			 * Build the data backing the tags table
			 */
			var buildTagProfiles = function(results) {

				var events = results[0];
				var wellbeing = results[1];

				// 0. Get map day -> 'Average wellbeing'
				var day2wellbeing = {};
				_.each(wellbeing.data, function(d) {
					day2wellbeing[getDay(d.timestamp)] = d.value;
				});
				//$log.log('about-tags-0', day2wellbeing);

				// 1. Build a map "tag" -> [Event*]
				var tag2events = {}; //
				_.each(events, function(evt) {
					// HACK: Assume a day was okay, unless otherwise specified
					evt.wellbeing = day2wellbeing[getDay(evt.timestamp)] || 3;
					// Populate the map
					_.each(evt.tags, function(tag) {
						if (tag2events[tag]) tag2events[tag].push(evt);
						else tag2events[tag] = [evt];
					});
				});
				//$log.log('about-tags-1', tag2events);

				// 2. Build the profile objects (it's essentially a reduce)
				var tags = _.map(tag2events, function(events, tag) {
					return _.reduce(events, mergeEvent, {
						name: tag,
						count: 0,
						totalWellbeing: 0,
						lastUsed: Utils.beginningOfTime(),
						relatedTags: {},
						mood: 'Quixotic'
					});
				});
				//$log.log('about-tags-2', tags);

				// 3. Sort by count
				tags.sort(function(a, b) {
					return b.count - a.count;
				});

				// 4. Extract related tags into a more useful format
				_.each(tags, function(profile) {
					var result = _.map(profile.relatedTags, function(v, k) {
						return [k, v];
					});
					result.sort(function(a, b) {
						return b[1] - a[1];
					});
					result = _.map(result, function(t) {
						return t[0] + ' (' + t[1] + ')';
					});
					profile.relatedTags = result;
					profile.averageWellbeing = profile.totalWellbeing / profile.count;
					profile.mood = MOODS[Math.floor(profile.averageWellbeing)];
				});
				//$log.log('about-tags-4', tags);

				return tags;
			};

			var load = function() {
				$log.log("Loading data for TagsController");

				var options = {
					start: Utils.beginningOfTime()
				};
				var alcohol = Alcohol.query(options).$promise;
				var activities = Activity.query(options).$promise;
				var events = Events.query(options).$promise;
				var wellbeing = DataSeries.get({
						series: 'wellbeing',
						start: Utils.beginningOfTime(),
						window: 'day',
					})
					.$promise;

				// TODO: Build this into the resource?
				var eventsMap = events.then(function(data) {
					return _.groupBy(data, function(evt) {
						return getDay(evt.timestamp);
					});
				});

				$q.all([eventsMap, activities])
					.then(augment)
					.then(store($scope, 'activities'));

				$q.all([eventsMap, alcohol])
					.then(augment)
					.then(store($scope, 'alcohol'));
				$q.all([events, wellbeing])
					.then(buildTagProfiles)
					.then(store($scope, 'tags'));
			};
			load();

		}
	]);

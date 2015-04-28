angular.module('gb.home')
controllers.controller('HomeController', ['$scope','$rootScope', '$http', '$q', '$location','$log', 'UserService', 'Social', 'Alcohol', 'Nutrition', 'Sleep', 'Exercise', 'StepCount','Events','Wellbeing','Utils',
	function($scope, $rootScope, $http, $q, $location, $log, UserService, Social, Alcohol, Nutrition, Sleep, Exercise, StepCount,Events,Wellbeing,Utils) {
		'use strict';
		$scope.viewedDate = moment().toDate();
		$scope.dateBack = function() {
			$scope.viewedDate = moment($scope.viewedDate).subtract(1,'days')
														 .toDate();
		};
		$scope.dateForward = function() {
			$scope.viewedDate = moment($scope.viewedDate).add(1,'days')
														 .toDate();
		};
		$scope.$watch('viewedDate',function(newVal) {
			buildEventsSection();
			buildWellbeingSection();
		});
		$scope.selectedIs = function(question, score) {
			var match = _.select($scope.answers, function(thing) {
				return thing.question_id === question.id;
			});
			return _.all(match, function(thing) {
				return thing.answer === score;
			});
		};

		$scope.setAnswer = function(question, score) {
			var match = _.select($scope.answers, function(thing) {
				return thing.question_id === question.id;
			});
			var answer_holder = _.first(match);
			answer_holder.answer = score;
		};
		var buildWellbeingSection = function() {
			$scope.questionLoading = true;

			$scope.wellbeingAnswers = [{
				answer:'Strongly Agree',
				class:'sa',
				score:5
			},{
				answer:'Agree',
				class:'a',
				score:4
			},{
				answer:'Undecided',
				class:'u',
				score:3
			},{
				answer:'Disagree',
				class:'d',
				score:2
			},{
				answer:'Strongly Disagree',
				class:'sd',
				score:1
			}];
			UserService.update().then(function(profile) {
			    $scope.profile = profile;
				//get the users wellbeing questions for this day
				Wellbeing.query({
					'start':moment($scope.viewedDate).startOf('day').toISOString(),
					'end':moment($scope.viewedDate).endOf('day').toISOString()
				}).$promise.then(function(d) {
					var recent_wellbeing = d;

					if (!_.isEmpty(recent_wellbeing)) {
						$scope.hasRecentWellbeingData = true;
						$scope.recentWellbeingData = recent_wellbeing;
					} else {
						$scope.hasRecentWellbeingData = false;
						$scope.questionLoading = false;
						$scope.recentWellbeingData = [];
					}

					$scope.wellbeing_measures = _.map(profile.wellbeing_metrics, function(measure) {
						return {
							id: measure.id,
							question: measure.question
						};
					});

					$scope.answers = _.map($scope.wellbeing_measures, function(measure) {
						return {
							'question_id': measure.id,
							'answer': null
						};
					});

					//set answer values if any exist for today
					if ($scope.hasRecentWellbeingData) {
						var recent_data_match;
						_.each($scope.wellbeing_measures, function(measure) {
							recent_data_match = _.first(_.select($scope.recentWellbeingData, function(thing) {
								return thing.measure_id === measure.id;
							}));
							if (recent_data_match) {
								$scope.setAnswer(measure, recent_data_match.value);
							}
						});
						$scope.questionLoading = false;
					}
				});



				$scope.sendAnswers = function() {
					$scope.isSubmitting = true;
					var answers = _.map($scope.answers, function(a, i) {
						return {
							// FIXME: This hack should not be required any longer
							'timestamp': new Date(new Date().getTime() + (i * 1000)), //return a unique timestamp
							'value': a.answer,
							'measure_id': a.question_id
						};
					});

					$q.all(_.map(answers, function(a) {
						var recent_data_match;
						//validate appropirate value is sent
						if (a.value >= 1 && a.value <= 5) {
							if ($scope.hasRecentWellbeingData) {
								recent_data_match = _.first(_.select($scope.recentWellbeingData, function(thing) {
									return thing.measure_id === a.measure_id;
								}));
							}
							if (recent_data_match) {
								return $http.post('/data/wellbeing/update/' + recent_data_match.id, a);
							} else {
								return $http.post('/data/wellbeing', a);
							}
						}
					})).then(function() {
						if ($scope.text.length > 0) {
							$scope.selectedEvent.entry = $scope.text;
							$scope.selectedEvent.tags = Events.extractTags($scope.selectedEvent.entry);
							$scope.selectedEvent.$save().then(function() {

								$scope.isSubmitting = false;
							});
						} else {
							
						}
						// send the broadcast message to save objective values
						$rootScope.$broadcast('gb.home.dashboard.save');
						setTimeout(function() {
							//location.reload();
							isSubmitting = false;
						},2000);
					});
				};
			});
		};
		var buildEventsSection = function() {
			// events scope varibles
			$scope.text = '';
			Events.query({
				start: moment($scope.viewedDate).startOf('day').toISOString(),
				end: moment($scope.viewedDate).endOf('day').toISOString()
			},
			function(data) {
				// currently, the front end can only support a single event
				// so take either the first element in the array, or create
				// a new event for situation where user hasn't yet journaled today
				if (angular.isDefined(data[0]))
				{
					$scope.selectedEvent = data[0];
				} else {
					var evt = new Events({
						timestamp: Utils.dayTimestamp(moment($scope.viewedDate)),
						entry: "",
						source: "Ginsberg",
						tags:[]});

						$scope.selectedEvent = evt;
					}
				},
				function(e) {
					$log.log(e);
					$scope.eventData = [];
				});
				// Some suggestions in case the user hasn't tagged before
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
		};

	}
]);

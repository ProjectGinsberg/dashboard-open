'use strict';
controllers.controller('SurveyResultsController', ["$scope", "$http", "$q", "$log", "Survey", function($scope, $http, $q, $log, Survey) {

	var today = moment().endOf("day").format('YYYY-MM-DD');
	//from August 2014 or last six months - whichever is sooner.
	var five_months_ago = moment().startOf("day").subtract("months", 5).format("YYYY-MM-DD")
	//var surveyResultsStartDate = moment("2014-08-01").format("YYYY-MM-DD");
	//if(surveyResultsStartDate < five_months_ago)
		// surveyResultsStartDate = five_months_ago;
	var surveyResultsStartDate = five_months_ago;

	$scope.startDate = surveyResultsStartDate;
	$scope.endDate = today;

	var getUserData = function(d){
		var q = $http.get('/data/data/answer-'+d.id+'?start='+surveyResultsStartDate+'&end='+today);
		q.success(function(data) {
			d.user = data;
		});
		return q;
	}

	var getAverageData = function(d){
		var q = $http.get('/data/data/answer-'+d.id+'?scope=everyone&interpolate=linear&window=month&start='+surveyResultsStartDate+'&end='+today);
		q.success(function(data) {
			d.average = data;
		})
		return q;
	}

	var getUserTotalData = function(d){
		var q = $http.get('/data/data/survey-1?start='+surveyResultsStartDate+'&end='+today);
		q.success(function(data) {
			d.user = data;
		});
		return q;
	}

	var getAverageTotalData = function(d){
		var q = $http.get('/data/data/survey-1?scope=everyone&interpolate=linear&window=month&start='+surveyResultsStartDate+'&end='+today);
		q.success(function(data) {
			d.average = data;
		})
		return q;
	}

	var getGinsbergAverage = function(d){
		d.ginsbergAverage = 0;
		var q = $http.get('/data/stats/answer-'+d.id+'?scope=everyone&start='+surveyResultsStartDate+'&end='+today);
		q.success(function(data) {
			d.ginsbergAverage = data.mean;
		});
		return q;
	}

	var getLatestAnswers = function(d){
		var answer_array = d.answer_options;
		var q = $http.get('/data/data/answer-'+d.id+'?start='+surveyResultsStartDate+'&end='+today);
		q.success(function(data) {
			var lastIndex = data.data.length -1;
			d.thisAnswer = {
				value: data.data[lastIndex].v,
				timestamp: data.data[lastIndex].t
			};
			d.thisAnswer.date = moment(d.thisAnswer.timestamp).format("MMM Do");
			var correspondingThisAnswer = _.findWhere(answer_array, {value: d.thisAnswer.value});
			d.thisAnswer.answer = correspondingThisAnswer.text;
			d.lastAnswer = {
				value: data.data[lastIndex-1].v,
				timestamp: data.data[lastIndex-1].t
			};
			var correspondingLastAnswer = _.findWhere(answer_array, {value: d.lastAnswer.value});
			d.lastAnswer.date = moment(d.lastAnswer.timestamp).format("MMM Do");
			d.lastAnswer.answer = correspondingLastAnswer.text;
			d.change = d.thisAnswer.value - d.lastAnswer.value;
			d.changeType = "down";
			if(d.change == 0)
				d.changeType = "neutral";
			if(d.change > 0)
				d.changeType = "up";
		});
		return q
	}

	$scope.loading = true;
	Survey.query({id: 1}, function(data){
		$scope.questions = data.questions;
		var promises = _.map($scope.questions, function(question){
			var q = $q.defer();
			var p1 = getUserData(question);
			var p2 = getAverageData(question);
			var p3 = getGinsbergAverage(question);
			var p4 = getLatestAnswers(question);
			$q.all([p1,p2,p3,p4]).then(function(){
				$scope["question"+question.id] = question;
				$log.log("Resolved all for question "+question.id);
				q.resolve();
			})
			return q.promise;
		});
		$q.all(promises).then(function(){
			var question = {};
			var p1 = getUserTotalData(question);
			var p2 = getAverageTotalData(question);
			$q.all([p1,p2]).then(function(){
				$scope.loading = false;
				$scope.questionall = question;
				$log.log("Resolved All");
				$log.log("qall",$scope.questionall);
			});
		});
	})


}]);

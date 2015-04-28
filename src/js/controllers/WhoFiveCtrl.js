'use strict';
controllers.controller('WhoFiveController', ["$scope", "$log", "$sce", "$http", "Modal", "Survey", function($scope, $log, $sce, $http, Modal, Survey) {

	var allQuestions = undefined;
	$scope.currentQuestion = undefined;
	var questionIndex = 0;
	$scope.loading = false;
	$scope.finished = false;

	$scope.getQuestions = function(){
		$scope.loading = true;
		// FIXME: Move this into a configuration parameter
		Survey.query({id: 1}, function(data){
			allQuestions = data.questions;
			_.each(allQuestions, function(q,i){
				// HACK: Fix up the survey questions per #417
				if (i > 0) {
					var question = (q.question[0] != "I")  ? q.question.toLowerCase() : q.question;
					q.question = "Over the last two weeks, " + question;
				}
				q.buttonText = "Next Question";
				if( i == allQuestions.length-1)
					q.buttonText = "Submit";
			});
			$scope.currentQuestion = allQuestions[0]
			$scope.loading = false;
		});
	}

	$scope.nextQuestion = function() {
		if(!$scope.currentQuestion.answer){ return; }
		if(allQuestions && allQuestions.length-1 > questionIndex){
			questionIndex += 1;
			$log.log(questionIndex);
			$scope.currentQuestion = allQuestions[questionIndex]
			$log.log($scope.currentQuestion);
		}else{
			$scope.submit();
		}
	}

	$scope.submit = function() {
		var survey = {
			questionnaire_id: $scope.currentQuestion.questionnaire_id,
			timestamp: new Date(),
			answers: []
		}
		_.each(allQuestions, function(q){
			survey.answers.push({
				question_id: q.id,
				answer: +q.answer
			});
		});
		$http.post('/data/survey/1', survey)
			.success(function() {
				$scope.finished = true;
			})
	}

	$scope.dismiss = function(){
		Modal.hide();
		allQuestions = undefined;
		questionIndex = 0;
		$scope.currentQuestion = undefined;
		$scope.finished = false;
	}

	$scope.isDefined = function(v){
		var defined = angular.isDefined(v);
		var empty;
		if(defined)
			empty = !(eval("$scope."+v) || eval("$scope."+v) == 0);
		return (defined && !empty);
	}

	$scope.trusted = function(html) {
		return $sce.trustAsHtml(html);
	}


}]);

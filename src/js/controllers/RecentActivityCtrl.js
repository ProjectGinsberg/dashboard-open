'use strict';
controllers.controller('RecentActivityController', ["$scope", "$filter", "Social", "Alcohol", "Nutrition", "Exercise", "StepCount", "Sleep", function($scope, $filter, Social, Alcohol, Nutrition, Exercise, StepCount, Sleep) {
	$scope.humanReadableDate = function(dataholder) {
		return $filter('timeFromNow')(dataholder.timestamp);
	}


	// This all needs refactored
	$scope.alcoholLoading = true;
	$scope.alcohol = [];
	Alcohol.query( function(alcohol){
		$scope.alcohol = alcohol;
		$scope.alcoholLoading = false;
	});

	$scope.nutrition = [];
	$scope.nutritionLoading = true;
	Nutrition.query(function(n){
		$scope.nutrition = n;
		$scope.nutritionLoading = false;
	})

	$scope.sleeps = [];
	$scope.sleepLoading = true;
	Sleep.query(function(s){
		$scope.sleeps = s;
		$scope.sleepLoading = false;
	})

	// Get step_counts and exercises from Acitvity API
	$scope.exercisesLoading = true;
	$scope.stepCountLoading = true;
	$scope.exercises = []
	$scope.step_counts = []
	Exercise.query(function(data){
		$scope.exercises = data;
		$scope.exercisesLoading = false;
	});
	StepCount.query(function(data){
		$scope.step_counts = data;
		$scope.stepCountLoading = false;
	});


	$scope.socialLoading = true;
	Social.query(function(social){
		var groupedDates = _.groupBy(social, function(item){
			return new Date(moment(item.timestamp, "YYYY-MM-DD"));
		})
		var dates = _.first(_.keys(groupedDates), 5);
		$scope.social = _.map(dates, function(date){
			var obj = {};
			obj.date = moment(_.first(this[date]).timestamp, "YYYY-MM-DD").fromNow();
			obj.first_entry = _.first(this[date]).entry;
			obj.size = this[date].length;
			obj.sources = _.map(_.unique(this[date], false, function(post){ return post.source }), function(item){ return item.source }).join(", ");
			return obj;
		}, groupedDates);
		$scope.socialLoading = false;
	})

	$scope.deleteAlcohol = function(event) {
		event.$delete();
		$scope.alcohol.splice($scope.alcohol.indexOf(event), 1);
	}
	$scope.deleteNutrition = function(event) {
		event.$delete();
		$scope.nutrition.splice($scope.nutrition.indexOf(event), 1);
	}
	$scope.deleteStepCount = function(event) {
		event.$delete();
		$scope.step_counts.splice($scope.step_counts.indexOf(event), 1);
	}
	$scope.deleteExercise = function(event) {
		event.$delete();
		$scope.exercises.splice($scope.exercises.indexOf(event), 1);
	}
	$scope.deleteSleep = function(event) {
		event.$delete();
		$scope.sleeps.splice($scope.sleeps.indexOf(event), 1);
	}

}])

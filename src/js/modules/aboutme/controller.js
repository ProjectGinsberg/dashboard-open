angular.module('gb.aboutMe')
.controller('AboutMeController',
	['$scope','$routeParams','$sce','AboutMeService','Modal','Correlations',
	function($scope,$routeParams,$sce,AboutMeService,Modal,Correlations) {
		// responsible for maintaining the metric the user selects,
		// and updating the service so that it is able to return data
		// for that metric into the child directives

		// Initialise scope variables
		$scope.visibleMetric =  $routeParams.visibleMetric || 'sleep';
		$scope.month6Data = {};

		$scope.$watch('visibleMetric',function(newVal, oldVal) {
			getData(newVal);
		});
		var getData = function(metric) {
			$scope.sleepData = null;
			$scope.sleepChange = null;
			$scope.rollingAverageData = null;

			AboutMeService.get30DayGraphData(metric,function(data) {
				$scope.sleepData = data.sleepData;
				$scope.sleepChange = Math.floor(data.sleepChange);
				$scope.rollingAverageData = data.rollingAverageData;
			});

			$scope.month6Data.mean = null;
			$scope.month6Data.highPercentile = null;
			$scope.month6Data.lowPercentile = null;
			$scope.month6Data.scale = null;

			AboutMeService.get6MonthComparisionData(metric,function(data) {
				$scope.month6Data.mean = data.mean;
				$scope.month6Data.highPercentile = data.month6HighPercentile
				$scope.month6Data.lowPercentile = data.month6LowPercentile;
				$scope.month6Data.scale = data.scale;
			});

			$scope.insights = null;
			AboutMeService.getAffectsThisData(metric,function(data) {
				$scope.insights = data;
				$scope.currentInsight = $scope.insights[Object.keys($scope.insights)[0]];
			});

			$scope.monthByMonthRange = null;
			$scope.monthByMonthSleepChange = null;
			$scope.monthlyAverages = null;
			$scope.lowMonth;
			$scope.highMonth;
			AboutMeService.getChangeOverTimeData(metric,function(data) {
				$scope.monthByMonthRange =  data.monthByMonthRange;
				$scope.monthByMonthSleepChange =  data.monthByMonthSleepChange;
				$scope.monthlyAverages = data.monthlyAverages;
				$scope.lowMonth = data.lowMonth;
				$scope.highMonth = data.highMonth;
			});

			$scope.mean = null;
			$scope.comparisonHistogramLess = null;
			$scope.comparisonHistogramMore = null;
			$scope.comparisonHistogram = null;
			$scope.lessThanUserAverage = null;
			$scope.moreThanUserAverage = null;
			$scope.similarToUserAverage = null;
			$scope.userAverageForComparison = null;

			AboutMeService.getComparisionHistogramData(metric,function(data) {
				$scope.mean = Math.floor(data.mean);
				$scope.comparisonHistogramLess = data.comparisonHistogramLess;
		        $scope.comparisonHistogramMore = data.comparisonHistogramMore;
		        $scope.comparisonHistogram = data.histogram;
		        $scope.lessThanUserAverage = data.less;
		        $scope.moreThanUserAverage = data.more;
		        $scope.similarToUserAverage = data.similar;
		        $scope.userAverageForComparison = data.mean;
			});

			$scope.top5goodSleepTags = null;
			$scope.top5badSleepTags = null;

			AboutMeService.getWritesData(metric,function(data) {
				$scope.top5goodSleepTags = data.topGood;
				$scope.top5badSleepTags = data.topBad;
				$scope.tagsWithGoodSleepQuality = data.tagsWithGoodSleepQuality;
				$scope.tagsWithBadSleepQuality = data.tagsWithBadSleepQuality;
			});
		};
		$scope.isDefined = function(v) {
			var defined = angular.isDefined(v);
			var empty;
			if (defined)
				empty = !(eval("$scope." + v) || eval("$scope." + v) == 0);
			return (defined && !empty);
		}
		$scope.nextItem = function() {
			var w = $("#correlations-carousel").width();
			$("#correlations-carousel").animate({
				marginLeft: -w
			}, 200, function() {
				$(this).find("li:last").after($(this).find("li:first"));
				$(this).css({
					marginLeft: w
				}).animate({
					marginLeft: 0
				}, 200, function() {
					var i = $(this).find("li:first").data("index");
					$scope.$apply(function() {
						$scope.currentInsight = $scope.insights[Object.keys($scope.insights)[i]];
					});
				});
			});
		}

		$scope.prevItem = function() {
			var i;
			var w = $("#correlations-carousel").width();
			$("#correlations-carousel").animate({
				marginLeft: w
			}, 200, function() {
				$(this).find("li:first").before($(this).find("li:last"));
				$(this).css({
					marginLeft: -w
				}).animate({
					marginLeft: 0
				}, 200, function() {
					var i = $(this).find("li:first").data("index");
					$scope.$apply(function() {
						$scope.currentInsight = $scope.insights[Object.keys($scope.insights)[i]];
					});
				});
			});
		}

		$scope.setInsightRating = function(rating) {
			if (!$scope.postingInsight) {
				$scope.currentInsight.hoverRating = rating;
			}
		}

		$scope.submitCurrentInsight = function($event) {
			if (!$scope.postingInsight) {
				$scope.postingInsight = true;
				Correlations.postInsightResponseObject($scope.currentInsight, function() {
					$scope.nextItem();
					$scope.postingInsight = false;
				});
			}
		}

		$scope.trusted = function(html) {
			return $sce.trustAsHtml(html);
		}
		$scope.showModal = function(modal) {
			$scope.modalTemplateName = modal;
			Modal.show('#' + modal);
			// wait for the modal to be included if not already
			$scope.$on('$includeContentLoaded', function() {
				Modal.show('#' + modal);
			});
		}

		$scope.hideModal = function() {
			Modal.hide();
		}

		$scope.modalTemplate = function() {
			if (!$scope.modalTemplateName) {
				return;
			}
			return '/app/partials/modals/' + $scope.modalTemplateName + '.html';
		}
	}]);

controllers.controller('AlcoholController',
	['$scope', '$http', '$route', '$log', 'Popover', 'Utils',
	function AlcoholController($scope, $http, $route, $log, Popover, Utils) {
	'use strict';

	$scope.units = 2;
	$scope.maxUnits = 50;
	$scope.submitting = false;

	$scope.submit = function() {
		var datum = {
			'units': $scope.units,
			'timestamp': Utils.dayTimestamp($scope.date)
		};
		$scope.submitting = true;
		Popover.lock();
		// FIXME: Use resource class
		$http.post('/data/o/alcohol', datum)
			.success(function(data, status, headers, config) {
				$scope.fetchGraphData();
			 })
			.error(function(data, status, headers, config) {
				$('#fire button').text('FAILED! Please reload the page and try again');
			}).then(function(){
				Popover.unlock();
				$scope.hide();
				$scope.submitting = false;
			});
	};

	$scope.beer_units = 2.3;
	$scope.wine_units = 2.1; // Is this right??
	$scope.spirits_units = 2;

	$scope.converter = function(unit_amount) {
		return ($scope.units / unit_amount).toFixed(0);
	};

	$scope.leftFill = function(){
		var colorStopDecimal = ($scope.units / $scope.maxUnits);
		var colorStopPercentage = (colorStopDecimal * 100) + '%';
		var fromColor = '#B3B3B3';
		var toColor = '#FFFFFF';
		return 'background: -moz-linear-gradient(left, '+ fromColor +' 0%, '+  fromColor +' '+  colorStopPercentage +', '+ toColor +' '+ colorStopPercentage +');' +
		'background: -webkit-gradient(linear, left top, right top, color-stop( 0%, '+ fromColor +'), color-stop('+  colorStopPercentage +', '+ fromColor +'), color-stop('+  colorStopPercentage +', '+  toColor +'));' +
		'background: -webkit-linear-gradient(left,  '+ fromColor +' 0%, '+ fromColor +' '+ colorStopPercentage +', '+ fromColor +' '+ colorStopPercentage +');' +
		'background: -ms-linear-gradient(left, '+ fromColor +' 0%, '+  fromColor +' '+  colorStopPercentage +', '+  toColor +' '+  colorStopPercentage +');' +
		'background: -o-linear-gradient(left,'+ fromColor +' 0%, '+  fromColor +' '+  colorStopPercentage +', '+  toColor +' '+  colorStopPercentage +');' +
		'background: linear-gradient(to right,'+ fromColor +' 0%, '+  fromColor +' '+  colorStopPercentage +', '+  toColor +' '+  colorStopPercentage +');';
	};

	$scope.isNewerBrowser = Modernizr.inputtypes.range;
	var isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
	var isSafari = /Safari/.test(navigator.userAgent) && /Apple Computer/.test(navigator.vendor);

	$scope.isWebkit = (isChrome || isSafari);
}]);

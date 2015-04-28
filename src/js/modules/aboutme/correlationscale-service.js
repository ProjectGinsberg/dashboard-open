angular.module('gb.aboutMe')
.factory('CorrelationScaleService',
	function() {
		var scaleService = function() {
			var scale = [{
				answer: 'Not useful at all',
				value: 1,
				colour: 'red'
			}, {
				answer: 'Not very useful',
				value: 2,
				colour: 'light-red'
			}, {
				answer: 'Somewhat useful',
				value: 3,
				colour: 'orange'
			}, {
				answer: 'Useful',
				value: 4,
				colour: 'yellow'
			}, {
				answer: 'Very useful',
				value: 5,
				colour: 'green'
			}];
			
			var impl = function() {};

			impl.getRatingScale = function() {
				return scale;
			};

			return impl;
		}
		return scaleService();
});
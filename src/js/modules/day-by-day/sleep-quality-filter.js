angular.module('gb.dayByDay')
.filter('sleepQuality', ['dayByDayConfig', function(dayByDayConfig) {
	var qualities = ['Terrible', 'Bad', 'OK', 'Good', 'Great'];

	return function(data) {
		if (!data || data.count === 0) return dayByDayConfig.noEntry;
		return qualities[Math.round(data) - 1];
	};
}]);

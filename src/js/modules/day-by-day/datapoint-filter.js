// Actually this is more generic
angular.module('gb.dayByDay')
.filter('datapoint', ['dayByDayConfig', function(dayByDayConfig) {
  return function(datapoint, unit, units) {
	if (!datapoint || datapoint.count === 0) return dayByDayConfig.noEntry;
	var val = Math.round(datapoint.value);
	if (!angular.isDefined(unit)) return val;
	if (!angular.isDefined(units)) units = unit + 's';
	return '' + val + ' ' + ((val === 1) ? unit : units);
  };
}]);

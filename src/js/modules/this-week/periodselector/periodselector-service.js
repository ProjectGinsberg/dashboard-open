angular.module('gb.thisWeek')
.service('ThisWeekPeriodSelection',function() {
	var service = function() {
		var impl = function() {};

		var period = {
			start: moment().endOf('week'),
			end: moment().startOf('week')
		};
		var periodNumber = 1,
			periodLengthString = 'week';

		impl.nextWeek = function() {
			period.end.add(periodNumber,periodLengthString);
			period.start.add(periodNumber,periodLengthString);
		};
		impl.prevWeek = function() {
			period.end.subtract(periodNumber,periodLengthString);
			period.start.subtract(periodNumber,periodLengthString);
		};

		impl.getStart = function() {
			return period.start;
		}
		impl.getEnd = function() {
			return period.end;
		}
		impl.getPeriod = function() {
			return {
				start: period.start.toISOString(),
				end: period.end.toISOString()
			};
		};
		impl.period = period;
		return impl;
	};
	return service();
});

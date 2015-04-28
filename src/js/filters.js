/* Filters */

var filters = angular.module('gbDashboard.filters', []);

filters.filter('slice', function() {
	return function(arr, start, end) {
		if (!arr) return arr;
		return arr.slice(start, end);
	};
});

filters.filter('titlecase', function() {
	return function(s) {
		s = ( s === undefined || s === null ) ? '' : s;
		return s.toString().toLowerCase().replace( /\b([a-z])/g, function(ch) {
			return ch.toUpperCase();
		});
	};
});

filters.filter('questionLead', function() {
	return function(question) {
		if(!question) return "";
		if (question.indexOf("I've been ") === 0) return "I've been";
		return "";
	};
});

filters.filter('questionBody', function() {
	return function(question) {
		if (!question) return "";
		if (question.indexOf("I've been ") === 0) return question.substring(10);
		return question;
	};
});

/**
 * Usage: {{item.publicationDate | humanReadableDate}}
 */
 filters.filter('humanReadableDate', function() {
	return function(date) {
		if (!angular.isDefined(date)) return "-";
		return moment(date).fromNow();
	};
 });

 filters.filter('dp', function() {
	return function(input, dp) {
		if (!angular.isDefined(input.toFixed)) return input;
		return input.toFixed(dp);
	};
 });

/**
 * Usage: {{isSubmitting | then:"Submitting...":"Submit"}}
 */
 filters.filter('then', function () {
	return function(input, trueValue, falseValue) {
		return input ? trueValue : falseValue;
	};
 });

 var formatTime = function(minutes,format) {
	var sign = minutes < 0 ? "-" : "";
	var hours = Math.floor(Math.abs(minutes/60));
	var mins = Math.floor(Math.abs(minutes % 60));
	var output = "";
	if (format == "long") {
		if (hours !== 0) output += hours + " hours ";
		output += mins + " mins";
	} else if (format === 'hours') {
		output += hours + " hrs";
	} else {
		if (hours !== 0) output += hours + "h ";
		output += mins + "m";
	}
	return sign + output;
 };
/**
 * Usage: {{ minutes | toHoursAndMinutes:"long" }}
 */
 filters.filter('toHoursAndMinutes', function() {
	return function(minutes, format) {
		if (!angular.isDefined(minutes) || isNaN(minutes)) return "";
		return formatTime(minutes,format);
	};
 });
 filters.filter('formatMetricToHuman', function() {
	return function(value, metricName,format) {
		if (!angular.isDefined(value) || isNaN(value)) return "";

		switch (metricName)
		{
			case "sleep": // format in hours and minutes
			return formatTime(value, format);
			default: // default case is just to round the number
			return Math.floor(value);
		}
	};
});

 filters.filter('timeFromNow', function () {
	return function(timestamp) {
		var now = moment();
		var msInDays = 1.15741e-8;
		var days_ago = Math.floor((now  - moment(timestamp)) * msInDays );
		var time_ago = moment().subtract(days_ago, "days");
		if((now - +time_ago) < msInDays)
			return "today";
		return time_ago.from(now);
	};
 });

 filters.filter('percentageOf', function () {
	return function(input, whole) {
		return ((input/whole) * 100)+ "%";
	};
 });

//fraction to percent
filters.filter('percent', function () {
	return function(input) {
		return Math.round(input * 100)+ "%";
	};
});

filters.filter('truncateHTML', function () {
	return function(text,numWords) {
		var t = text.replace(/<.+?>/g, '');
		var words = t.split(' ');
		return words.splice(0, numWords).join(' ');
	};
});

filters.filter('momentDate', function () {
	return function(date, format) {
		return moment(date).format(format);
	};
});

filters.filter('momentAdd', function() {
	return function(date, num, unit) {
		return moment(date).clone().add(num, unit);
	};
});

filters.filter('dateToDayString',function() {
	return function(date) {
		return date.format('ddd').toUpperCase();
	};
});

filters.filter('dateToDayNumber',function() {
	return function(date) {
		return date.format('DD');
	};
});
filters.filter('qualityOfSleep',function() {
	return function(quality) {
		if (quality && quality.value)
			switch (quality.value) {
				case 1: return "Terrible";
					break;
				case 2: return "Bad"
					break;
				case 3: return "OK"
					break;
				case 4: return "Good"
					break;
				case 5: return "Great"
					break;
				default: return "";
					break;
			}
	}
});
filters.filter('unit', function() {
	return function(val, unit, units) {
		if (!angular.isDefined(val)) return '-';
		val = Math.round(val);
		if (!angular.isDefined(unit)) return val;
		if (!angular.isDefined(units)) units = unit + 's';
		return '' + val + ' ' + ((val === 1) ? unit : units);
	};
});

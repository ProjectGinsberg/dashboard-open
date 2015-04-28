angular.module('gb.utils')
.filter('hoursAndMinutes', function() {
	return function(minutes, format) {
		if (!angular.isDefined(minutes) || isNaN(minutes)) return "-";
		var sign = minutes < 0 ? "-" : "";
		var hours = Math.floor(Math.abs(minutes/60));
		var mins = Math.floor(Math.abs(minutes % 60));
		var output = "";
		if (format == "long") {
			if(hours != 0) output += hours + " hours ";
			output += mins + " mins"
		}else{
			if (hours != 0) output += hours + "h ";
			output += mins + "m";
		}
		return sign + output;
	}
});

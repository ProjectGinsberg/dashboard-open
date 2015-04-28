angular.module('gb.myGraph')
.factory('GraphLayout', ['$window', '$log', function($window, $log) {
	'use strict';

	var service = {};

	service.MOBILE = 1;
	service.DESKTOP = 2;

	// FIXME: move this to Environment? Or a new service?
	var mode = function() {
		return ($window.innerWidth < 768) ? service.MOBILE : service.DESKTOP;
	};

	service.isMobile = function() {
		return mode() == service.MOBILE;
	};

	service.width = function() {
		return $window.innerWidth - 20;
	};

	service.framePadding = function() {
		if (service.isMobile()) {
			return { left: 60, 	right: 15, top: 0, bottom: 0 };
		}
		else {
			return { left: 150, right: 60, top: 0, bottom: 0 };
		}
	};

	service.iconSize = function() {
		return Math.max(30, 50 * service.width() / 2048);
	};

	service.dataSize = function() {
		return Math.max(25, 30 * service.width() / 2048);
	};

	service.minBlobSize = function() {
		return 0.5 * service.dataSize();
	}

	service.maxBlobSize = function() {
		if (service.isMobile()) return service.dataSize();
		return 1.5 * service.dataSize();
	}

	// Remember to set the domain!
	service.xScale = function() {
		var xScale = d3.time.scale();
		xScale.range([service.padding().left, (service.width() - service.padding().right) ]);
		return xScale;
	};

	service.animationDuration = 500;

	// Wrap a text, bottom-anchored the baseline of the original
	// Probably not the final destination for this method -- maybe a d3 utils service?
	service.wrap = function(text, width) {
		text.each(function() {
			var text = d3.select(this),
				words = text.text().split(/\s+/),
				word,
				line = [],
				lineNumber = 0,
				lineHeight = 1.1, //em
				y = text.attr('y') || 0,
				dy = parseFloat(text.attr('dy')) || 0,
				tspan = text.text(null).attr('x', 0).append('tspan');

			// Go through in *reverse* order because we want to be bottom aligned!
			while (word = words.pop()) {
				line.unshift(word);
				tspan.text(line.join(' '));
				if (tspan.node().getComputedTextLength() >= width) {
					line.shift();
					tspan.text(line.join(' '));
					line = [word];
					lineNumber = lineNumber + 1;
					tspan = text.append('tspan').attr('x', 0).attr('dy', (lineNumber * -lineHeight) + 'em').text(word);
				}
			}
		});
	};

	return service;

}]);

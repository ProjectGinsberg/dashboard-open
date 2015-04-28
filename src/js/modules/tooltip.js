'use strict';

angular.module('gb.tooltip', []);

angular.module('gb.tooltip')
.factory('Tooltip', ['$log', 'Popover', function($log, Popover) {
	var service = {};

	// FIXME: Configurable template?
	var template = angular.element('<div id="tooltip" class="popover black-popover"></div>');
	$('body').append(template);

	var tooltipTimer = null;

	service.defaultOptions = {
		delay: 450,
		priority: Popover.LOW_PRIORITY
	};

	/**
	 * Setup the specified tooltip on the specified target. A target may only
	 * have one tooltip. This method enforces that. (Hopefully.)
	 */
	service.setup = function(tooltip, target, options) {
		//$log.log("Installing tooltip handlers on " + target);
		options = $.extend({}, service.defaultOptions, options);
		target = angular.element(target);
		target.on('mouseenter', function() {
			tooltipTimer = setTimeout(function() {
				//$log.log("Showing tooltip: " + tooltip);
				template.html(tooltip);
				Popover.show(template, target, options);
			}, options.delay);
			target.on('mouseleave', function() {
				clearTimeout(tooltipTimer);
				Popover.hide(template);
			});
		});
	};

	service.clear = function() {
		clearTimeout(tooltipTimer);
		Popover.hide();
	}

	return service;
}]);

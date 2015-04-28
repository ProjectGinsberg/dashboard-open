// FIXME: Pattern more closely after dropdown
// FIXME: Maybe introduce "groups" of popovers e.g. tooltips vs data entry things
// BUT those interactions are potentially very complicated indeed.
angular.module('gb.popover', []);
angular.module('gb.popover')
.factory('Popover', ['$log', '$window', function($log, $window) {
	'use strict';

	var currentPopover = null;

	var service = {};
	service.LOW_PRIORITY = -10;
	service.DEFAULT_PRIORITY = 0;
	service.HIGH_PRIORITY = 10;

	service.defaultOptions = {
		orientation: 'auto',        // top, bottom, left or right
		margin: 15,                 // The gap between popover and target
		classPrefix: 'popover-',    // Used to namespace CSS classes that mark orientation
		priority: service.DEFAULT_PRIORITY,
		group: 'default',           // Not used currently
		onHide: null,               // Called when a popover is shown
		onShow: null,               // Called when a popover is hidden
	};

	// Used to lock popovers in position e.g. while saving
	var lock = false;
	service.lock = function() {
		if (!currentPopover) return;
		currentPopover.addClass(currentPopover.popoverOptions.classPrefix + 'locked');
		lock = true;
	};
	service.unlock = function() {
		if (!currentPopover) return;
		currentPopover.removeClass(currentPopover.popoverOptions.classPrefix + 'locked');
		lock = false;
	};

	// Hide the provided popover (or the current one if none specified)
	service.hide = function(targetPopover) {
		if (lock) return;
		if (targetPopover) {
			targetPopover = $(targetPopover);
		} else {
			targetPopover = currentPopover;
		}
		if (targetPopover) {
			targetPopover.attr('style', 'display: none;'); // HACK: make sure it hides
			var options = angular.extend({}, service.defaultOptions, targetPopover.popoverOptions);

			var classes = targetPopover.attr("class");
			if (!classes) return;

			// Filter out any classes that have been added
			classes = classes.split(" ").filter(function(c) {
				return c.indexOf(options.classPrefix) !== 0;
			});
			targetPopover.attr("class", classes.join(" "));
			if (currentPopover && currentPopover.get(0) == targetPopover.get(0)) {
				currentPopover = undefined;
				cleanupBinds();
			}
			if (options.onHide) options.onHide();
		}
	}

	// Show an element at target, both are elements or selectors.
	service.show = function(popover, target, options) {
		if (lock) return;

		// Stuff that should be in options
		var options = angular.extend({}, service.defaultOptions, options);
		var orientation = options.orientation;
		var margin = options.margin;

		// If the current popover has a higher priority, do nothing.
		if (currentPopover && currentPopover.popoverOptions.priority > options.priority) return;

		service.hide();

		popover = $(popover);
		target = $(target);

		currentPopover = popover;
		currentPopover.popoverOptions = options;

		// Both need to be visible!
		popover.show();
		popover.attr( 'style', 'display: block !important;'); //make sure it shows
		target.show();

		// HACK: Popovers are full screen on mobile...
		if ($window.innerWidth < 768) {
			if (options.onShow) options.onShow();
			return;
		}

		// Choose an auto-orientation: cheesy logic ahoy!
		if (orientation == 'auto') {
			orientation = 'top';
			var targetRect = target.get(0).getBoundingClientRect();
			if (targetRect.top < popover.height()) {
				orientation = 'bottom';
			}
			if (targetRect.left + (targetRect.right - targetRect.left) / 2 + popover.width() / 2 > $(window).width()) {
				orientation = 'left';
			}
			if (targetRect.left + (targetRect.right - targetRect.left) / 2 - popover.width() / 2 < 0 ) {
				orientation = 'right';
			}
		}

		// We're going to use these all over the place
		var targetOffset =  target.offset();
		var targetDim =     target.get(0).getBoundingClientRect();
		var popoverDim =    {width: popover.outerWidth(), height: popover.outerHeight()};

		if (orientation == 'top') {
			popover.offset({
				top:    targetOffset.top - margin - popoverDim.height,
				left:   targetOffset.left + targetDim.width / 2 - popoverDim.width / 2
			});
			// Reanchor to bottom
			var parent = popover.offsetParent();
			var current = popover.position();
			popover.css({
				top: "", right: "",
				left: current.left,
				bottom: parent.outerHeight() - current.top - popoverDim.height
			});
		}
		else if (orientation == 'left') {
			popover.offset({
				top:    targetOffset.top  + targetDim.height / 2 - popoverDim.height / 2,
				left:   targetOffset.left - margin - popoverDim.width
			});
			// Reanchor to right
			var parent = popover.offsetParent();
			var current = popover.position();
			popover.css({
				bottom: "", left: "",
				right: parent.outerWidth() - current.left - popoverDim.width,
				top: current.top
			});
		}
		else if (orientation == 'right') {
			popover.offset({
				top:    targetOffset.top  + targetDim.height / 2 - popoverDim.height / 2,
				left:   targetOffset.left + targetDim.width + margin
			});
			// No need to reanchor!
		}
		else if (orientation == 'bottom') {
			popover.offset({
				top:    targetOffset.top  + targetDim.height + margin,
				left:   targetOffset.left + targetDim.width / 2 - popoverDim.width / 2
			});
			// No need to reanchor!
		}
		else {
			throw "Unknown popover orientation " + orientation;
		}

		currentPopover.addClass(options.classPrefix + orientation);
		setupBinds();
		if (options.onShow) options.onShow();
	};

	var hideCurrent = function(evt) { service.hide(); };
	var hideIfEsc = function(evt) { if (evt.keyCode == 27) service.hide(); };

	var setupBinds = function() {
		currentPopover.bind("click", function(event) { event.stopPropagation(); });
		// HACK: Run in a timeout in case we're running in an event handler
		window.setTimeout(function() {
			$log.log("Setting up binds!");
			$(window).bind("keydown", hideIfEsc);
			$(window).bind("click", hideCurrent);
		}, 0);
	};

	var cleanupBinds = function() {
		if (currentPopover) currentPopover.unbind("click");
		$(window).unbind("keydown", hideIfEsc);
		$(window).unbind("click", hideCurrent);
	};

	return service;
}]);
// It looks like this isn't used anywhere!
angular.module('gb.popover').directive('popoverHelp', ["Popover", "$document", "$log", function(Popover, $document, $log){
	return {
		restrict: 'A',
		link: function(scope, elem, attr) {
			//$log.log("Binding help for ", elem);
			var text = attr.popoverHelp;
			var popover = angular.element('<div class="popover black-popover"><p>' + text + '</p></div>');
			$document.find('body').append(popover);

			elem.bind('mouseenter', function(e) {
				//$log.log("Showing popover for " + elem);
				Popover.show(popover, elem);
				elem.bind('mouseleave', function(e) {
					Popover.hide();
				});
			});
			elem.on('$destroy', function() {
				popover.remove();
			});
		}
	};
}]);


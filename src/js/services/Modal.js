'use strict';
gbDashboardServices.factory('Modal', function() {

	var service = {};
	var currentModal = undefined;

	var lock = false;

	service.lock = function() {
		lock = true;
	}

	service.unlock = function() {
		lock = false;
	}

	service.hide = function() {
		if (lock) return;

		if ($('#modal-overlay').length)
			$('#modal-overlay').hide();

		if (currentModal) {
			currentModal.hide();
			currentModal.attr('style', 'display: none;'); //make sure it hides
			cleanupBinds();
		}
		currentModal = undefined;
	}

	service.show = function(modal) {
		if (lock) return;
		service.hide();

		if ($('#modal-overlay').length) {
			$('#modal-overlay').show();
		} else {
			$('body').append("<div id='modal-overlay'></div>");
		}

		modal = $(modal);
		currentModal = modal;

		modal.show();
		modal.attr('style', 'display: block !important;'); //make sure it shows

		setupBinds();
	}

	var hideIfEsc = function(evt) {
		if (evt.keyCode == 27) service.hide();
	}

	var setupBinds = function() {
		currentModal.bind("click", function(event) {
			event.stopPropagation();
		});
		// HACK: Run in a timeout in case we're running in an event handler
		window.setTimeout(function() {
			$(window).bind("keydown", hideIfEsc);
			$(window).bind("click", service.hide);
			$('.hide-modal').bind("click", service.hide);
		}, 0);
	}

	var cleanupBinds = function() {
		currentModal.unbind("click");
		$(window).unbind("keydown", hideIfEsc)
		$(window).unbind("click", service.hide);
		$('.hide-modal').unbind("click", service.hide);
	}

	return service;
});
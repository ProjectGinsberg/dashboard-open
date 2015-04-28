'use strict';

directives.directive('eventEditor', ["$log", function($log) {

	function markup(text) {
		var text = text
			.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;") // Escape HTML
		 	.replace(/\n/g, '<br>')
		 	.replace(/([#]+[A-Za-z0-9-_:!?]+)/g, '<span class="tag">$1</span>');
		return text;
	}

	var directive = {};
	directive.restrict = 'E';
	//directive.require = '^EventController';
	directive.scope = false;
	directive.link = function (scope, element, attrs) {

		// Required to work around bug #389
		var el = "<div contentEditable='true' data-ph=\"What's been going on today?\"></div>"
		$(element).append(el);
		element = $($(element).children().get(0));

		var selection;			// The last observed caret position
		var tagPrefix = null; 	// The current tag prefix

		// Insert some text (ideally at the current caret)
		// Normally such methods would be defined in a controller, but this needs
		// to use the selection, which is really tied to the link binding below
		scope.insert = function(text) {
			//$log.log("Inserting event editor text", text);
			var index = scope.text.length;
			if (selection) {
				// HACK: Poking around in rangy internals
				index = selection[0].characterRange.start;
				selection[0].characterRange.start += 0 + text.length;
				selection[0].characterRange.end += 0 + text.length;
			}
			scope.text = scope.text.substr(0, index) + text + scope.text.substr(index);
		}

		// If the user is part way through a tag, then just insert the suffix
		// otherwise inserts the whole tag
		scope.complete = function(tag) {
			if (tagPrefix == null) return;
			var tagSuffix = tag.substr(tagPrefix.length);
			scope.insert(tagSuffix);
		}

		// Trying to restore an invalid selection appeared to be the cause of #463
		// FIXME: Provide an API for manipulating text rather than accessing a
		// scope variable directly. The setter can clear the selection.
		scope.clearSelection = function() {
			selection = undefined;
		}

		// Update the contents depending on
		scope.$watch("text", function() {
			//$log.log("Updating event editor text"); $log.log(scope.text);
			element.html(markup(scope.text));
			// Restore the cursor position if we took note of it
			if (selection) rangy.getSelection().restoreCharacterRanges(element.get(0), selection);
		});

		element.on("keyup", function(evt) {
			//$log.log("Updating from keyboard");
			var text = rangy.innerText(this);  		// This strips all tags
			if (evt.keyCode == 13) {
				// Special case -- if there's one tag complete on enter
				if (scope.suggestedTags.length == 1) {
					scope.complete(scope.suggestedTags[0]);
					evt.preventDefault();
					evt.stopPropagation();
					scope.$digest();
					return;
				}

				// Improves newline behaviour on Chrome, at least
				text += "\n";
			}
			scope.text = text;

			// Save the selection
			selection = rangy.getSelection().saveCharacterRanges(this);

			// Tag autocomplete
			var caretPosition = selection[0].characterRange.start;
			var match = text.substr(0, caretPosition).match(/([#]+[A-Za-z0-9-_:!?]+)$/)
			tagPrefix = (match != null ? match[0].substr(1) : null);
			scope.setTagPrefix(tagPrefix);
			scope.$digest();
		});
		element.on("click", function() {
			selection = rangy.getSelection().saveCharacterRanges(this);
		});

	};

	return directive;
}]);

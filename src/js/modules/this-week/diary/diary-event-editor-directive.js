'use strict';

directives.directive('diaryEventEditor', ["$log", function($log) {

	function markup(text) {
		if (text === null) return '';
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
		scope.entry.editing = false;
		// Required to work around bug #389
		scope.orignalContent = scope.entry.entryContent;
		var el = "<div contentEditable='true' data-ph=\"Type here to enter an event\"></div>"
		$(element).append(el);

		if (scope.entry.entryContent === null) {
			var editIcon = '<span class="diaryEditIcon" aria-hidden="true"></span>';
			$(element).append(editIcon);
		}
		element = $($(element).children().get(0));

		var selection;			// The last observed caret position
		var tagPrefix = null; 	// The current tag prefix

		// Insert some text (ideally at the current caret)
		// Normally such methods would be defined in a controller, but this needs
		// to use the selection, which is really tied to the link binding below
		scope.insert = function(text) {
			var index = scope.entry.entryContent.length;
			if (selection) {
				// HACK: Poking around in rangy internals
				index = selection[0].characterRange.start;
				selection[0].characterRange.start += 0 + text.length;
				selection[0].characterRange.end += 0 + text.length;
			}
			scope.entry.entryContent = scope.entry.entryContent.substr(0, index) + text + scope.entry.entryContent.substr(index);
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
		scope.$watch("entry.entryContent", function() {
			if (angular.isDefined(scope.entry.entryContent)) {
				element.html(markup(scope.entry.entryContent));
				// Restore the cursor position if we took note of it
				if (selection) rangy.getSelection().restoreCharacterRanges(element.get(0), selection);
			}
		});
		scope.setTagPrefix = function(prefix) {
			if (prefix === null) {
				scope.suggestedTags = null;
				return;
			}
			scope.suggestedTags = _.filter(scope.tags, function(tag) {
				return tag.indexOf(prefix) === 0;
			});
		};
		element.on("keyup", function(evt) {
			//$log.log("Updating from keyboard");
			var text = rangy.innerText(this);  		// This strips all tags
			scope.entry.entryContent = text;
			if (evt.keyCode == 13) {
				// Special case -- if there's one tag complete on enter
				if (scope.suggestedTags.length == 1) {
					scope.complete(scope.suggestedTags[0]);
					evt.preventDefault();
					evt.stopPropagation();
				}

				// Improves newline behaviour on Chrome, at least
				text += "\n";
			}


			// Save the selection
			selection = rangy.getSelection().saveCharacterRanges(this);

			// Tag autocomplete
			var caretPosition = selection[0].characterRange.start;
			var match = text.substr(0, caretPosition).match(/([#]+[A-Za-z0-9-_:!?]+)$/)
			tagPrefix = (match != null ? match[0].substr(1) : null);
			scope.setTagPrefix(tagPrefix);
			scope.$digest();
		});
		element.on("focus", function() {
			scope.entry.editing = true;
			selection = rangy.getSelection().saveCharacterRanges(this);
		});
		element.on('blur', function() {
			scope.entry.editing = false;
		});
	};

	return directive;
}]);

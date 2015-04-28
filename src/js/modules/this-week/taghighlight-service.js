angular.module('gb.thisWeek')
.service('TagHighlightService',
	/* this service manages the interaction between the
		tag directive and the diary
		where a user hovers over a tag in the tag directive
		and the uses of those tags in the diary is also highlighted
	*/
	function() {
		var tagService = function() {
			var activeTag = null;

			var impl = function() {};

			impl.activeTag = function(_) {
				if (arguments.length === 0) return activeTag;
				activeTag = _;
				return activeTag;
			};
			return impl;
		};

		return tagService();
	});

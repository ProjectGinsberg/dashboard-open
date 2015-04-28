angular.module('gb.thisWeek')
.directive('diaryEntry',
  ['$sce','$log','Popover','Tooltip','TagHighlightService','Events','Utils',function($sce,
                                                                    $log,
                                                                    Popover,
                                                                    Tooltip,
                                                                    TagHighlightService,
                                                                    Events,
                                                                    Utils) {
	return {
		restrict: 'E',

		link: function(scope, element, attrs) {
            scope.originalContent = scope.entry.entryContent;
            var onClick = function(evt) {
                $log.log("Selecting event", evt);
                scope.selectedEvent = {
                    timestamp: scope.entry.entryDay,
                    entry: scope.entry.entryContent
                }; //getEvent(evt.timestamp); // Not sure why this is required. D3?
                //scope.$digest();
                // HACK
                //Tooltip.clear();
                //Popover.show('#add-event',
                //element.find('diaryEntry').context);
                $('#add-event div[contentEditable=true]').focus();
                scope.entry.editing = true;
                //element.find('.diaryEntryButtons').show();
            };
			var content = scope.entry.entryContent;
            if (content !== null) {
    			var x = content.replace(/(^|\s)(#[a-z\d-]+)/ig, "$1<span class='tag' data-tag='$2'>$2</span>");
    			scope.entry.entryContentHtml = $sce.trustAsHtml('<span>'+x+'</span>');
                //console.log(element);
            }
            scope.$watch('entry.editing',function() {
                if (scope.entry.editing === true)
                    element.find('.diaryEntry').addClass('diaryEntryActive');
            });
			// add the service to the scope so we can watch it
			scope.TagHighlightService = TagHighlightService;
			scope.$watch('TagHighlightService.activeTag()',function(val) {
				$("span[data-tag=#"+val+"]").addClass('tagHighlight');
				$("span:not([data-tag=#"+val+"])").removeClass('tagHighlight');
			});
            var diaryContent = element.find("diaryEntry");
            $(diaryContent.context).click(onClick);

            scope.cancelEdit = function() {
                scope.entry.entryContent = scope.originalContent;
            };
            scope.saveEdit = function() {
                element.find('.diaryEntryButtons').hide();
                
                scope.originalContent = scope.entry.entryContent;
                Events.query({
                    start: scope.entry.entryDay.startOf('day').toISOString(),
                    end:  scope.entry.entryDay.endOf('day').toISOString()
                },
                function(data) {
                    // currently, the front end can only support a single event
                    // so take either the first element in the array, or create
                    // a new event for situation where user hasn't yet journaled today
                    var evt = null;
                    if (angular.isDefined(data[0]))
                    {
                        evt = data[0];
                    } else {
                        evt = new Events({
                            timestamp: scope.entry.entryDay.startOf('day'),
                            entry: "",
                            source: "Ginsberg",
                            tags:[]});
                    }
                    evt.entry = scope.entry.entryContent;
                    evt.tags = Events.extractTags(scope.entry.entryContent);
                    evt.$save().then(function() {

                    });
                });

            };
		},
		templateUrl: '/app/partials/this-week/diaryentry.html'
	};
}]);

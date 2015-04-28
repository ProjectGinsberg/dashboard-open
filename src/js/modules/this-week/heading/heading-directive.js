angular.module('gb.thisWeek')
.directive('thisWeekHeading',
['$filter','ThisWeekPeriodSelection',function($filter,ThisWeekPeriodSelection) {
    return {
        restrict: 'E',
        link: function(scope, element, attrs) {
            scope.ThisWeekPeriodSelection = ThisWeekPeriodSelection;
            //$scope.$watch('ThisWeekPeriodSelection');
            scope.$watch('ThisWeekPeriodSelection.getPeriod()',function(newVal)
            {
                scope.startDate = newVal.end;
                scope.endDate = newVal.start;
            },true);
        },
        template: "<h1 class='col-md-12 text-center diaryDayNum'>{{startDate | momentDate:'dddd, DD MMMM YYYY'}} - {{endDate | momentDate:'dddd, DD MMMM YYYY'}}</h1>"
    };
}]);

angular.module('gb.home')
.controller('SleepCardController',
['$scope','$rootScope','Sleep',
function($scope,$rootScope,Sleep) {
    $scope.records = [];
    $scope.showNewRecord = false;
    $scope.sleepTime = "00:00";
    $scope.wakeTime = "08:00";
    $scope.quality = null;
    var newRecords = [];
    var deletedRecords = [];
    // setup the resource query to get our initial data
    var getDataForDay = function(day) {
        var start = moment(day).startOf('day');
        var end = moment(day).endOf('day');

        var result = Sleep.query({
            'start':start.toISOString(),
            'end':end.toISOString()
        }).$promise.then(function(d) {
            console.log(d);
            $scope.records = d;
        });
    };
    $scope.deleteRecord = function($index) {
        var rec = $scope.records[$index];
        if (typeof rec.id !== 'undefined') {
            // we have to add this to the list of records we want
            // to delete from the server on submit
        }
        deletedRecords.push(rec);
        $scope.records.splice($index,1);
    }
    $scope.createRecord = function() {
        var today = moment();
        var bedTime = moment(today.format('YYYY-MM-DD ') + $scope.sleepTime);
        var wakeTime = moment(today.format('YYYY-MM-DD ') + $scope.wakeTime);
        if (!bedTime.isBefore(wakeTime)) bedTime.subtract(1, 'day');

        var totalSleep = wakeTime.diff(bedTime, 'minutes');

        var r = new Sleep();
        r.timestamp = moment($scope.viewedDate).startOf('day').add(6,'hours');
        r.total_sleep = totalSleep;
        r.source='Ginsberg';
        r.quality = $scope.quality;
        $scope.records.push(r);

        $scope.showNewRecord = false;
        newRecords.push(r);
    };
    $scope.newRecord = function() {
        $scope.showNewRecord = true;
    };
    $scope.sleepQualityClicked = function(quality) {
        switch (quality) {
            case "Terrible":
                $scope.quality = { value: 1 };
                break;
            case "Bad":
                $scope.quality = { value: 2 };
                break;
            case "OK":
                $scope.quality = { value: 3 };
                break;
            case "Good":
                $scope.quality = { value: 4 };
                break;
            case "Great":
                $scope.quality = { value: 5 };
                break;
            default:
                $scope.quality = null;
                break;
        }
        console.log(quality);
    }
    $scope.saveRecords = function() {
        $scope.records.forEach(function(r) {
            r.$save();
        });
    };

    $scope.$watch('viewedDate',function(newVal) {
        getDataForDay($scope.viewedDate);
    });

    var unbind = $rootScope.$on('gb.home.dashboard.save', function(){
        if ($scope.showNewRecord == true) $scope.createRecord();

        newRecords.forEach(function(r) {
            r.$save();
        });
        deletedRecords.forEach(function(r) {
            r.$delete();
        });
        deletedRecords = [];
        newRecords = [];
        $scope.showNewRecord = false;
    });

    $scope.$on('$destroy', unbind);
}]);

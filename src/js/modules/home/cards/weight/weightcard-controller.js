angular.module('gb.home')
.controller('WeightCardController',
['$scope','$rootScope','Weight',
function($scope,$rootScope,Weight) {
    $scope.records = [];
    $scope.showNewRecord = false;
    var newRecords = [];
    var deletedRecords = [];
    // setup the resource query to get our initial data
    var getDataForDay = function(day) {
        var start = moment(day).startOf('day');
        var end = moment(day).endOf('day');

        var result = Weight.query({
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
        var r = new Weight();
        r.weight = $scope.weight;
        r.timestamp = $scope.viewedDate;
        r.source='Ginsberg';
        $scope.records.push(r);
        newRecords.push(r);
        console.log('added');
        console.log(r);
    };
    $scope.newRecord = function() {
        $scope.showNewRecord = true;
    };
    $scope.saveRecords = function() {
        $scope.records.forEach(function(r) {
            r.$save();
        });
    };
    $scope.deleteRecord = function(index) {
        var record = $scope.records[index];
        record.$delete();
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
    });

    $scope.$on('$destroy', unbind);
}]);

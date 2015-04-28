angular.module('gb.home')
.controller('AlcoholCardController',
['$scope','$rootScope','Alcohol',
function($scope,$rootScope,Alcohol) {
    $scope.records = [];

    $scope.showNewRecord = false;

    var newRecords = [];
    var deletedRecords = [];
    // setup the resource query to get our initial data
    var getDataForDay = function(day) {
        var start = moment(day).startOf('day');
        var end = moment(day).endOf('day');

        var result = Alcohol.query({
            'start':start.toISOString(),
            'end':end.toISOString()
        }).$promise.then(function(d) {
            $scope.records = d;
        });
    };
    $scope.saveRecords = function() {
        $scope.records.forEach(function(r) {
            r.$save();
        });
    };
    $scope.createRecord = function() {
        var r = new Alcohol();
        r.units = $scope.units;
        r.timestamp = $scope.viewedDate;
        r.source = 'Ginsberg';
        $scope.records.push(r);
        newRecords.push(r);
        $scope.showNewRecord = false;
    };
    $scope.newRecord = function() {
        $scope.showNewRecord = true;
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
    $scope.$watch('viewedDate',function(newVal) {
        getDataForDay($scope.viewedDate);
    });

    $scope.getPintsBeer = function(units) {
        if (units)
            return Math.round(units/2.8);
        return "";
    };
    $scope.getGlassesWine = function(units) {
        if (units)
            return Math.round(units/2.1);
        return "";
    };
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

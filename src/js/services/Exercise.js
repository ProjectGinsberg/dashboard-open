'use strict';

gbDashboardServices.factory('Exercise', ['$resource', function($resource){
  var Exercise = $resource('/data/o/exercise/:id', {id: '@id'},
    {
      query: {method:'GET', isArray:true}
    }
  );

  return Exercise;
}]);

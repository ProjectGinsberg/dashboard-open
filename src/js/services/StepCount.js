'use strict';

gbDashboardServices.factory('StepCount', ['$resource', function($resource){
	var StepCount = $resource('/data/o/stepcount/:id', {id: '@id'},
	    {
	      'query': {method:'GET', isArray:true}
	    }
  	);
  	return StepCount;
}]);

'use strict';
/*{
	id: 1,
	name: "WHO Five",
	description: "The WHO-5 Well-Being Index is a questionnaire that measures current mental well-being (time frame: the previous two weeks). ",
	questions: [
	{
		id: 1,
		question_order: 1,
		questionnaire_id: 1,
		question: "If you were to consider your life in general these days, how happy or unhappy would you say you are, on the whole...?"
	},
	{
		id: 2,
		question_order: 2,
		questionnaire_id: 1,
		question: "I have felt cheerful and in good spirits"
	},
	]
}
*/
gbDashboardServices.factory('Survey', ['$resource', function($resource){
	var Survey = $resource('/data/survey/:id', {id: '@id'},
	    {
	      'query': {method:'GET'}
	    }
	);
  	return Survey;
}]);

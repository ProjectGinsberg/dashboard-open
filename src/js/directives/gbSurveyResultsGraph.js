'use strict';
directives.directive('gbSurveyResultsGraph', ["$log", "$filter", function($log, $filter) {

	var graph = {
		padding: {
			top: 70,
			right: 40,
			bottom: 50,
			left: 40
		}
	}

	graph.height = 200;

	function setUpGraph(id){
		var id = '#'+id;
		graph.width = d3.select(id).node().parentNode.clientWidth;
		// Initialisation guard...
		if(!d3.select("gb-survey-results-graph"+id+" svg").empty() && graph.svg)
			return;

		// update graph object
		graph.svg = d3.select("gb-survey-results-graph"+id).append("svg")
			.attr("viewBox", "0 0 " + graph.width + " " + graph.height)
			.attr("height", graph.height)
			.attr("width", graph.width)
			.attr("preserveAspectRatio", "xMidYMid meet")

		graph.xScale = d3.time.scale()
			.range([graph.padding.left, (graph.width -  graph.padding.right) ]);

		graph.yScale = d3.scale.linear()
			.range([(graph.height - graph.padding.bottom - 20), graph.padding.top]);
		}

	function updateGraph(data, id, startDate, endDate){
		if(!data || !data.user || !data.average){ return; }
		var myData = data.user.data;
		var averageData = data.average.data;
		// make sure graph is set up
		setUpGraph(id);

		var last_sleep;
		var dateArray = [];
		var valueArray = [];

		myData = _.map(myData, function(d){
			var t = moment(d.t).startOf("day").toDate();
			dateArray.push(t);
			valueArray.push(d.v);
			return {
			 date: t,
			 value: d.v
			 }
		});

		averageData = _.map(averageData, function(d){
			var t = moment(d.t).startOf("day").toDate();
			var m = moment(d.t).startOf("day").startOf("month").add("days", 15).toDate();
			dateArray.push(t);
			valueArray.push(d.v);
			return {
			 date: t,
			 middle_of_month: m,
			 value: d.v
			 }
		});

		var plus_one_month = moment(dateArray[dateArray.length-1]).add('months', 1).toDate();
		dateArray.push(plus_one_month);
		var axisData = averageData.slice();
		axisData.push({date: plus_one_month});

		graph.xScale.domain(d3.extent(dateArray));
		graph.yScale.domain(d3.extent(valueArray));

		//Xaxis
		graph.svg.selectAll('.x-axis')
			.data(axisData)
			.enter()
			.append("line")
			.attr("class", "x-axis")
			.style('fill', 'none')
			.style('stroke', '#CCCCCC')
			.style('stroke-width', '0.5')
			.attr("y1", graph.padding.top - 5)
			.attr("y2", graph.height - graph.padding.bottom + 5)
			.attr("x1", function(d) { return graph.xScale(d.date); })
			.attr("x2", function(d) { return graph.xScale(d.date); })

		var line = d3.svg.line()
			.x(function(d) { return graph.xScale(d.date); })
			.y(function(d) { return graph.yScale(d.value); })
			.interpolate('monotone');

		var avgLine = d3.svg.line()
			.x(function(d) { return graph.xScale(d.middle_of_month); })
			.y(function(d) { return graph.yScale(d.value); })
			.interpolate('monotone');

		graph.svg.append('path')
			.attr('d', line(myData))
			.attr('class', 'blue-line')

		graph.svg.append('path')
			.attr('d', avgLine(averageData))
			.attr('class', 'green-line')

		graph.svg.selectAll('.label')
			.data([0])
			.enter()
			.append('text')
			.attr("y", "25")
			.style("font-size", "12px")
			.style("font-style", "italic")
			.style("fill", "#636363")
			.attr("text-anchor", "middle")
			.attr("class", "label")
			.attr("x", function(d) { return graph.width/2; })
			.text("Your History")

		graph.svg.selectAll('.date-range')
			.data([0])
			.enter()
			.append('text')
			.attr("y", "45")
			.style("font-size", "14px")
			.style("font-weight", "bold")
			.style("fill", "#636363")
			.attr("text-anchor", "middle")
			.attr("class", "date-range")
			.attr("x", function(d) { return graph.width/2; })
			.text(function() {
				return "From "+moment(startDate).format("MMM YYYY")+ " - " + moment(endDate).format("MMM YYYY");
			});

		var legend1 = graph.svg.selectAll('.legend')
			.data([0])
			.enter()
			.append('g')
			.attr("class", "legend1")
		legend1.append("text")
			.attr("class", "legend-text blue")
			.attr("text-anchor", "left")
			.attr("x", function(d){ return graph.width/4 + 10; })
			.attr("y", graph.height - 15)
			.text("Your History")
		legend1.append('circle')
			.attr('class', 'legend-circle blue')
			.attr('r', 3)
			.attr("cx", function(d){ return graph.width/4; })
			.attr("cy", graph.height - 15 - 3)

		var legend2 = graph.svg.selectAll('.legend')
			.data([0])
			.enter()
			.append('g')
			.attr("class", "legend2")
		legend2.append("text")
			.attr("class", "legend-text green")
			.attr("text-anchor", "left")
			.attr("x", function(d){ return graph.width/2 + 40; })
			.attr("y", graph.height - 15)
			.text("Ginsberg Average")
		legend2.append('circle')
			.attr('class', 'legend-circle green')
			.attr('r', 3)
			.attr("cx", function(d){ return graph.width/2 + 30; })
			.attr("cy", graph.height - 15 - 3)

		graph.svg.selectAll('.point.blue')
			.data(myData)
			.enter()
			.append('circle')
			.attr('class', 'point blue')
			.attr('r', 3)

		graph.svg.selectAll('.point.green')
			.data(averageData)
			.enter()
			.append('circle')
			.attr('class', 'point green')
			.attr('r', 3)

		graph.svg.selectAll('.point.blue')
			.data(myData)
			.attr("cx", function (d) { return graph.xScale(d.date); } )
			.attr("cy", function (d) { return graph.yScale(d.value); } )

		graph.svg.selectAll('.point.green')
			.data(averageData)
			.attr("cx", function (d) { return graph.xScale(d.middle_of_month); } )
			.attr("cy", function (d) { return graph.yScale(d.value); } )

		graph.svg.selectAll('.month-label')
			.data(averageData)
			.enter()
			.append('text')
			.attr('class', 'month-label')
			.text(function(d) { return moment(d.date).format("MMM"); } )
			.attr("x", function (d) { return graph.xScale(d.middle_of_month); } )
			.attr("y", graph.height - graph.padding.bottom)

	}

	return {
		restrict: 'E', // uses directive as tag: <gb-survey-results-graph>
		link: function (scope, element, attrs) {
			var v = "question"+attrs.question;
			scope.$watch(v, function(data){
				updateGraph(data, v, scope.startDate, scope.endDate);
			});
		}
	}

}]);

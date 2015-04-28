'use strict';
directives.directive('gbRollingAverageGraph', ['$log', 'Tooltip', function($log, Tooltip) {

	var graph = {
		padding: {
			top: 40,
			right: 0,
			bottom: 40,
			left: 10
		}
	}

	graph.width = d3.select("gb-rolling-average-graph").node().parentNode.clientWidth;
	graph.height = 250;

	function setUpGraph() {
			// Initialisation guard...
			if (!d3.select("gb-rolling-average-graph svg").empty() && graph.svg)
				return;

			// update graph object
			graph.svg = d3.select("gb-rolling-average-graph").append("svg")
				.attr("viewBox", "0 0 " + graph.width + " " + graph.height)
				.attr("height", graph.height)
				.attr("width", graph.width)
				.attr("preserveAspectRatio", "xMidYMid meet")

			graph.xScale = d3.time.scale()
				.range([graph.padding.left, (graph.width - graph.padding.right)]);

			graph.yScale = d3.scale.linear()
				.range([(graph.height - graph.padding.bottom), graph.padding.top]);

		}
		// do initial graph set up (before data loads)
		// this leaves open the posiblity of animating in the data
	setUpGraph();

	function setGraphDomain(rollingAverageData, sleepData) {
		// Update x and y scaling
		if (rollingAverageData && sleepData) {
			graph.xScale.domain(d3.extent(_.map(rollingAverageData, function(d) {
				return moment(d.t).startOf("day").toDate();
			})));
			graph.yScale.domain(d3.extent(_.map(sleepData, function(d) {
				return d.v;
			})));
		}
	}

	function updateGraphRollingAverage(data) {
		if (!data) {
			return;
		}
		// make sure graph is set up
		setUpGraph();

		data.forEach(function(d) {
			d.date = moment(d.t).startOf("day").toDate();
			d.total_sleep = d.v;
		});

		var line = d3.svg.line()
			.interpolate('monotone')
			.x(function(d) {
				return graph.xScale(d.date);
			})
			.y(function(d) {
				return graph.yScale(d.total_sleep);
			});

		graph.svg.append('path')
			.attr('d', line(data))
			.style('fill', 'none')
			.style('stroke', '#bad982')
			.style('stroke-width', '3')

		// graph.svg.selectAll('circle.x')
		//   .data(data).enter()
		//   .append('circle')
		//   .attr('r', 5)
		//   .attr('class', "x")
		//   .style('fill', '#bad000')
		//   .attr("cx", function (d) { return graph.xScale(d.date); } )
		//   .attr("cy", function (d) { return graph.yScale(d.total_sleep); } )
	}

	function updateGraphDetails(data) {
		if (!data) {
			return;
		}
		// make sure graph is set up
		setUpGraph();

		data.forEach(function(d) {
			d.date = moment(d.t).startOf("day").toDate();
			d.total_sleep = d.v;
		});

		var line = d3.svg.line()
			.x(function(d) {
				return graph.xScale(d.date);
			})
			.y(function(d) {
				return graph.yScale(d.total_sleep);
			});

		// FIXME: Use stylesheets for this
		graph.svg.append('path')
			.attr('d', line(data))
			.style('fill', 'none')
			.style('stroke', '#5CB7BF')
			.style('stroke-opacity', '0.25')
			.style('stroke-width', '1')

		graph.svg.selectAll('circle.point')
			.data(data)
			.enter()
			.append('circle')
			.attr('class', 'point')
			.style('fill', '#5CB7BF')
			.style('fill-opacity', '0.5')
			.style('stroke', '#5CB7BF')
			.style('stroke-width', '1.4')
			.attr('r', 2.5)

		graph.svg.selectAll('circle.point')
			.data(data)
			.attr("cx", function(d) {
				return graph.xScale(d.date);
			})
			.attr("cy", function(d) {
				return graph.yScale(d.total_sleep);
			})

		// Tooltips
		graph.svg.selectAll('circle.hotspot').remove();
		graph.svg.selectAll('circle.hotspot')
			.data(data)
			.enter()
			.append('circle')
			.attr('class','hotspot')
			.attr('r', 20)
			.style('fill-opacity', '0')
			.attr("cx", function(d) {
				return graph.xScale(d.date);
			})
			.attr("cy", function(d) {
				return graph.yScale(d.total_sleep);
			})
			.each(function(d) {
				Tooltip.setup("" + d.total_sleep, this);
			});
	}

	return {
		restrict: 'E', // uses directive as tag: <gb-rolling-average-graph>
		link: function(scope, element, attrs) {
			/*scope.$watch('rollingAverageData', function(data){
				setGraphDomain(data, scope.sleepData);
				updateGraphRollingAverage(data);
				updateGraphDetails(scope.sleepData);
			});*/
			scope.$watch('sleepData', function(data) {
				graph.svg.remove();
				setUpGraph();
				setGraphDomain(scope.rollingAverageData, data);
				updateGraphRollingAverage(scope.rollingAverageData);
				updateGraphDetails(data);
			});
		}
	}

}]);

// FIXME: This should be rewritten as a generic histogram directive
directives.directive('gbAverageComparisonHistogram', ["$log", "$filter",
	function($log, $filter) {
		'use strict';
		var graph = {
			padding: {
				top: 60,
				right: 80,
				bottom: 60,
				left: 80
			},
			barMargin: 1,
			barWidth: 10, // UNUSED?
			width: d3.select("gb-average-comparison-histogram").node().parentNode.clientWidth,
			height: 350
		};
		var lessMoreSpacing = 45;

		function setUpGraph() {
			// Initialisation guard...
			if (!d3.select("gb-average-comparison-histogram svg").empty() && graph.svg)
				return;

			// update graph object
			graph.svg = d3.select("gb-average-comparison-histogram").append("svg")
				.attr("class", "average-histogram")
				.attr("viewBox", "0 0 " + graph.width + " " + graph.height)
				.attr("height", graph.height)
				.attr("width", graph.width)

			graph.xScale = d3.scale.linear()
				.range([graph.padding.left, (graph.width - graph.padding.right)]);

			graph.yScale = d3.scale.linear()
				.range([(graph.height - graph.padding.bottom), graph.padding.top]);

			//x axis line
			graph.svg.append("line")
				.attr({
					"class": "x-axis-line",
					"x1": graph.padding.left - 10,
					"x2": graph.width - graph.padding.right + graph.barWidth + 10,
					"y1": graph.height - graph.padding.bottom - 1,
					"y2": graph.height - graph.padding.bottom - 1,
				});

			//x axis end bits
			graph.svg.append("line")
				.attr({
					"class": "x-axis-line",
					"x1": graph.width - graph.padding.right + graph.barWidth + 10,
					"x2": graph.width - graph.padding.right + graph.barWidth + 10,
					"y1": graph.height - graph.padding.bottom + 3,
					"y2": graph.height - graph.padding.bottom - 5,
				});
			graph.svg.append("line")
				.attr({
					"class": "x-axis-line",
					"x1": graph.padding.left - 10,
					"x2": graph.padding.left - 10,
					"y1": graph.height - graph.padding.bottom + 3,
					"y2": graph.height - graph.padding.bottom - 5,
				});

			//x axis line (less)
			graph.svg.append("line")
				.attr({
					"class": "x-axis-line",
					"x1": graph.padding.left - 10 - lessMoreSpacing,
					"x2": graph.padding.left + graph.barWidth + 10 - lessMoreSpacing,
					"y1": graph.height - graph.padding.bottom - 1,
					"y2": graph.height - graph.padding.bottom - 1,
				});
			//x axis end bits (less)
			graph.svg.append("line")
				.attr({
					"class": "x-axis-line",
					"x1": graph.padding.left + graph.barWidth + 10 - lessMoreSpacing,
					"x2": graph.padding.left + graph.barWidth + 10 - lessMoreSpacing,
					"y1": graph.height - graph.padding.bottom + 3,
					"y2": graph.height - graph.padding.bottom - 5,
				});
			graph.svg.append("line")
				.attr({
					"class": "x-axis-line",
					"x1": graph.padding.left - 10 - lessMoreSpacing,
					"x2": graph.padding.left - 10 - lessMoreSpacing,
					"y1": graph.height - graph.padding.bottom + 3,
					"y2": graph.height - graph.padding.bottom - 5,
				});
			graph.svg.append("text")
				.attr("class", "xtext")
				.attr("text-anchor", "middle")
				.attr("transform", function(d) {
					return "translate(" + (graph.padding.left + graph.barWidth / 2 - lessMoreSpacing) + ", " + (graph.height - graph.padding.bottom + 17) + ")";
				})
				.text('Less');

			//x axis line (more)
			graph.svg.append("line")
				.attr({
					"class": "x-axis-line",
					"x1": graph.width - graph.padding.right + graph.barWidth + 10 + lessMoreSpacing,
					"x2": graph.width - graph.padding.right - 10 + lessMoreSpacing,
					"y1": graph.height - graph.padding.bottom - 1,
					"y2": graph.height - graph.padding.bottom - 1,
				});
			//x axis end bits (more)
			graph.svg.append("line")
				.attr({
					"class": "x-axis-line",
					"x1": graph.width - graph.padding.right + graph.barWidth + 10 + lessMoreSpacing,
					"x2": graph.width - graph.padding.right + graph.barWidth + 10 + lessMoreSpacing,
					"y1": graph.height - graph.padding.bottom + 3,
					"y2": graph.height - graph.padding.bottom - 5,
				});
			graph.svg.append("line")
				.attr({
					"class": "x-axis-line",
					"x1": graph.width - graph.padding.right - 10 + lessMoreSpacing,
					"x2": graph.width - graph.padding.right - 10 + lessMoreSpacing,
					"y1": graph.height - graph.padding.bottom + 3,
					"y2": graph.height - graph.padding.bottom - 5,
				});
			graph.svg.append("text")
				.attr("class", "xtext")
				.attr("text-anchor", "middle")
				.attr("transform", function(d) {
					return "translate(" + (graph.width - graph.padding.right + graph.barWidth / 2 + lessMoreSpacing) + ", " + (graph.height - graph.padding.bottom + 17) + ")";
				})
				.text('More');
		}
		// do initial graph set up (before data loads)
		// this leaves open the posiblity of animating in the data
		setUpGraph();

		function updateGraph(data, more, less,visibleMetric) {
			if (!data) {
				return;
			}

			var all = data.slice(0);

			// make sure graph is set up
			setUpGraph();

			//$log.log("Histogram", less, more);
			graph.xScale.domain(d3.extent([less.lower, more.lower]));
			graph.yScale.domain(d3.extent([
				less.count, more.count,
				0, d3.max(_.map(data, function(d) {
					return d.count;
				}))
			]));

			//var xAxis = d3.svg.axis()
			//  .scale(graph.xScale)
			//  .orient("bottom")
			//  .ticks(4)
			//  .tickFormat( function(d) {
			//    return "";
			//  });
			//.tickFormat( function(d) {
			//  var hours = Math.floor(d/60);
			//  if(hours == 6 || hours == 7){
			//    return "6-7 hours";
			//  }else{
			//    return Math.floor(d/60) + " hours";
			//  }
			//});

			var xAxisData = [];
			var counter = 0;
			var fiveHours = 300;
			var nineHours = 540;
			_.each(data, function(d) {
				var l = d.lower;
				if (l >= counter) {
					xAxisData.push(d);
					counter = d.lower + 60;
				}
			});

			//var xAxisGap = graph.xScale(xAxisData[1].lower) - graph.xScale(xAxisData[0].lower);
			graph.svg.selectAll(".xtext-label")
				.data(xAxisData).enter()
				.append("text")
				.attr("class", "xtext-label")
				.attr("text-anchor", "middle")
				.attr("transform", function(d) {
					return "translate(" + (graph.xScale(d.lower) + graph.xScale(d.lower + 60)) * 0.5 + ", " + (graph.height - graph.padding.bottom + 17) + ")";
				})
				.text(function(d) {
					var text = $filter('formatMetricToHuman')(Math.floor(d.lower),visibleMetric,"hours");
					return text;
					//return Math.floor(d.lower) + ""; // 5:25m is the 6th hour
				});

			xAxisData.shift();

			// These are the ticks from the main sections
			graph.svg.selectAll(".xline")
				.data(xAxisData).enter()
				.append("line")
				.attr("class", "xline")
				.style("stroke-dasharray", "2,1")
				.style("stroke", "#CCC")
				.style("stroke-width", "1")
				.attr({
					"x1": function(d) {
						return graph.xScale(d.lower);
					},
					"x2": function(d) {
						return graph.xScale(d.lower);
					},
					"y1": graph.height - graph.padding.bottom,
					"y2": (graph.height - graph.padding.bottom) + 20,
				});

			graph.svg.selectAll(".average-histogram .bar")
				.data(data)
				.enter().append("g")
				.attr("class", "bar")
				.append("rect")
				.attr("class", function(d) {
					if (d.highlight) {
						return "highlight";
					}
				})
				.attr("x", function(d) {
					return graph.xScale(d.lower) + graph.barMargin;
				})
				.attr("y", function(d) {
					return graph.yScale(d.count);
				})
				.attr("width", function(d) {
					return graph.xScale(d.upper) - graph.xScale(d.lower) - graph.barMargin * 2;
				})
				.attr("height", function(d) {
					return graph.height - graph.padding.bottom - graph.yScale(d.count);
				});

			graph.svg.selectAll(".average-histogram .less-bar")
				.data([less])
				.enter().append("g")
				.attr("class", "less-bar")
				.append("rect")
				.attr("class", function(d) {
					if (d.highlight) {
						return "highlight";
					}
				})
				.attr("x", function(d) {
					return graph.xScale(_.first(data).lower) - lessMoreSpacing;
				})
				.attr("y", function(d) {
					return graph.yScale(d.count);
				})
				.attr("width", graph.barWidth)
				.attr("height", function(d) {
					return graph.height - graph.padding.bottom - graph.yScale(d.count);
				});

			graph.svg.selectAll(".average-histogram .more-bar")
				.data([more])
				.enter().append("g")
				.attr("class", "more-bar")
				.append("rect")
				.attr("class", function(d) {
					if (d.highlight) {
						return "highlight";
					}
				})
				.attr("x", function(d) {
					return graph.xScale(_.last(data).upper) + lessMoreSpacing;
				})
				.attr("y", function(d) {
					return graph.yScale(d.count);
				})
				.attr("width", graph.barWidth)
				.attr("height", function(d) {
					return graph.height - graph.padding.bottom - graph.yScale(d.count);
				});

		}

		return {
			restrict: 'E', // uses directive as tag: <gb-average-comparison-histogram>
			link: function(scope, element, attrs) {
				scope.$watch('comparisonHistogram', function(data) {
					// hacky way for now to get the histogram to be redrawn when we have flipped metric
					d3.select("gb-average-comparison-histogram").select('svg').remove();
					updateGraph(data, scope.comparisonHistogramMore, scope.comparisonHistogramLess,scope.visibleMetric);
				});
			}
		};

	}
]);

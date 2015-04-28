'use strict';

angular.module('gb.myGraph')
.directive('wellbeingChart', ['$log', '$filter', '$window', 'Popover', 'Tooltip', 'GraphLayout', 'ResizeService', 'Utils',
	function($log, $filter, $window, Popover, Tooltip, GraphLayout, ResizeService, Utils) {

	var graph = {
		animationDuration: 500,
		easing: 'cubic-ease-in'
	}

	// Callbacks
	var showPopup;
	var showDeletePopup;

	// Chart elements
	var frame;
	var dataPoints;
	var highlightGroup;

	// Extra space required
	var TOP_PADDING = 30 + GraphLayout.framePadding().top;
	var BOTTOM_PADDING = 100 + GraphLayout.framePadding().bottom;
	var DEFAULT_PERIOD = 7; // Default number of days to display data for
	var SCALE_THRESHOLD = 700; // Under what graph width do we start reducing the data shown
	var WIDE_GRAPH = 1;
	var MOBILE_GRAPH = 2;

	/// Set the scaling system up for a wide view screen
	var scale = WIDE_GRAPH;

	var initChart = function(element){
		$log.log("Initialising wellbeing chart on ", element);
		$log.log("Width", element.clientWidth);

		graph.width = element.clientWidth - 10;
		graph.height = 300;

		graph.xAxisPosition = graph.height - 50;

		graph.svg = d3.select(element).append("svg")
			.attr("class", "subjective")
			.attr("viewBox", "0 0 " + graph.width + " " + graph.height)
			.attr("height", graph.height)
			.attr("width", graph.width)
			.attr("preserveAspectRatio", "xMidYMid meet")

		frame = graph.svg.append("g").attr("class", "frame");
		highlightGroup = graph.svg.append("g").attr("class", "highlightGroup");
		dataPoints = graph.svg.append("g").attr("class", "dataPoints")

		graph.xScale = d3.time.scale();
		graph.xScale.range([GraphLayout.framePadding().left, (graph.width - GraphLayout.framePadding().right)]);

		graph.yScale = d3.scale.linear()
			.range([(graph.height - BOTTOM_PADDING), TOP_PADDING]);

		graph.yScale.domain(d3.extent([1, 5]));
		graph.yAxis = d3.svg.axis()
			.scale(graph.yScale)
			.orient("right")
			.innerTickSize([0])
			.outerTickSize([0])
			.tickFormat(function (d) {
				var mapper = {
					"1": "Strongly disagree",
					"2": "Disagree",
					"3": "Undecided",
					"4": "Agree",
					"5": "Strongly agree",
				};
				return mapper[d];
			});

		frame.append("g")
			.attr("class", "x-axis")
			.attr("transform", "translate(0," + graph.xAxisPosition + ")")

		frame.append("g")
			.attr("class", "y-axis")
			.call(graph.yAxis)
			.selectAll(".tick text")
			.call(GraphLayout.wrap, GraphLayout.framePadding().left);

		// Move YAxis labels above gridline
		d3.selectAll('.subjective .y-axis text').attr("transform", "translate(0,-9)")

		frame.selectAll(".subjective line.horizontalGrid")
		.data([1,2,3,4,5]).enter()
		.append("line")
		.attr({
			"class":"horizontalGrid",
			"x1" : 0,
			"x2" : graph.width - GraphLayout.framePadding().right,
			"y1" : function(d){ return graph.yScale(d);},
			"y2" : function(d){ return graph.yScale(d);},
		});

		// Omits line segments connected to missing data points
		graph.line = d3.svg.line()
		 .defined(function(d) { return (d.count > 0); })
		 .x(function(d) { return graph.xScale(d.timestamp); })
		 .y(function(d) { return graph.yScale(d.v); });

		// Includes all line segments
		graph.missing_line = d3.svg.line()
		 .defined(function(d) { return true; })
		 .x(function(d) { return graph.xScale(d.timestamp); })
		 .y(function(d) { return graph.yScale(d.v); });

	}

	function updateGraphComponents(){

		$log.log(graph.from_date, graph.to_date);

		// Update x scaling
		graph.xScale.domain(d3.extent([graph.from_date, graph.to_date]));

		var range = graph.period ? graph.period.length : DEFAULT_PERIOD;
		if (scale !== WIDE_GRAPH) {
			range = DEFAULT_PERIOD; // FIXME: I'm not sure this is adequate!
		}

		var xAxis = d3.svg.axis()
			.scale(graph.xScale)
			.tickFormat('')
			.innerTickSize([0])
			.tickPadding(20)
			.orient("bottom")
			.ticks(7);
		if (range < 10) xAxis.tickValues(graph.period);

		// Update xAxis
		graph.svg.selectAll(".subjective g.x-axis")
			//.transition().ease(graph.easing).duration(graph.animationDuration)
			.call(xAxis)
			.selectAll("text")
			.selectAll("tspan")
			.data(function (d) { return [d3.time.format('%a')(d), d3.time.format('%d/%m')(d)]; })
			.enter()
			.append('tspan')
			.attr('x', 0)
			.attr('dy', function (d, i) { return (2 * i) + 'em'; })
			.text(String);

		// Vertical Gridlines
		graph.svg.select(".frame").selectAll("line.verticalGrid")
		.data(graph.xScale.ticks(range))
		.enter()
		.append("line")
		.attr(
			{
			"class":"verticalGrid",
			"x1" : function(d){ return graph.xScale(d);},
			"x2" : function(d){ return graph.xScale(d);},
			"y1" : TOP_PADDING,
			"y2" : (graph.height - BOTTOM_PADDING)
		});

		graph.svg.select(".frame").selectAll("line.verticalGrid")
			.data(graph.xScale.ticks(range))
			.exit().remove()

	}

	function showBlankIcon(el) {
		el.attr('xlink:href', "/images/data-subjective.svg")
			.attr('width', GraphLayout.dataSize())
			.attr('height', GraphLayout.dataSize())
			.attr("transform", function(d) {
				return "translate(" + (graph.xScale(d.timestamp) - GraphLayout.dataSize() / 2) + ", " + (graph.yScale(d.value) - GraphLayout.dataSize() / 2) + ")";
			});
	}

	function updateGraph(data, periodChanged) {
		//update components first
		updateGraphComponents();
		//if(!data){ return; }
		var iconSize = GraphLayout.iconSize();
		var dataSize = GraphLayout.dataSize();

		//$log.debug("Updating wellbeing chart", data);

		// Missing data line
		if (periodChanged) {
			dataPoints.selectAll('path.missing_line').remove();
			//$log.log("periodChanges?", periodChanged);
		}
		dataPoints.selectAll('path.missing_line')
			.data([data])
			.enter()
			.append("svg:path")
			.attr("class", "missing_line")
			.attr("d", graph.missing_line)
			.attr("stroke-opacity", 0) // Fade up when recreating from scratch
		dataPoints.select("path.missing_line")
		 .datum(data) // set the new data
		 .transition().ease(graph.easing).duration(graph.animationDuration)
		 .attr("d", graph.missing_line)
		 .attr("stroke-opacity", 1)

		// Data line
		dataPoints.select("path.line").remove();
		dataPoints.selectAll('path.line')
			.data([data])
			.enter()
			.append("svg:path")
			.attr("class", "line")
			.attr("d", graph.line)
			.attr("stroke-opacity", 0)
			.transition().delay(graph.animationDuration).duration(graph.animationDuration)
			.attr("stroke-opacity", 1);

		// Data point icons
		dataPoints.selectAll('.remove-subjective-data').remove();

		var newData = dataPoints.selectAll('.remove-subjective-data')
			.data(data)

		newData
			.enter()
			.append("image")
			.classed("remove-subjective-data", true)
			.filter(function(d) { return (d.c >= 1); })
			.classed("clickable", true)
			.call(showBlankIcon)
			.attr("opacity", 0)
			.transition().delay(graph.animationDuration).duration(graph.animationDuration)
			.attr("opacity", 1)

		newData
			 // FIXME: Replace with CSS?
			.on("mouseover", function() {
				showMinusIcon(this);
				d3.select(this).on("mouseout",  function() {
					showBlankIcon(d3.select(this));
				});
			})
			.on("click", function(d) {
				Tooltip.clear();
				showMinusIcon(this);
				showDeletePopup(d);
			})
			.each(function(d) {
				Tooltip.setup('Delete this data point', this);
			})

		var showMinusIcon = function(el){
			d3.select(el)
			.attr('xlink:href', "/images/delete-subjective-data.svg")
			.attr('width', iconSize)
			.attr('height', iconSize)
			.attr("transform",  function(d) {
				return "translate(" + (graph.xScale(d.timestamp) - iconSize / 2) + ", " + (graph.yScale(d.value) - iconSize / 2) + ")";
			});
		}

		// TODO: Special case for yesterday?
		var yesterday = moment().startOf("day").subtract(1, "day").toDate();
		var today = moment().toDate();
		//$log.log("Yesterday", yesterday, "Today", today);
		dataPoints.selectAll('.add-subjective-data').remove()
		dataPoints.selectAll('.add-subjective-data')
			.data(_.filter(data, function (d) {
				// we allow users to add wellbeing to any valid date,
				// whereas before it was only 24 hours
				if (d.timestamp > today) {
					return false; // dont allow wellbeing for tomorrow
				}
				var good = (d.count === 0)
				return good;
			}))
			.enter()
			.append("image")
			.classed("add-subjective-data", true)
			.classed("interpolated", true)
			.classed("clickable", true)
			.attr("xlink:href", "/images/add-subjective-data.svg")
			.attr("width", iconSize)
			.attr("height", iconSize)
			.attr("transform", function(d) {
				return "translate(" + (graph.xScale(d.timestamp) - (iconSize / 2)) + ", " + (graph.yScale(d.value) - iconSize / 2) + ")";
			})
			.on("click", function(d) {
				Tooltip.clear();
				showPopup(d);
			})
			.each(function(d) {
				Tooltip.setup("You can reflect and track wellbeing", this);
			});
	}

	// Deal with the selection model...
	var updateSelectedDays = function(selectedDays, data) {
		// Join with our data to get y co-ordinates. Ugh.
		var selectedData = _.chain(data)
			.map(function(d) {
				if (d.count <= 0) return null; // Strip interpolated data points
				var time = Utils.startOfDay(d.timestamp).unix();
				var match = _.find(selectedDays, function(d2) {
					return Utils.startOfDay(d2.timestamp).unix() == time;
				});
				if (!match) return null;
				return {
					timestamp: d.timestamp,
					value: d.v,
					tags: match.tags
				};
			})
			.compact()
			.value();

		//$log.log("Selected data", selectedData);

		var poofRadius = 50;
		// A group of higlights on a data point
		var highlightGroups = highlightGroup
			.selectAll('.highlights')
			.data(selectedData, function(d) { return d.timestamp; });
		highlightGroups.exit()
			.classed("highlights", false)
			.selectAll('.highlight')
			.classed("inner", false)
			.classed('highlight', false)
			.classed('xhighlight', true)
			.attr("stroke-opacity", 0)
			.transition().ease("cubic").duration(600)
			.attr("r", poofRadius)
			.remove();
		highlightGroups.enter().append("g").attr("class", "highlights");
		highlightGroups
			.attr("transform", function(d) {
				return "translate(" + graph.xScale(d.timestamp) + "," + graph.yScale(d.value)  + ")";
			});

		// The highlights themselves
		var size = GraphLayout.dataSize() * 0.8;
		var increment = GraphLayout.dataSize() * 0.2;
		var radius = function(d, i) { return (size + i * increment); }

		var highlights = highlightGroups
			.selectAll('.highlight')
			.data(function(d) { return d.tags; }, function(d) { return d; }) // Join on tag!

		highlights.enter().append("circle").attr("class", "highlight").attr("opacity", 0).attr("r", 10);
		highlights.exit()
			.classed("inner", false)
			.classed("highlight", false)
			.classed('xhighlight', true)
			.attr("stroke-opacity", 0)
			.transition().ease("cubic").duration(600)
			.attr("r", poofRadius)
			.remove();

		highlights
			.attr("class", _.identity) // Maybe a nicer way of doing this?
			.classed("inner", function(d, i) { return i == 0; })
			.classed("highlight", true)
			.attr("opacity", 1)
			.attr("stroke-opacity", 1)
			.transition().duration(600)
			.attr("r", radius)
	}

	var d = {}
	d.restrict = 'A';
	d.controller = 'WellbeingChartController';
	d.require =  ['^periodSelection', '^wellbeingDataSelection', '^daySelection'];
	d.scope = true;
	d.link = function (scope, element, attrs) {

		initChart(element.get(0))

		showPopup = function(data) {
			scope.date = data.timestamp;
			Popover.show('#add-wellbeing-datum', d3.event.target);
			scope.$digest();
		}

		showDeletePopup = function(datum) {
			scope.wellbeingDatumToDelete = datum;
			Popover.show('#delete-wellbeing-datum', d3.event.target);
			scope.$digest();
		}

		var lastPeriod = scope.period();

		scope.$watch("subjectiveData", function(data) {
			graph.period = scope.periodSelection();
			graph.from_date = new Date(scope.periodStart());
			graph.to_date = new Date(scope.periodEnd());
			if(graph.period && graph.from_date && graph.to_date){
				updateGraph(scope.subjectiveData, scope.period() != lastPeriod);
				lastPeriod = scope.period();
			}
			// Update highlights
			updateSelectedDays({}, scope.subjectiveData); // Actually it should be the previous data... but doesn't matter
			updateSelectedDays(scope.selectedDays(), scope.subjectiveData);
		});

		scope.$watch("selectedDays()", function(selectedDays) {
			updateSelectedDays(selectedDays, scope.subjectiveData);
		});
		ResizeService.addListener(function() {
			graph.svg.remove();
			initChart(element.get(0));
			updateGraph(scope.subjectiveData, true);
			lastPeriod = scope.period();
		});
	}
	return d;
}]);

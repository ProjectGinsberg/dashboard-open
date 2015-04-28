"use strict";

directives.directive('eventChart', ["$log", "$filter", "Popover", 'Tooltip', "Events", 'GraphLayout', 'ResizeService', 'Utils',
	function($log, $filter, Popover, Tooltip, Events, GraphLayout, ResizeService, Utils) {

	///////////////////////////////////////////////////////////////////////////////////////////////////
	// FIELDS
	///////////////////////////////////////////////////////////////////////////////////////////////////

	// Chart elements. TODO: Unpick graph
	// TODO: Use UPPER_CASE for constants
	var svg;
	var graph = {
		padding: {
			top: 0,
			right: 60,
			bottom: 0,
			left: 150
		},
		width: undefined, // Set to full width
		height: 120,      // Chart height
		easing: "elastic",
	}
	var table;
	var dotRadius = 3; // TODO: Scale

	// Layout
	var xScale;
	var rowHeight = 40;

	// View state
	var selectedTags = [null, null, null]; // Add more nulls for more selections!
	var highlightedTag; // A "temporary" selection
	var highlightedTagAlreadySelected = false; // If true then don't clear

	// Data
	var chartDays;
	var chartData;
	var chartTags;

	// Forward declare some event handlers that have access to the scope
	var onAddIconClick;
	var applyTagSelection;

	///////////////////////////////////////////////////////////////////////////////////////////////////
	// LAYOUT AND INITIALISATION
	///////////////////////////////////////////////////////////////////////////////////////////////////
	// element: a DOM element (not jQuery...)
	function initChart(elem) {
		$log.log("Setting up event chart on ", elem);
		$log.log("Width", elem.clientWidth);

		graph.width = elem.clientWidth - 10;
		graph.height = 120;

		if (GraphLayout.isMobile()) graph.height = 80;

		svg = d3.select(elem).append("svg")
			//.attr("viewBox", "0 0 " + graph.width + " " + graph.height)
			.attr("height", graph.height)
			.attr("width",  graph.width)
			.attr("preserveAspectRatio", "xMidYMid meet");

		// The event tag table -- first cos it's underneath the dots
		table = svg
			.append("g")
			.attr("class", "table")
			.attr("transform", "translate(0," + (graph.height + 1) + ")");

		var bumper = svg
			.append("g")
			.append("rect")
			.attr("class", "toggle")
			.attr("width", graph.width)
			.attr("height", graph.height / 2)
			.attr("x", 0)
			.attr("y", graph.height / 2)
			.on("click", toggleTable);

		// The (poorly-named) chart
		graph.svg = svg
			.append("g")
			.attr("transform", "translate(0,"+ (graph.height/2) + ")");

		xScale = d3.time.scale();
		xScale.range([GraphLayout.framePadding().left, (graph.width -  GraphLayout.framePadding().right) ]);

		// Draw the xaxis
		// FIXME: Sort out the naming here... we're using "y ticks" styling...
		var axis = graph.svg.append('g').attr("class", "y-axis");
		axis.append("line")
			.attr({
				"class":"horizontalGrid",
				"x1" : 0,
				"x2" : (graph.width - GraphLayout.framePadding().right),
				"y1" : 0,
				"y2" : 0,
		});

		// Label
		axis
			.append("text")
			.attr("transform", "translate(0, -9)")
			.text("Events");
	}

	var setData = function (days, data) {
		chartDays = days;
		// Push this into the controller, maybe?
		chartData = _.chain(days).map(function(timestamp) {
				//$log.log("Get event for " + timestamp);
				var evt = _.find(data, function(evt) {
					return moment(evt.timestamp).isSame(moment(timestamp), 'day');
				});
				if (evt) return evt;
				return new Events({
					timestamp: Utils.dayTimestamp(timestamp),
					entry: "",
					source: "Ginsberg",
					tags:[]}); // FIXME: Move to prototype?
			})
			.map(function(d) {
				return _.extend(d, {day: Utils.startOfDay(d.timestamp)});
			}).value();

		// Grab a sorted list of all tags from the data
		chartTags = _.reduce(chartData, function(acc, v) {
			return _.union(acc, v.tags);
		}, []).sort();

		//$log.log(chartData, chartTags);
		updateChart();
		updateTable();
		updateTagDots();
	};

	///////////////////////////////////////////////////////////////////////////////////////////////////
	// EVENT TIMELINE
	///////////////////////////////////////////////////////////////////////////////////////////////////

	var updateChart = function() {
		$log.log("Updating event chart");
		//$log.log("chartDays", chartDays);

		// Update xScale
		xScale.domain(d3.extent(chartDays));
		var addSize = GraphLayout.iconSize();
		var dSize = GraphLayout.dataSize();

		var events = graph.svg.selectAll(".event").data(chartData);

		// Cleanup/create data points
		events.exit().remove();
		events
			.enter()
			.append("g")
			.attr("class", "event")
			.append("image")
			.attr("class", "add-event-data clickable")
			.on("click", onAddIconClick)
			.each(function(data) {
				Tooltip.setup("Log an event for " + moment(data.timestamp).format('dddd DD/MM/YYYY'), this);
			});

		// Update data points
		events
			.attr("transform", function(d)  {
					var size = dSize;
					return "translate(" + xScale(d.day) + ", 0)";
			})
			.select("image")
			.attr("width", 0)
			.attr("height", 0)

		events
			.transition()
			.attr("transform", function(d)  {
					var size = (angular.isDefined(d.id) ? dSize : addSize);
					return "translate(" + (xScale(d.day) - (size / 2)) + ", -" + size/2 + ")";
			})
			.select("image")
			.attr("xlink:href", function(d) {
				return (angular.isDefined(d.id) ? "/images/data-event.svg" : "/images/add-event-data.svg");
			})
			.attr("width",      function(d) { return (angular.isDefined(d.id) > 0 ? dSize : addSize); })
			.attr("height",     function(d) { return (angular.isDefined(d.id) > 0 ? dSize : addSize); })

		// Tweaks for the 30-day view
		// First reset the defaults, we could just remove all points, but this is more flexible...
		events.select("image").attr("class", "clickable");
		if (chartDays.length > 8) {
			events
				.filter(function (d) { return !d.id })
				.select("image")
				.attr("class", "clickable only-hover")
		}
	}

	var updateTagDots = function() {

		$log.log("Updating tag dots");
		$log.log("Highlight", highlightedTag);

		var dSize = GraphLayout.dataSize();
		var events = graph.svg.selectAll(".event").data(chartData);
		var tags = events.selectAll(".tags").data(function (d) { return _(d.tags).sort(); }) // Must be an array

		tags.exit().remove();

		tags
			.enter()
			.append("g")
			.attr("class", "tags clickable")
			.append("circle")
			.attr({ r: dotRadius, cx: dSize/2, cy: dSize })
			.attr("fill-opacity", 0)
			.on("click", toggleTable);

		tags
			.select('circle')
			.classed("highlighted", function(tag) { return tableVisible && _.contains(selectedTags, tag); })
			.classed('hover', function(tag) { return tag === highlightedTag; })
			.classed('selection-0', function(tag) { return selectedTags.indexOf(tag) === 0})
			.classed('selection-1', function(tag) { return selectedTags.indexOf(tag) === 1})
			.classed('selection-2', function(tag) { return selectedTags.indexOf(tag) === 2})
			.transition()
			.delay(function(tag, i) { return 100 * i;} )
			.duration(function(tag, i) { return i < 5 ? 500 : 0; })
			.attr("cy", function(tag, i) {
				// Up to 5 dots appear below the event icon if table is closed...
				if (!tableVisible) return (dSize + (i < 5 ? i : 0) * 9) + dotRadius * 1.5 + 1;
				// ...otherwise bung them in the correct row
				var targetRow = _.indexOf(chartTags, tag);
				return graph.height / 2 + (targetRow * rowHeight) + rowHeight / 2 + dSize/2;
			})
			.attr("fill-opacity", 1)
			// FIXME: Add mouseenter
	}

	///////////////////////////////////////////////////////////////////////////////////////////////////
	// TAG TABLE
	///////////////////////////////////////////////////////////////////////////////////////////////////
	var tableVisible = false;
	var toggleTable = function() {
		tableVisible = !tableVisible;
		// FIXME: Factoring
		var targetHeight = tableVisible ? graph.height + table.height : graph.height;
		svg.transition().attr("height", targetHeight);
		updateTagDots();
	}

	var updateTable = function() {

		var days = chartDays;
		var data = chartData;
		var tags = chartTags;

		table.height = rowHeight * (tags.length + 1);
		var targetHeight = tableVisible ? graph.height + table.height : graph.height;
		svg.transition().attr("height", targetHeight);

		// TODO: Maybe we want to sort this differently?
		//$log.log("Tags", tags);

		table.selectAll(".cell").remove();
		table.selectAll("line").remove();
		table.selectAll("text").remove();

		var numRows = tags.length;
		var numCols = days.length;
		var colWidth = rowHeight; //(graph.width - GraphLayout.framePadding().left - GraphLayout.framePadding().right) / numCols;

		var cells = table.append("g").attr("class", "cells");
		var frame = table.append("g").attr("class", "frame");

		var rowWidth = graph.width - GraphLayout.framePadding().right + rowHeight / 2;

		// Could we do this with data binding? Yes, and it might be nicer
		// e.g. the closures for event handlers below are ugly.
		for (var row = 0; row < numRows; row++) {
			var tag = tags[row];
			var rowClass = "row-" + row;

			// Row label and delineation
			frame.append("line")
				.attr("class", "axis")
				.attr({
					x1: 0,
					x2: rowWidth,
					y1: row * rowHeight,
					y2: row * rowHeight
				});

			frame.append("text")
				.classed("axis-label", true)
				.classed(rowClass, true)
				.attr("transform", "translate(0," + ((row + 0.5) * rowHeight + 2) + ")") // FIXME: Fudge
				.text("#" + tag)

			// Used to detect which row is currently hovered
			frame.append("rect")
				.classed("row", true)
				.classed(rowClass, true)
				.attr('x', 0)
				.attr('y', row * rowHeight)
				.attr('width', rowWidth)
				.attr('height', rowHeight)
				.on("mouseenter", function(tag) { return function() {
					highlightTag(tag);
				}} (tag))
				.on("mouseleave", function() {
					highlightTag(null);
				})
				.on("click", function(tag) { return function() {
					// If we're not in highlight mode, toggle
					if (highlightedTag == null || highlightedTagAlreadySelected) {
						if (_.contains(selectedTags, tag)) {
							deselectTag(tag);
						}
						else {
							selectTag(tag);
						}
						return;
					}
					// If we are in highlight mode select
					if (highlightedTag == tag) {
						highlightedTag = null;
						table.selectAll('.hover').classed('hover', false); // HACK: Clear hover effect
						selectTag(tag)
					}
				}}  (tag))

			// Cells
			for (var col = 0; col < numCols; col++) {
				var day = days[col];
				var colClass = "col-" + col;
 				if (data[col].tags.indexOf(tag) == -1) continue; // No cell
				cells.append("rect")
					.classed("cell", true)
					.classed(rowClass, true)
					.classed(colClass, true)
					.attr("x", xScale(day) - colWidth / 2) // FIXME
					.attr("y", row * rowHeight)
					.attr("width", colWidth)
					.attr("height", rowHeight)
			}
		}
		// Final row
		frame.append("line")
			.attr("class", "axis")
			.attr({
				x1: 0,
				x2: rowWidth,
				y1: rowHeight * numRows,
				y2: rowHeight * numRows
		});
	}

	// Pass in null or any bogus tag to clear highlights
	var highlightTag = function(tag) {
		var row = chartTags.indexOf(tag);
		table.selectAll('.hover').classed('hover', false);
		table.selectAll('.row-' + row).classed('hover', true);

		// Clear any existing highlight
		if (highlightedTag && !highlightedTagAlreadySelected) {
			var tmp = highlightedTag;
			highlightedTag = null;
			deselectTag(tmp);
		}

		// If the tag is not selected, we're highlighting
		highlightedTag = tag;
		highlightedTagAlreadySelected = _.contains(selectedTags, tag);
		updateTagDots();

		// If the tag is null we're done
		if (tag == null) return;

		selectTag(tag);
	}

	var deselectTag = function(tag) {
		$log.log("Deselecting ", tag);
		var selectionIndex = selectedTags.indexOf(tag);
		var row = chartTags.indexOf(tag);

		// Not selected? Nothing to do
		if (selectionIndex == -1) return;

		// Otherwise clear it
		selectedTags[selectionIndex] = null;
		table.selectAll('.row-' + row).classed('selection-' + selectionIndex, false);
		updateTagDots();
		applyTagSelection();
	}

	var selectTag = function(tag) {
		$log.log("Selecting ", tag);
		var selectionIndex = selectedTags.indexOf(tag);
		var row = chartTags.indexOf(tag);

		// Not selected?
		if (selectionIndex == -1) {
			// Find a free slot and poke in the selection
			selectionIndex = selectedTags.indexOf(null);
			if (selectionIndex == -1) {
				$log.log("No more selection slots");
				return;
			}
		}

		selectedTags[selectionIndex] = tag;
		table.selectAll('.row-' + row).classed('selection-' + selectionIndex, true);
		updateTagDots();
		applyTagSelection();
	}

	///////////////////////////////////////////////////////////////////////////////////////////////////
	// DIRECTIVE DEFINITION
	///////////////////////////////////////////////////////////////////////////////////////////////////
	var directive = {};
	directive.restrict = 'A';
	directive.controller = 'EventChartController';
	directive.require = ['^daySelection', '^periodSelection'];
	directive.scope = true;
	directive.link = function (scope, element, attrs) {

		onAddIconClick = function(evt) {
			$log.log("Selecting event", evt);
			scope.selectedEvent = evt; //getEvent(evt.timestamp); // Not sure why this is required. D3?
			scope.$digest();
			// HACK
			Tooltip.clear();
			Popover.show('#add-event', d3.event.target);
			$('#add-event div[contentEditable=true]').focus();
		}

		var getDaySelection = function() {
			$log.log("Selected tags", selectedTags);

			// Create the horrible day selection data structure
			// 'tag' -> list of days might be cleaner, but we'd end up having to
			// preprocess it into (more or less) this form in the wellbeing chart
			// and we really do want this to be nippy, because it's used in hover
			// routines.
			var daySelection = _
				.chain(scope.eventData)
				.map(function(evt) {
					// Map tags onto their selection classes
					var selectionTags = _.chain(evt.tags)
						.map(function(tag) { return selectedTags.indexOf(tag); })
						.reject(function(index) { return index == -1; })
						.sortBy(function(index) { return index; })
						.map(function(index) { return 'selection-' + index; })
						.value();
					if (selectionTags.length == 0) return null;
					return {
						timestamp: Utils.startOfDay(evt.timestamp),
						tags: selectionTags
					}
				})
				.compact().value();
			return daySelection;
		}

		applyTagSelection = function() {
			var daySelection = getDaySelection();
			scope.$apply(function() { scope.selectedDays(daySelection); })
		}

		var updateChart = function() {
			setData(scope.periodSelection(), scope.eventData);
			// Carry over as many selected tags as possible
			// Plus a bit of a HACK to ensure the table rows get updated.
			// Better factoring would eliminate the duplication of code from selectTag()
			for (var i = 0; i < selectedTags.length; i++) {
				var row = chartTags.indexOf(selectedTags[i]);
				if (row == -1) {
					selectedTags[i] = null;
					continue;
				}
				table.selectAll('.row-' + row).classed('selection-' + i, true);
				updateTagDots();
			}
			scope.selectedDays(getDaySelection());
		}

		initChart(element.get(0));
		scope.$watch("eventData", updateChart);

		ResizeService.addListener(function() {
			svg.remove();
			initChart(element.get(0));
			updateChart();
		});
	};

	return directive;
}]);

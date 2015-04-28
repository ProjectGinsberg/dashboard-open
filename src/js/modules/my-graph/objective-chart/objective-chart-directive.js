angular.module('gb.myGraph')
.directive('objectiveChart', ['$log', '$filter', 'Tooltip', 'GraphLayout', 'ResizeService',
	function($log, $filter, Tooltip, GraphLayout, ResizeService) {
	'use strict';
	var parentScope = {};

	// Chart elements (all D3)
	var svg;
	var frame;
	var xScale;
	var label;

	// Groups of elements
	var blobGroup;
	var labelGroup;
	var editIconGroup;
	var addIconGroup;

	// Callbacks
	var showDeletePopup;
	var showAddPopup;

	function initChart(element) {
		$log.log('Initialising objective chart on', element);
		$log.log('Width', element.clientWidth);

		 // FIXME: Erm hardcoded?
		var width = element.clientWidth - 10;
		var height = 120;

		// Update graph object
		svg = d3.select(element).append('svg')
			.attr('class', 		'objective')
			.attr('viewBox', 	'0 0 ' + width + ' ' + height)
			.attr('height', 	height)
			.attr('width', 		width)
			.attr('preserveAspectRatio', 'xMidYMid meet');

		// Center horizon line/axis. Questionable.
		frame = svg
			.append('g')
			.attr('transform', 'translate(0,' + height/2 + ')');

		xScale = d3.time.scale();
		xScale.range([GraphLayout.framePadding().left, (width - GraphLayout.framePadding().right) ]);

		// X-axis
		var axis = frame.append('g').attr('class', 'y-axis');
		axis
			.append('line')
			.attr({
				'class':'horizontalGrid',
				'x1' : 0,
				'x2' : (width - GraphLayout.framePadding().right),
				'y1' : 0,
				'y2' : 0,
			});

		// Label
		label = axis.append('text')
					.attr("transform","translate(0,-9)")
					.text('')
					.attr('class','objectiveLabel');
		addIconGroup = frame.append('g').classed('addIconGroup', true);
		blobGroup = frame.append('g').classed('blobGroup', true);
		labelGroup = frame.append('g').classed('labelGroup', true);
		editIconGroup = frame.append('g').classed('editIconGroup', true);
	}

	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// UPDATE METHODS
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	function updateLabel(labelText) {
		label
			.text(labelText)
			.call(GraphLayout.wrap, GraphLayout.framePadding().left);
	}

	function updateGraph(dataset, periodStart, periodEnd) {

		if(!dataset){ return; } // FIXME: Uh, how can this happen?

		$log.log('Objective data', dataset);
		xScale.domain(d3.extent([periodStart, periodEnd]));

		// Temporary to facilitate refactoring
		var interpolated = _.filter(dataset.data, function(d) { return d.count === 0; });
		var data = _.filter(dataset.data, function(d) { return d.count > 0; });

		// Scaling calculations
		var iconSize = GraphLayout.iconSize();
		var max = _.max(_.map(data, function(d) { return d.value; }));
		var radiusScale = d3.scale.linear()
			.range([GraphLayout.minBlobSize(), GraphLayout.maxBlobSize()])
			.domain([0, max]);
		var opacityScale = d3.scale.linear()
			.range([0.3, 1.0])
			.domain([0, 0.5 * max]);

		var cleanMode = (dataset.data.length > 10); // HACK: Not like this please

		////////////////////////////////////////////////////////////////////////////////////////////////////////////////
		// Blobs
		////////////////////////////////////////////////////////////////////////////////////////////////////////////////
		var blobs = blobGroup.selectAll('circle').data(data);
		var blobLabels = labelGroup.selectAll('text').data(data);
		var editIcons = editIconGroup.selectAll('image').data(data);

		blobs.exit().remove();
		blobLabels.exit().remove();
		editIcons.exit().remove();

		////////////////////////////////////////////////////////////////////////////////////////////////////////////////
		// Create data elements -- actually we could do this once
		////////////////////////////////////////////////////////////////////////////////////////////////////////////////
		blobs.enter().append('circle').attr('r', 0);

		blobLabels
			.enter()
			.append('text')
			.attr('text-anchor', 'middle')
			.attr('y', '5')
			.attr('class', 'blobLabel clickable');

		editIcons
			.enter()
		 	.append('image')
		 	.attr('xlink:href', '/images/edit-objective-data.svg')
		 	.attr('class', 'edit-objective-data clickable')
		 	.attr('width', iconSize)
		 	.attr('height', iconSize)
		 	.attr('visibility', 'hidden');

		////////////////////////////////////////////////////////////////////////////////////////////////////////////////
		// Move data into place
		////////////////////////////////////////////////////////////////////////////////////////////////////////////////
		blobs
			.attr('transform', function(d) { return 'translate('+ xScale(d.timestamp) +',0)'; })
			//make sure classes stay updated
			.attr('class', function (d) { return ['quality-' + d.quality, dataset.series, 'circle', 'clickable'].join(' '); })
			.on('click', showDeletePopup)
			.on('mouseover', function (d) {
				editIcons.filter(function (d2) { return (d2 === d); }).attr('visibility', 'visible');
				blobLabels.filter(function(d2) { return (d2 === d); }).attr('visibility', 'hidden');
			})
			.on('mouseout', function (d) {
				editIcons.filter(function (d2) { return (d2 === d); }).attr('visibility', 'hidden');
				blobLabels.filter(function(d2) { return (d2 === d); }).attr('visibility', 'visible');
			})
			.each(function(d) {
				Tooltip.setup('Edit or remove data', this);
			});


		// Animated update of blob styles
		blobs
			.data(data)
			// Bouncy!
			.transition().ease('elastic')
			.attr('r', function (d) { return radiusScale(d.value); })
			.attr('fill-opacity', function (d) {
				// don't change the opacity for sleep
				if (dataset.series == 'sleep') return 1;
				// Otherwise scale
				return opacityScale(d.value);
			});

		// Update blob labels
		blobLabels
			.attr('x', function(d) { return xScale(d.timestamp); })
			.text(function(d) {
				// Hide values in 30 day view
				if (cleanMode) return '';
				// Special case for sleep data
				else if (dataset.series == 'sleep') {
					return $filter('hoursAndMinutes')(d.value);
				}
				// Special case for weigth data
				else if (dataset.series == 'weight') {
					return d.value.toFixed(1);
				}
				// Otherwise we're done
				return Math.round(d.value);
			});

		editIcons
			.attr('transform', function(d) { return 'translate(' + (xScale(d.timestamp) - (iconSize / 2)) + ', -' + iconSize/2 + ')'; });


		////////////////////////////////////////////////////////////////////////////////////////////////////////////////
		// ADD ICONS
		////////////////////////////////////////////////////////////////////////////////////////////////////////////////

		addIconGroup.selectAll('image').remove();
		if (dataset.series == 'social') return;

		var addIcons = addIconGroup.selectAll('image').data(interpolated);

		addIcons
			.enter()
			.append('image')
			.attr('xlink:href', '/images/add-objective-data.svg')
			.attr('class', 'add-objective-data clickable')
			.attr('width', 0)
			.attr('height', 0)
			.attr('transform', function(d) { return 'translate(' + xScale(d.timestamp) + ', 0)'; })
			.each(function(d) {
				Tooltip.setup('Add data for ' + moment(d.timestamp).format('dddd, DD/MM/YYYY'), this);
			})

		addIcons
			.classed('only-hover', function(d) { return cleanMode; })
			.on('click', showAddPopup)
			.transition()
			.attr('width', iconSize)
			.attr('height', iconSize)
			.attr('transform', function(d) { return 'translate(' + (xScale(d.timestamp) - (iconSize / 2)) + ', -' + iconSize/2 + ')'; });
	}

	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// DIRECTIVE DEFINITION
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	return {
		restrict: 'EA', // uses directive as tag
		controller: 'ObjectiveChartController',
		require: ['^periodSelection', '^wellbeingDataSelection', '^daySelection'],
		scope: true,
		link: function (scope, element, attrs, ObjectiveChartController) {

			// FIXME: Eliminate hokey calls to scope.show()
			showDeletePopup = function(datum) {
				Tooltip.clear();
				var series = scope.objectiveSelection().id;
				if (series == 'sleep') {
					scope.sleepDeleteDate = datum.timestamp;
					scope.show('#existing-sleep-data-point', this);
				} else if (series == 'social') {
					scope.objectiveDeleteDate = datum.timestamp;
					scope.show('#existing-social-data-point', this);
				} else {
					scope.objectiveDeleteDate = datum.timestamp;
					scope.show('#delete-objective-data-point', this);
				}
				scope.$digest(); // We're coming in from D3....
			};

			showAddPopup = function(data) {
				Tooltip.clear();
				scope.date = data.timestamp;
				scope.show('#add-objective-data-point', this);
				scope.$digest();
			}

			/**
			 * Redraw the dynamic bits of the chart
			 */
			var updateChart = function() {
				var label = scope.objectiveSelection().name;
				if (!GraphLayout.isMobile()) ' (' + scope.objectiveSelection().units + ')';
				updateLabel(label);
				updateGraph(scope.objectiveData, scope.periodStart(), scope.periodEnd());
			};

			// Initialise, then watch the scope for changes
			initChart(element.get(0));
			scope.$watch('objectiveData', updateChart);
			ResizeService.addListener(function() {
				svg.remove();
				initChart(element.get(0));
				updateChart();
			});
		}
	};
}]);

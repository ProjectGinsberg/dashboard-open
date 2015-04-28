 angular.module('gb.thisWeek')
.directive('wellbeingChart',['WellbeingService',
  function(WellbeingService) {
  	var wellbeingChart = function(data,element) {
  		var impl = function() {};

  		var width = 100;
  		var midPoint = width / 2;
  		var height = 400;
  		var maxRadius = width/2;
  		var radiusScale = d3.scale.linear()
  							.range([5,maxRadius])
  							.domain([0,7]);

      var colourScale = d3.scale.ordinal()
                .range(['#C58077','#C59177','#C5B277','#A9C577','#77C59C'])
                .domain([1,2,3,4,5]);

      var scoreOrderScale = d3.scale.linear()
                .range([5,1])
                .domain([1,5]);
		  var svg;

  		impl.setupChart = function() {
  			svg = d3.select('#wellbeingChart'+ data.id).append('svg')
  										 .attr('width', width)
  										 .attr('height', height-50);

  			// initially create the chart to have circles
  			// where the count is zero, so that we can animate up from that
  			// once we get the data in
        var scores = data.scores;
  			var circles = svg.selectAll('circle').data(scores,
                                                   function(d) { return d.score});

  			var enter = circles.enter();
  			enter.append('circle')
  				 .attr('r',function(d) {
  				 	return 5;
  				 })
  				 .attr('cx',function(d) {
  				 	return midPoint;
  				 })
  				 .attr('cy',function(d) {
  				  return scoreOrderScale(d.score) * (height / 7) + 10;
  				 })
           .attr('fill','white')
           .attr('opacity',0.75)
           .attr('stroke','grey')
           .attr('stroke-width','1px')
           .attr('stroke-opacity',0.75)
           .on('mouseover',function(d) {
              //d3.select(this).attr('stroke-width','3px');
           }).on('mouseout',function(d) {
              //d3.select(this).attr('stroke-width','1px');
           });
  		};
      impl.updateChart = function(data) {
          var circles = svg.selectAll("circle").data(data.scores, function(d){ return d.score})
          circles.exit().remove();

          var update = circles.transition();
          update.attr('r',function(d) {
              if (d.count === 0) return 5;

              return radiusScale(d.count);
           })
          .attr('fill',function(d) {
            if (d.count === 0) return 'white';
            else return colourScale(d.score);
          })
           .attr('opacity',1)
           .attr('stroke','grey')
           .attr('stroke-width',function(d) {
               if (d.count == 0) return '1px';
               return '0px';
           })
           .attr('stroke-opacity',0.75);
      };
  		return impl;
  	};

    return {
      restrict: 'E',
      link: function(scope, element, attrs) {
        setTimeout(function() {
          var chart = new wellbeingChart(scope.wellbeingScore,element);
          chart.setupChart();
          var wellbeingId = scope.wellbeingScore.id;
          scope.$watch('wellbeingScore',function(newVal)
          {
              chart.updateChart(scope.wellbeingScore);
          },true);
          scope.$watch('ThisWeekPeriodSelection.getPeriod()',function(newVal)
          {
              WellbeingService.getWellbeingScoreForId(newVal.start,
                  newVal.end,
                  wellbeingId,function(data) {
                      scope.wellbeingScore.scores = data.scores;
                      //chart.updateChart(scope.wellbeingScore);
                  });
          },true);
        },500);
      }
    };
}]);

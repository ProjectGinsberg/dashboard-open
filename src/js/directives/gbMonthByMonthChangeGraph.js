'use strict';
directives.directive('gbMonthByMonthChangeGraph', ["$log", "$filter", function($log, $filter) {

  var graph = {
    padding: {
      top: 100,
      right: 0,
      bottom: 100,
      left: 0
    }
  }

  graph.width = d3.select("gb-month-by-month-change-graph").node().parentNode.clientWidth;
  graph.height = 250

  function setUpGraph(){
    // Initialisation guard...
    if(!d3.select("gb-month-by-month-change-graph svg").empty() && graph.svg)
      return;

    // update graph object
    graph.svg = d3.select("gb-month-by-month-change-graph").append("svg")
      .attr("viewBox", "0 0 " + graph.width + " " + graph.height)
      .attr("height", graph.height)
      .attr("width", graph.width)
      .attr("preserveAspectRatio", "xMidYMid meet")

    graph.xScale = d3.scale.linear()
      .range([graph.padding.left, (graph.width -  graph.padding.right) ]);

    graph.yScale = d3.scale.linear()
      .range([(graph.height - graph.padding.bottom), graph.padding.top]);

  }
  // do initial graph set up (before data loads)
  // this leaves open the posiblity of animating in the data
  setUpGraph();

  function updateGraph(visibleMetric,data){
    if(!data || !data.data){ return; }
    var data = data.data;
    // make sure graph is set up
    setUpGraph();

    var last_sleep;
    $log.log(data);
    _.each(data, function(d,i){
      d.position = i;
      d.date = moment(d.t).startOf("day").toDate();
      d.total_sleep = d.v;
      d.difference_to_last = d.total_sleep - last_sleep;
      last_sleep = d.total_sleep;
    });

    // delete the first element (only needed it for the difference_to_last)
    data.shift();

    $log.log(data);

    //hack to get left and right padding
    var extent = _.map(data, function(d,i){ return d.position })
    extent.unshift(0.5);
    extent.push(data.length+0.5);

    graph.xScale.domain(d3.extent(extent));
    graph.yScale.domain(d3.extent(_.map(data, function(d){ return d.total_sleep;})));

    //Xaxis
    graph.svg.selectAll('.x-axis')
      .data(data)
      .enter()
      .append("line")
      .attr("class", "x-axis")
      .style('fill', 'none')
      .style('stroke', '#FFFFFF')
      .style('stroke-width', '3')

    graph.svg.selectAll('.x-axis')
      .data(data)
      .attr("y1", 0)
      .attr("y2", graph.height)
      .attr("x1", function(d) { return graph.xScale(d.position+0.5); })
      .attr("x2", function(d) { return graph.xScale(d.position+0.5); })

    var line = d3.svg.line()
      .x(function(d) { return graph.xScale(d.position); })
      .y(function(d) { return graph.yScale(d.total_sleep); });

    graph.svg.append('path')
      .attr('d', line(data))
      .style('fill', 'none')
      .style('stroke', '#bad982')
      .style('stroke-width', '4')

    graph.svg.selectAll('.text-avg')
      .data(data)
      .enter()
      .append('text')
      .attr("y", "65")
      .style("font-size", "14px")
      .style("font-weight", "bold")
      .style("fill", "#636363")
      .attr("text-anchor", "middle")
      .attr("class", "text-avg")

    graph.svg.selectAll('.text-avg')
      .data(data)
      //.transition().ease(easing).duration(animationDuration / 2)
      .attr("x", function(d) { return graph.xScale(d.position); })
      .text(function(d) {
        return $filter('formatMetricToHuman')(d.total_sleep,visibleMetric);
      });

    graph.svg.selectAll('.text-date')
      .data(data)
      .enter()
      .append('text')
      .attr("y", "45")
      .style("font-size", "12px")
      .style("font-style", "italic")
      .style("fill", "#636363")
      .attr("text-anchor", "middle")
      .attr("class", "text-date")

    graph.svg.selectAll('.text-date')
      .data(data)
      //.transition().ease(easing).duration(animationDuration / 2)
      .attr("x", function(d) { return graph.xScale(d.position); })
      .text(function(d) {
        return moment(d.date).format("MMM YYYY")
      });

    graph.svg.selectAll('circle')
      .data(data)
      .enter()
      .append('circle')
      .attr('class', 'point')
      .style('fill', function(d){
        if(d.difference_to_last < 0) return '#EC7E9E';
        return "#5CB6BF";
      })
      .style('stroke', '#EEE')
      .style('stroke-width', '2')
      .attr('r', 6)

    graph.svg.selectAll('circle')
      .data(data)
      .attr("cx", function (d) { return graph.xScale(d.position); } )
      .attr("cy", function (d) { return graph.yScale(d.total_sleep); } )

   var bottom_stat_group = graph.svg.selectAll('.bottom')
      .data(data)
      .enter()
      .append('g')
      .attr("class", "bottom")

    bottom_stat_group.data(data)
      .attr("transform", function(d) { return "translate("+ graph.xScale(d.position) +","+(graph.height - 45)+")"; })

    bottom_stat_group.data(data)
      .append('text')
      .attr("x", 15)
      .style("font-size", "16px")
      .style("font-weight", "bold")
      .style("fill", function(d){
        if(d.difference_to_last < 0) return '#EC7E9E';
        return "#5CB6BF";
      })
      .attr("text-anchor", "middle")
      .attr("class", "text-diff")

    graph.svg.selectAll('.text-diff')
      .data(data)
      .text(function(d) {
        var num = Math.abs(Math.floor(d.difference_to_last));
        var sign = d.difference_to_last >= 0 ? "+" : "-";
        return sign + num;
      })

    bottom_stat_group.data(data)
      .append('text')
      .attr("y", 15)
      .attr("x", 15)
      .style("font-size", "12px")
      .style("font-style", "italic")
      .style("fill", "#636363")
      .attr("text-anchor", "middle")
      .attr("class", "text-units")

    graph.svg.selectAll('.text-units')
      .data(data)
      .text(function() {
        if (visibleMetric === 'sleep')
          return 'mins';
        else if (visibleMetric === 'steps')
          return 'steps';
        else if (visibleMetric === 'nutrition')
          return 'calories';
      });

    bottom_stat_group.data(data)
      .append("image")
      .attr("xlink:href", function(d){
        return (d.difference_to_last >= 0) ? "/images/icons/blue_up_arrow.svg" : "/images/icons/pink_down_arrow.svg";
      })
      .attr("y", -15)
      .attr("x", -35)
      .attr("height", 30)
      .attr("width", 30)
  }

	return {
    restrict: 'E', // uses directive as tag: <gb-month-by-month-change-graph>
    link: function (scope, element, attrs) {
      scope.$watch('monthlyAverages', function(data){
        graph.svg.remove();
        setUpGraph();
        updateGraph(scope.visibleMetric,data);
      });
    }
  }

}]);

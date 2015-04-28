'use strict';
directives.directive('gbSparkline', ["$log", "$filter", function($log, $filter) {

  var graph = {
    padding: {
      top: 10,
      right: 10,
      bottom: 10,
      left: 10
    }
  }



  function setUpGraph(element){
    graph.width = element[0].clientWidth;//d3.select("gb-sparkline").node().parentNode.clientWidth;
    graph.height = 35;

    // update graph object
    graph.svg = d3.select(element.find('svg')[0])//d3.select("gb-sparkline").append("svg")
      .attr("viewBox", "0 0 " + graph.width + " " + graph.height)
      .attr("height", graph.height)
      .attr("width", graph.width)
      .attr("preserveAspectRatio", "xMidYMid meet")

    graph.xScale = d3.time.scale()
      .range([graph.padding.left, (graph.width -  graph.padding.right) ]);

    graph.yScale = d3.scale.linear()
      .range([(graph.height - graph.padding.bottom), graph.padding.top]);

  }
  // do initial graph set up (before data loads)
  // this leaves open the posiblity of animating in the data
//  setUpGraph();

  function updateGraph(data,element){
    if(!data || !data.data){ return; }

    var data = data.data;
    // make sure graph is set up
    setUpGraph(element);

    var last_sleep;
    var dateArray = [];
    var valueArray = [];

    data = _.map(data, function(d){
      var t = moment(d.t).startOf("day").toDate();
      dateArray.push(t);
      valueArray.push(d.v);
      return {
       date: moment(d.t).startOf("day").toDate(),
       total_sleep: d.v
       }
    });

    graph.xScale.domain(d3.extent(dateArray));
    graph.yScale.domain(d3.extent(valueArray));

    var line = d3.svg.line()
      .x(function(d) { return graph.xScale(d.date); })
      .y(function(d) { return graph.yScale(d.total_sleep); })
      .interpolate('basis')


    var path = graph.svg.selectAll('path').data(data,function(d) {
        return true;
    });
        path.enter().append('path')
          .attr('class', 'line');
        path.transition()
          .attr('d', line(data));
  }

	return {
        template:'<svg></svg>',
        restrict: 'E', // uses directive as tag: <gb-sparkline>
        scope: {
            monthlyAverages: '=ds'
        },
        link: function (scope, element, attrs) {
          scope.$watch('monthlyAverages', function(data){
              if(angular.isDefined(data) == false) return;

              updateGraph(data,element);
          });
        }
  }

}]);

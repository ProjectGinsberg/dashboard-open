'use strict';
directives.directive('gbTagsVsQualityOfSleepGraph', ["$log", function($log) {

  var graph = {
    padding: {
      top: 50,
      right: 0,
      bottom: 50,
      left: 10
    },
    pieRadius: 100
  }

  graph.width = 640;
  graph.height = 300;

  function setUpGraph(){
    // Initialisation guard...
    if(!d3.select("gb-tags-vs-quality-of-sleep-graph svg").empty() && graph.svg) return;

    // update graph object
    d3.select("gb-tags-vs-quality-of-sleep-graph").append("svg")
      .attr("viewBox", "0 0 " + graph.width + " " + graph.height)
      .attr("height", graph.height)
      .attr("width", graph.width)
      .attr("preserveAspectRatio", "xMidYMid meet");

    d3.select("gb-tags-vs-quality-of-sleep-graph svg").append('defs')
      .append('pattern')
      .attr('patternUnits', "userSpaceOnUse")
      .attr('width', "5")
      .attr('height', "5")
      .attr('id', 'blankpattern')
      .append('image')
      .attr('x', "0")
      .attr('y', "0")
      .attr('width', "5")
      .attr('height', "5")
      .attr('xlink:href', "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAALElEQVQIW2O8ePHifxUVFQZkwPj169f/d+7cYUCWAAuCVCFLwAWRJVAEYRIAcYIe8MMvLOwAAAAASUVORK5CYII=")

    graph.svg = d3.select("gb-tags-vs-quality-of-sleep-graph svg");

    graph.goodSleepGroup = graph.svg.append("g")
      .attr("class", "good-quality-sleep")
      .attr("transform", "translate(" + (graph.width - graph.padding.right - graph.pieRadius - 60) + ", " +(graph.height/2 - 10)+ ")")

    graph.goodSleepGroup.append("text")
      .text("More than average")
      .attr("text-anchor", "middle")
      .attr("class", "tag-graph-label")
      .attr("transform", "translate(0, "+ (graph.pieRadius + 20) + ")")

    graph.badSleepGroup = graph.svg.append("g")
      .attr("class", "bad-quality-sleep")
      .attr("transform", "translate(" + (graph.padding.left + graph.pieRadius + 60) + ", " +(graph.height/2 - 10) + ")")

    graph.badSleepGroup.append("text")
      .text("Less than average")
      .attr("text-anchor", "middle")
      .attr("class", "tag-graph-label")
      .attr("transform", "translate(0, "+ (graph.pieRadius + 20) + ")")

    graph.pinkScale = d3.scale.ordinal()
      .range(["#EC7E9E", "#EE91AC", "#F1A4BB", "#F4B7C8", "#F8CBD8"])
      .domain(d3.range(0,5));

    graph.blueScale = d3.scale.ordinal()
      .range(["#54B7BE", "#6EC2C7", "#88CCD1", "#A3D8DB", "#BCE2E4"])
      .domain(d3.range(0,5));

    graph.segment = d3.svg.arc()
        .outerRadius(graph.pieRadius);

    graph.pieData = d3.layout.pie()
        .sort(null)
        .value(function(d) { return d[1]; })
  }
  // do initial graph set up (before data loads)
  // this leaves open the posiblity of animating in the data
  setUpGraph();

  function updateGraph(goodSleepTags, badSleepTags){
    if(!badSleepTags || !goodSleepTags){ return; }
    // expects badSleepTags and goodSleepTags to be an array of arrays
    // with the tag and tag_count: [["tag1", 3], ["tag2", 1]]
    // this array still needs preprocessing

    badSleepTags.sort(function(a, b) {return b[1] - a[1]})
    var memo = 0;
    var badSleepData = [];
    _.each(badSleepTags, function(d,i){
      if(i >= 5){
        memo += d[1]
      }else{
        badSleepData.push([d[0], d[1], i]);
      }
    });
    if(memo > 0)
      badSleepData.push(["_AggregatedTags_", memo, null]);
      badSleepData.sort(function(a, b) {return b[1] - a[1]})
    goodSleepTags.sort(function(a, b) {return b[1] - a[1]})
    var memo = 0;
    var goodSleepData = [];
    _.each(goodSleepTags, function(d,i){
      if(i >= 5){
        memo += d[1]
      }else{
        goodSleepData.push([d[0], d[1], i]);
      }
    });
    if(memo > 0)
      goodSleepData.push(["_AggregatedTags_", memo, null]);
      goodSleepData.sort(function(a, b) {return b[1] - a[1]})


    // make sure graph is set up
    setUpGraph();

    var badArcs = graph.badSleepGroup.selectAll(".bad-segment")
      .data(graph.pieData(badSleepData))
      .enter()
      .append("g")
      .attr("class", "bad-segment")

    var goodArcs = graph.goodSleepGroup.selectAll(".good-segment")
      .data(graph.pieData(goodSleepData))
      .enter()
      .append("g")
      .attr("class", "good-segment")

    badArcs.append("path")
      .attr("class", function(d){
        if(d.data[0] == "_AggregatedTags_"){
          return "other";
        }
      })
      .attr("fill", function(d, i) {
        return graph.pinkScale(d.data[2]);
      })
      .attr("d", graph.segment);


    goodArcs.append("path")
      .attr("class", function(d){
        if(d.data[0] == "_AggregatedTags_"){
          return "other";
        }
      })
      .attr("fill", function(d, i) {
        return graph.blueScale(d.data[2]);
      })
      .attr("d", graph.segment);

  }

	return {
    restrict: 'E', // uses directive as tag: <gb-tags-vs-quality-of-sleep-graph>
    link: function (scope, element, attrs) {
      scope.$watch('tagsWithGoodSleepQuality', function(data){
        updateGraph(data, scope.tagsWithBadSleepQuality);
      });
      scope.$watch('tagsWithBadSleepQuality', function(data){
        updateGraph(scope.tagsWithGoodSleepQuality, data);
      });
    }
  }

}]);

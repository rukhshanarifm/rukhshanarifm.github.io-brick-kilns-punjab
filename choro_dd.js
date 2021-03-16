var dropdown_options = [ { value: "pop",
text: "Population in 2017"}, 
{value: "wage", text: "Average wage"},
{},
{},
{}]


// initial dataset on load
var selected_dataset = "empl13";

var w = 700,
  h = 650;

var svg = d3.select("#block")
          .append("svg")
          .attr("height", h)
          .attr("width", w);

var projection = d3.geoMercator()
                 .center([-76.6180827, 39.323953])
                 .scale([140000])
                 .translate([270, 165]);

var path = d3.geoPath()
           .projection(projection);

// second of two scales for linear fill 
var norm_fill = d3.scaleLinear()
                .range([0,1]);

var geojson = "https://gist.githubusercontent.com/rukhshanarifm/8f1f04b966db5d9b0668bdbeb44b597e/raw/2f3d12a456db778366cc20046530661385986034/dataviz_proj_final.geojson";

d3.json(geojson, function(json) {
    console.log(json);
  plot = svg.selectAll("path")
            .data(json.features)
            .enter()
            .append("path")
            .attr("d", path)
            .attr("stroke", "#808080")
            .attr("fill", "#b3b3b3")
            .call(updateFill, selected_dataset)
            .on("mouseover", function(d) { displayData(d); })
            .on("mouseout", hideData);
});

import {select} from 'd3-selection';
import {transition} from 'd3-transition';

let countyURL = 'https://gist.githubusercontent.com/saadkhalid90/96621ed3513edce398105ad58917a003/raw/e0b29f46a0a9e7a6c9016ce9b9ff88ebfcda257e/Punjab_dist.topojson'
let educationURL = 'https://gist.githubusercontent.com/rukhshanarifm/57a73479817642481f911b0fd8d7ac66/raw/aaa27090a056c406738f1432abf1babbd6de7e60/csvjson%2520(2).json'
let csv = 'https://gist.githubusercontent.com/saadkhalid90/96621ed3513edce398105ad58917a003/raw/e0b29f46a0a9e7a6c9016ce9b9ff88ebfcda257e/data_dist.csv'
let countyData

var dropdown_options = [ { value: "population",
text: "Population in 2017"}, 
{value: "average_daily_wage", text: "Average wage"},
{value: "sum_of_bricks_produced", text: "Total Bricks Produced"}]

let canvas = d3.select('#canvas');
let tooltip = d3.select('#tooltip');


let mesh
let projection

let width = 600;
let height = 400;
    

d3.select("#dropdown")
.selectAll("option")
.data(dropdown_options)
.enter()
.append("option")
.attr("value", function(option) {return option.value;})
.text(function(option) {return option.text;});


var getcolorScale = function(text, res) {
    if (text === "population") {

        if (res == "") {
            return 'white'
        }
        if(res <= 1500000){
            return 'tomato'
        }else if(res<= 3500000){
            return 'orange'
        }else if(res <= 5500000){
            return 'lightgreen'
        }else if (res <= 8000000){
            return 'green'
        }else if (res <= 13500000){
            return 'blue'
        }
        
    }

    else if (text == "average_daily_wage") {
        if (res == "") {
            return 'white'
        }
        if(res <= 150){
            return 'tomato'
        }else if(res<= 350){
            return 'orange'
        }else if(res <= 550){
            return 'lightgreen'
        }else if (res <= 800){
            return 'green'
        }else if (res <= 1350){
            return 'blue'
        }

    }

    else if (text == "sum_of_bricks_produced"){
        if (res == "") {
            return 'white'
        }
        if(res <= 150000000){
            return 'tomato'
        }else if(res<= 350000000){
            return 'orange'
        }else if(res <= 550000000){
            return 'lightgreen'
        }else if (res <= 800000000){
            return 'green'
        }else if (res <= 1350000000){
            return 'blue'
        }
    }

    return colorScale
}

let text = 'population';

var margin = {top: 35, right: 35, bottom: 35, left: 35},
    w = 300 - margin.left - margin.right,
    h = 225 - margin.top - margin.bottom;

projection = d3.geoMercator()
    .center([68.38, 31.5])
    .scale([150 * 25]);

var scatter = d3.select("#scatter")
  .append("svg")
    .attr("width", w + margin.left + margin.right)
    .attr("height", h + margin.top + margin.bottom)
  .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

d3.json(countyURL).then(
    (data, error) => {
        if(error){
            console.log(log)
        }else{
            countyData = topojson.feature(data, data.objects.Punjab_dist_corr).features
            mesh = topojson.mesh(data, data.objects.Punjab_dist_corr); 

            d3.json(educationURL).then(
                (data, error) => {
                    if(error){
                        console.log(error)
                    }else{
                        const educationData = data
                        canvas.selectAll('path').data(countyData).enter().append('path')
                            .attr('d', d3.geoPath().projection(projection))
                            .attr('class', 'county').style("stroke", "black")
                            .style("stroke-width", .5)
                            .attr('data-dist', (countyDataItem) => {
                                return countyDataItem.properties['DISTRICT']
                            })
                            .attr('fill', (countyDataItem) => {
                                let id = countyDataItem.properties['DISTRICT']
                                let county = educationData.find((item) => {
                                    return item['Name'] === id
                                })

                                let res= county['population'];
                                let text = 'population'
                                return getcolorScale(text, res) 

                            })
                            .attr('data-pop', (countyDataItem) => {
                                let id = countyDataItem.properties['DISTRICT']
                                let county = educationData.find((item) => {
                                    return item['Name'] === id
                                })
                                let percentage = county['population']
                                console.log(percentage);
                                return percentage
                        })
                        .on('mouseover', (countyDataItem)=> {
                            tooltip.transition()
                                .style('visibility', 'visible')

                            let id = countyDataItem.properties['DISTRICT']
                            let county = educationData.find((item) => {
                                return item['Name'] === id
                            })
                            tooltip.text(county['Name'] + ' : ' + county['population'])
                            tooltip.attr('data-pop', county['population'])
                        })
                        .on('mouseout', (countyDataItem) => {
                            tooltip.transition()
                                .style('visibility', 'hidden')
                        })
                        //look into render Chart
                        function renderChart() {
                            const t = transition().duration(300);
                            let map = canvas.selectAll('path').data(countyData)
                            
                            map.enter().append('path')
                            .attr('d', d3.geoPath().projection(projection))
                            .attr('class', 'county').style("stroke", "black")
                            .style("stroke-width", .5)
                            .attr('data-dist', (countyDataItem) => {
                                return countyDataItem.properties['DISTRICT']
                            }).on('mouseover', (countyDataItem)=> {
                                tooltip.transition()
                                    .style('visibility', 'visible')
    
                                let id = countyDataItem.properties['DISTRICT']
                                let county = educationData.find((item) => {
                                    return item['Name'] === id
                                })
                                tooltip.text(county['Name'] + ' : ' + county[text])
                                tooltip.attr('data-pop', county[text])
                            })
                            .on('mouseout', (countyDataItem) => {
                                tooltip.transition()
                                    .style('visibility', 'hidden')
                            }).attr("fill", "white").transition().duration(500)
                            
                            .attr('fill', (countyDataItem) => {
                                let id = countyDataItem.properties['DISTRICT']
                                let county = educationData.find((item) => {
                                    return item['Name'] === id
                                })

                                let res = county[text];
                                return getcolorScale(text, res) 

                            })
                            .attr('data-pop', (countyDataItem) => {
                                let id = countyDataItem.properties['DISTRICT']
                                let county = educationData.find((item) => {
                                    return item['Name'] === id
                                })
                                let percentage = county[text]
                                console.log(percentage);
                                return percentage                                
                        })

                    }

                    var dropDown = d3.select("#dropdown");
                    dropDown.on("change", function() {
                        text = document.getElementById("dropdown").value
                        console.log(text);
                        canvas.selectAll("path").remove();
                        renderChart();
                });
                let dataset=educationData;
                console.log(dataset);
                var xScale = d3.scaleLinear()
                .domain([0, d3.max(dataset, function(d){
                    return d['population']
                })])
                .range([0, w]);

                var yScale = d3.scaleLinear()
                .domain([0, d3.max(dataset, function(d){
                    return d['population'];
                })])
                .range([h, 0]);

                // Add X axis
                var x = d3.scaleLinear()
                .domain([0, d3.max(dataset, function(d){
                    return d['population']
                })]).range([ 0, width ]);

                var xAxis = scatter.append("g")    

                .attr("transform", "translate(0," + height + ")")
                .call(d3.axisBottom(x));

                // Add Y axis
                var y = d3.scaleLinear()
                .domain([0, d3.max(dataset, function(d){
                    return d['population'];
                })]).range([ height, 0]);
                scatter.append("g")
                .call(d3.axisLeft(y));


                scatter.selectAll("circle")
                .data(dataset) // gets the data
                .enter()
                .append("circle") 
                .attr("cx", function(d){
                    return xScale(d['population']); // gives our x coordinate
                })
                .attr("cy", function(d){
                    return yScale(d['population']); // gives our y coordinate
                })
                .attr("r", function(d){
                    return 4; // sets the radius of each circle
                })
                .style("fill", "#69b3a2" )
                .attr("opacity", 1);
            
                
            }
                })
            }
        }
);

//ADD A BAR CHART 
// ADD A FUNCTION TO UPDATE THE BAR GRAPH BASED ON THE SELECTED DISTRICT
// SEPARATE DATASET WILL USE THIS
// ADD A BUTTON TO RESET STUFF
// MAKE IT NICE
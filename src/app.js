
import {select} from 'd3-selection';
import {transition} from 'd3-transition';
import './main.css';

let countyURL = 'https://gist.githubusercontent.com/saadkhalid90/96621ed3513edce398105ad58917a003/raw/e0b29f46a0a9e7a6c9016ce9b9ff88ebfcda257e/Punjab_dist.topojson'
let educationURL = 'https://gist.githubusercontent.com/rukhshanarifm/57a73479817642481f911b0fd8d7ac66/raw/aaa27090a056c406738f1432abf1babbd6de7e60/csvjson%2520(2).json'
let tehsilURL = 'https://gist.githubusercontent.com/rukhshanarifm/3f1bcea01c9bea09bbdc13e09d250aea/raw/b0cc9b71081c6679223d14740c128ac52f621149/csvjson%2520(5).json'

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

var svg = d3.select("#canvas");

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
            'white'
        }
        if(res <= 1500000){
            return d3.schemePuBuGn[9][2]
        }else if(res<= 3500000){
            return d3.schemePuBuGn[9][3]
        }else if(res <= 5500000){
            return d3.schemePuBuGn[9][4]
        }else if (res <= 8000000){
            return d3.schemePuBuGn[9][5]
        }else if (res <= 13500000){
            return d3.schemePuBuGn[9][7]
        }
        
    }

    else if (text == "average_daily_wage") {
        if (res == "") {
            return 'white'
        }
        if(res <= 150){
            return d3.schemePuBuGn[9][2]
        }else if(res<= 350){
            return d3.schemePuBuGn[9][3]
        }else if(res <= 550){
            return d3.schemePuBuGn[9][4]
        }else if (res <= 800){
            return d3.schemePuBuGn[9][5]
        }else if (res <= 1350){
            return d3.schemePuBuGn[9][7]
        }

    }

    else if (text == "sum_of_bricks_produced"){
        if (res == "") {
            return 'white'
        }
        if(res <= 150000000){
            return d3.schemePuBuGn[9][2]
        }else if(res<= 350000000){
            return d3.schemePuBuGn[9][3]
        }else if(res <= 550000000){
            return d3.schemePuBuGn[9][4]
        }else if (res <= 800000000){
            return d3.schemePuBuGn[9][5]
        }else if (res <= 1350000000){
            return d3.schemePuBuGn[9][6]
        }
    }

    return colorScale
}

function filterDistrict(data, dist) {
    return data.filter(d=>d['db_district'] === dist);
  }
  
function filterDistrict_two(data, dist) {
   return data.filter(d=>d['Name'] === dist);
} 

function addLegend(variable) {
    console.log(variable);

    if (variable === "population") {
        var dom = [1.5, 3.5, 5.5, 8, 13.5]
        var ran = [d3.schemePuBuGn[9][1],
        d3.schemePuBuGn[9][2],
        d3.schemePuBuGn[9][3],
        d3.schemePuBuGn[9][5],
        d3.schemePuBuGn[9][7]]
        var colorScale = d3.scaleLinear()
        .domain(dom)
        .range(ran);
  
    }

    if (variable === "average_daily_wage") {
        
        var dom = ["Below Min Wage", "Equals or Above"]
        let ran = [d3.schemePuBuGn[9][4], d3.schemePuBuGn[9][5]]
        var colorScale = d3.scaleOrdinal()
        .domain(dom)
        .range(ran);

    }


    if (variable === "sum_of_bricks_produced") {
        var dom = [150, 350, 550, 800, 1350]
        var ran = [d3.schemePuBuGn[9][1],
        d3.schemePuBuGn[9][2],
        d3.schemePuBuGn[9][3],
        d3.schemePuBuGn[9][5],
        d3.schemePuBuGn[9][7]]
        var colorScale = d3.scaleLinear()
        .domain(dom)
        .range(ran);
  
    }

    svg.append("g")
      .attr("class", "legendLog")
      .attr("transform", "translate(20,80)");

    var logLegend = d3.legendColor()
        .scale(colorScale);
    
    svg.select(".legendLog")
      .call(logLegend);
}

let text = 'population';

var margin = {top: 35, right: 35, bottom: 35, left: 35},
    w = 500,
    h = 625;

projection = d3.geoMercator()
    //right/left, up/down
    .center([77, 31.2])
    .scale([175 * 20]);



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
                        d3.json(tehsilURL).then(
                            (data, error) => {
                                if(error){
                                    console.log(error)} 
                                    else{

                                        let tehsilData = data;
                                        canvas.select("#legendLog").remove();
                                        addLegend('population');
                                        console.log(tehsilData);
                                        canvas.selectAll('path').data(countyData).enter().append('path')
                                            .attr('d', d3.geoPath().projection(projection))
                                            .attr('class', 'county').style("stroke", "white")
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
                                        }).attr("transform", "scale(1.5)")
                                        .on('mouseover', (countyDataItem)=> {
                                            tooltip.transition()
                                                .style('visibility', 'visible')
                                            let id = countyDataItem.properties['DISTRICT']
                                            let county = educationData.find((item) => {
                                                return item['Name'] === id
                                            })
                                            d3.selectAll("#scatter").remove();
                                            d3.selectAll("#scatter2").remove();
                                            addToolTip(tooltip, county);

                                            console.log(county['Name']);
                                            var xScale = d3.scaleBand()
                                            .range([ 0, width ])
                                            .domain(data.map(function(d) { return d['Name']; }))
                                            .padding(0.2);
    
                                            var yScale = d3.scaleBand()
                                            .range([ 0, width ])
                                            .domain(data.map(function(d) { return d['kiln_distance_to_nearby_school']; }))
                                            .padding(0.2);
                                            
                                            let subdata = filterDistrict_two(educationData, county['Name'])

                                            let filteredData = filterDistrict(tehsilData, county['Name']);
                                            var scatter = d3.select("#scatters")
                                            .append("svg")
                                            .attr('id', 'scatter')
                                            .append("g")
                                            .attr("transform",
                                            "translate(" + margin.left + "," + margin.top + ")");
                                            drawBar(filteredData, 'db_tehsil', 'perc_nonzero_wage', scatter, 'nonzero_wage')

                                            let filteredData2 = filterDistrict(tehsilData, county['Name']);
                                            var scatter2 = d3.select("#scatters")
                                            .append("svg")
                                            .attr('id', 'scatter2')
                                            .append("g")
                                            .attr("transform",
                                            "translate(" + margin.left + "," + margin.top + ")");
                                            drawBar(filteredData2, 'db_tehsil', 'age', scatter2, 'age')

                                        }).style("cursor", "pointer")

                                        .on('click', (countyDataItem) => {
                                            tooltip.transition()
                                            .style('visibility', 'visible')
                                            let id = countyDataItem.properties['DISTRICT']
                                            let county = educationData.find((item) => {
                                            return item['Name'] === id
                                        })


                                            d3.selectAll("#scatter").remove();
                                            d3.selectAll("#scatter2").remove();
                                            
                                            console.log(county['Name']);
                                            var xScale = d3.scaleBand()
                                            .range([ 0, width ])
                                            .domain(data.map(function(d) { return d['Name']; }))
                                            .padding(0.2);
    
                                            var yScale = d3.scaleBand()
                                            .range([ 0, width ])
                                            .domain(data.map(function(d) { return d['kiln_distance_to_nearby_school']; }))
                                            .padding(0.2);
                                            
                                            let subdata = filterDistrict_two(educationData, county['Name'])
                                            //drawBubble(subdata);

                                            let filteredData = filterDistrict(tehsilData, county['Name']);
                                            var scatter = d3.select("#scatters")
                                            .append("svg")
                                            .attr('id', 'scatter')
                                            .append("g")
                                            .attr("transform",
                                            "translate(" + margin.left + "," + margin.top + ")");
                                            drawBar(filteredData, 'db_tehsil', 'perc_nonzero_wage', scatter, 'nonzero_wage')

                                            let filteredData2 = filterDistrict(tehsilData, county['Name']);
                                            var scatter2 = d3.select("#scatters")
                                            .append("svg")
                                            .attr('id', 'scatter2')
                                            .append("g")
                                            .attr("transform",
                                            "translate(" + margin.left + "," + margin.top + ")");
                                            drawBar(filteredData2, 'db_tehsil', 'age', scatter2, 'age')

                                        })
                                        .on('mouseout', (countyDataItem) => {
                                            
                                            let id = countyDataItem.properties['DISTRICT']
                                            let county = educationData.find((item) => {
                                            return item['Name'] === id
                                        })

                                            d3.selectAll("#scatter").remove();
                                            d3.selectAll("#scatter2").remove();

                                            console.log(county['Name']);
                                            var xScale = d3.scaleBand()
                                            .range([ 0, width ])
                                            .domain(data.map(function(d) { return d['Name']; }))
                                            .padding(0.2);
    
                                            var yScale = d3.scaleBand()
                                            .range([ 0, width ])
                                            .domain(data.map(function(d) { return d['kiln_distance_to_nearby_school']; }))
                                            .padding(0.2);
                                            
                                            let subdata = filterDistrict_two(educationData, county['Name'])
                                            //drawBubble(subdata);

                                            let filteredData = filterDistrict(tehsilData, county['Name']);
                                            var scatter = d3.select("#scatters")
                                            .append("svg")
                                            .attr('id', 'scatter')
                                            .append("g")
                                            .attr("transform",
                                            "translate(" + margin.left + "," + margin.top + ")");
                                            drawBar(filteredData, 'db_tehsil', 'perc_nonzero_wage', scatter, 'nonzero_wage')

                                            let filteredData2 = filterDistrict(tehsilData, county['Name']);
                                            var scatter2 = d3.select("#scatters")
                                            .append("svg")
                                            .attr('id', 'scatter2')
                                            .append("g")
                                            .attr("transform",
                                            "translate(" + margin.left + "," + margin.top + ")");
                                            drawBar(filteredData2, 'db_tehsil', 'age', scatter2, true)
                                            
                                            var thresholdScale = d3.scaleThreshold()
                                            .domain([ 0, 1000, 2500, 5000, 10000 ])
                                            .range(d3.range(6)
                                            .map(function(i) { return "q" + i + "-9"}));
                                          
                                            var log = d3.scaleLog()
                                            .domain([ 0.1, 100, 1000 ])
                                            .range(["rgb(46, 73, 123)", "rgb(71, 187, 94)"]);
                                        

                                        addToolTip(tooltip, county);
                                        }) 
                                        

                                        //look into render Chart
                                        function renderChart() {

                                            //d3.selectAll("#circle").remove();
                                            //d3.selectAll("#scatter").remove();
                                            //d3.selectAll("#scatter2").remove();
                                            const t = transition().duration(300);
                                            let map = canvas.selectAll('path').data(countyData)

                                            map.enter().append('path')
                                            .attr('d', d3.geoPath().projection(projection))
                                            .attr('class', 'county').style("stroke", "white")
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
                                        }).attr("transform", "scale(1.5)")
                                        .on('mouseover', (countyDataItem)=> {
                                            tooltip.transition()
                                                .style('visibility', 'visible')
                                            let id = countyDataItem.properties['DISTRICT']
                                            let county = educationData.find((item) => {
                                                return item['Name'] === id
                                            })
                                            d3.selectAll("#scatter").remove();
                                            d3.selectAll("#scatter2").remove();
                                            addToolTip(tooltip, county);

                                            console.log(county['Name']);
                                            var xScale = d3.scaleBand()
                                            .range([ 0, width ])
                                            .domain(data.map(function(d) { return d['Name']; }))
                                            .padding(0.2);
    
                                            var yScale = d3.scaleBand()
                                            .range([ 0, width ])
                                            .domain(data.map(function(d) { return d['kiln_distance_to_nearby_school']; }))
                                            .padding(0.2);
                                            
                                            let subdata = filterDistrict_two(educationData, county['Name'])

                                            let filteredData = filterDistrict(tehsilData, county['Name']);
                                            var scatter = d3.select("#scatters")
                                            .append("svg")
                                            .attr('id', 'scatter')
                                            .append("g")
                                            .attr("transform",
                                            "translate(" + margin.left + "," + margin.top + ")");
                                            drawBar(filteredData, 'db_tehsil', 'perc_nonzero_wage', scatter, 'nonzero_wage')

                                            let filteredData2 = filterDistrict(tehsilData, county['Name']);
                                            var scatter2 = d3.select("#scatters")
                                            .append("svg")
                                            .attr('id', 'scatter2')
                                            .append("g")
                                            .attr("transform",
                                            "translate(" + margin.left + "," + margin.top + ")");
                                            drawBar(filteredData2, 'db_tehsil', 'age', scatter2, 'age')

                                        }).style("cursor", "pointer")

                                        .on('click', (countyDataItem) => {
                                            tooltip.transition()
                                            .style('visibility', 'visible')
                                            let id = countyDataItem.properties['DISTRICT']
                                            let county = educationData.find((item) => {
                                            return item['Name'] === id
                                        })

                                            d3.selectAll("#scatter").remove();
                                            d3.selectAll("#scatter2").remove();
     
                                            console.log(county['Name']);
                                            var xScale = d3.scaleBand()
                                            .range([ 0, width ])
                                            .domain(data.map(function(d) { return d['Name']; }))
                                            .padding(0.2);
    
                                            var yScale = d3.scaleBand()
                                            .range([ 0, width ])
                                            .domain(data.map(function(d) { return d['kiln_distance_to_nearby_school']; }))
                                            .padding(0.2);
                                            
                                            let subdata = filterDistrict_two(educationData, county['Name'])
                                            //drawBubble(subdata);

                                            let filteredData = filterDistrict(tehsilData, county['Name']);
                                            var scatter = d3.select("#scatters")
                                            .append("svg")
                                            .attr('id', 'scatter')
                                            .append("g")
                                            .attr("transform",
                                            "translate(" + margin.left + "," + margin.top + ")");
                                            drawBar(filteredData, 'db_tehsil', 'perc_nonzero_wage', scatter, 'nonzero_wage')

                                            let filteredData2 = filterDistrict(tehsilData, county['Name']);
                                            var scatter2 = d3.select("#scatters")
                                            .append("svg")
                                            .attr('id', 'scatter2')
                                            .append("g")
                                            .attr("transform",
                                            "translate(" + margin.left + "," + margin.top + ")");
                                            drawBar(filteredData2, 'db_tehsil', 'age', scatter2, 'age')

                                        })
                                        .on('mouseout', (countyDataItem) => {
                                            
                                            let id = countyDataItem.properties['DISTRICT']
                                            let county = educationData.find((item) => {
                                            return item['Name'] === id
                                        })

                                            d3.selectAll("#scatter").remove();
                                            d3.selectAll("#scatter2").remove();

                                            console.log(county['Name']);
                                            

                                            let filteredData = filterDistrict(tehsilData, county['Name']);
                                            var scatter = d3.select("#scatters")
                                            .append("svg")
                                            .attr('id', 'scatter')
                                            .append("g")
                                            .attr("transform",
                                            "translate(" + margin.left + "," + margin.top + ")");
                                            drawBar(filteredData, 'db_tehsil', 'perc_nonzero_wage', scatter, 'nonzero_wage')

                                            let filteredData2 = filterDistrict(tehsilData, county['Name']);
                                            var scatter2 = d3.select("#scatters")
                                            .append("svg")
                                            .attr('id', 'scatter2')
                                            .append("g")
                                            .attr("transform",
                                            "translate(" + margin.left + "," + margin.top + ")");
                                            drawBar(filteredData2, 'db_tehsil', 'age', scatter2, 'age')


                                        addToolTip(tooltip, county);
                                        }) 

    
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
                                        canvas.selectAll(".legendLog").remove();
                                        canvas.selectAll("path").remove();
                                        renderChart();
                                        addLegend(text);
                                });

                            }
                        })}
                                })
            }
        }
);


function addToolTip(tooltip, county) {
    tooltip.html('<div class"style-me"><p>' 
    + "District: " + county['Name'] + "</p>" +
    '<table> <tr> <td> ' + 'Population (in millions): </td>' +
    '<td>' + county['population']/1000000 + ' million' + 

    '<tr> <td> ' + 'Average Distance to Closest School: </td>' +
    '<td>' + Math.round(county['kiln_distance_to_nearby_school'], 2) + ' km'+ 

    '<tr> <td> ' + 'Average Distance to Health Facilities: </td>' +
    '<td>' + Math.round(county['kiln_closest_basichealthunit'], 2) + ' km' + 

    '<tr> <td> ' + 'Average Minimum Wage </td>' +
    '<td>' + 'PKR ' + Math.round(county['average_daily_wage'], 2)  + 
    
    '</td> </tr> </div>')
    tooltip.attr('data-pop', county['population'])
}

function drawBar(data, xvar, yvar, svg_name, graph_name) {


    let sw = 160
    let sh = 160

    let dataset = data;

    // Add X axis
    var x = d3.scaleLinear()
    .domain([0, d3.max(dataset, function(d){
        return d[xvar]
    })]).range([ 0, sw ]);

    var x = d3.scaleBand()
    .range([ 0, width ])
    .domain(data.map(function(d) { return d[xvar]; }))
    .padding(0.2);


    svg_name.append("g")
    .attr("transform", "translate(0," + sh+ ")")
    .call(d3.axisBottom(x))
    .selectAll("text")
    .attr("transform", "translate(-10,0)rotate(-45)")
    .style("text-anchor", "end");


    var dom =  d3.max(dataset, function(d){
       return d[yvar]})

    var y = d3.scaleLinear()
    .domain([0,dom]).range([ sh, 0]);
    

    if (graph_name === "age") {
        var y = d3.scaleLinear()
        .domain([0,30]).range([ sh, 0]);
    } else if (graph_name === "nonzero_wage"){
        var y = d3.scaleLinear()
        .domain([0,5]).range([ sh, 0]);
    }

    svg_name.append("g")
    .call(d3.axisLeft(y)).attr("class", "left");

    if (transition===true) {
    svg_name.selectAll("circle")
    .data(dataset)
    .transition().duration(400)
    .attr("x", function(d){
        return x(d[xvar]); // gives our x coordinate
    }).attr("y", function(d){
        return y(d[yvar]); // gives our y coordinate
    }).attr("width", x.bandwidth())
    .attr("height", function(d) { return sh - y(d[yvar]); })
    .style("fill", "#69b3a2" ).attr("opacity", 4);
    }
    svg_name.selectAll("circle")
    .data(dataset) // gets the datas
    .enter()
    .append("rect") 
    .attr("x", function(d){
        return x(d[xvar]); // gives our x coordinate
    }).attr("y", function(d){
        return y(d[yvar]); // gives our y coordinate
    }).attr("width", x.bandwidth())
    .attr("height", function(d) { return sh - y(d[yvar]); })
    .style("fill", "#69b3a2" ).attr("opacity", 4);

}

//ADD A BAR CHART 
// ADD A FUNCTION TO UPDATE THE BAR GRAPH BASED ON THE SELECTED DISTRICT
// SEPARATE DATASET WILL USE THIS
// ADD A BUTTON TO RESET STUFF
// MAKE IT NICE
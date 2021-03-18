
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
  
  

let text = 'population';

var margin = {top: 35, right: 35, bottom: 35, left: 35},
    w = 500,
    h = 625;

projection = d3.geoMercator()
    //right/left, up/down
    .center([77.38, 31.5])
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
                                        })
                                        .on('mouseover', (countyDataItem)=> {
                                            tooltip.transition()
                                                .style('visibility', 'visible')
                                            let id = countyDataItem.properties['DISTRICT']
                                            let county = educationData.find((item) => {
                                                return item['Name'] === id
                                            })
                                            console.log(county['Name']);




                                            let filteredData = filterDistrict(tehsilData, county['Name']);
                                            var scatter = d3.select("#scatters")
                                            .append("svg")
                                            .attr('id', 'scatter')
                                            .append("g")
                                            .attr("transform",
                                            "translate(" + margin.left + "," + margin.top + ")");
                                            drawBar(filteredData, 'db_tehsil', 'perc_nonzero_wage', scatter)



                                            let filteredData2 = filterDistrict(tehsilData, county['Name']);
                                            var scatter2 = d3.select("#scatters")
                                            .append("svg")
                                            .attr('id', 'scatter2')
                                            .append("g")
                                            .attr("transform",
                                            "translate(" + margin.left + "," + margin.top + ")");
                                            drawBar(filteredData2, 'db_tehsil', 'age', scatter2)

                                            tooltip.text(county['Name'] + ' : ' + county['population'])
                                            tooltip.attr('data-pop', county['population'])
                                        })
                                        .on('mouseout', (countyDataItem) => {
                                            tooltip.transition()
                                                .style('visibility', 'hidden')
                                            d3.selectAll("#scatter").remove();
                                            d3.selectAll("#scatter2").remove();

                                        })
                                        //look into render Chart
                                        function renderChart() {
                                            const t = transition().duration(300);
                                            let map = canvas.selectAll('path').data(countyData)

                                            map.enter().append('path')
                                            .attr('d', d3.geoPath().projection(projection))
                                            .attr('class', 'county').style("stroke", "white")
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
                                                //account for missing values
                                                tooltip.text(county['Name'] + ' : ' + county[text])
                                                tooltip.attr('data-pop', county[text])
                                                console.log(county['Name']);
                                                let filteredData = filterDistrict(tehsilData, county['Name']);
                                                var scatter2 = d3.select("#scatters")
                                                .append("svg")
                                                .attr('id', 'scatter2')
                                                .append("g")
                                                .attr("transform",
                                                "translate(" + margin.left + "," + margin.top + ")");
                                                drawBar(filteredData, 'db_tehsil', 'age', scatter2)
                                                console.log(filteredData);
                                            })
                                            .on('mouseout', (countyDataItem) => {
                                                d3.selectAll("#scatter2").remove();
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

                                //drawBar(educationData, 'district', 'average_daily_wage', scatter)
                                //drawBar(educationData, 'district', 'average_age', scatter2)

                            }
                        })}
                                })
            }
        }
);

function drawBar(data, xvar, yvar, svg_name) {

    let sw = 160
    let sh = 160

    let dataset = data;


    console.log(dataset);
    var xScale = d3.scaleLinear()
    .domain([0, d3.max(dataset, function(d){
        return d[xvar]
    })]).range([0, sw]);

    var yScale = d3.scaleLinear()
    .domain([0, d3.max(dataset, function(d){
        return d[yvar];
    })])
    .range([sh, 0]);


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


    // Add Y axis
    var y = d3.scaleLinear()
    .domain([0, d3.max(dataset, function(d){
        return d[yvar];
    })]).range([ sh, 0]);

    svg_name.append("g")
    .call(d3.axisLeft(y)).attr("class", "left");

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

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
  
function filterDistrict_two(data, dist) {
   return data.filter(d=>d['Name'] === dist);
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
                                            //drawBubble(subdata);

                                            let filteredData = filterDistrict(tehsilData, county['Name']);
                                            var scatter = d3.select("#scatters")
                                            .append("svg")
                                            .attr('id', 'scatter')
                                            .append("g")
                                            .attr("transform",
                                            "translate(" + margin.left + "," + margin.top + ")");
                                            drawBar(filteredData, 'db_tehsil', 'perc_nonzero_wage', scatter, true)

                                            let filteredData2 = filterDistrict(tehsilData, county['Name']);
                                            var scatter2 = d3.select("#scatters")
                                            .append("svg")
                                            .attr('id', 'scatter2')
                                            .append("g")
                                            .attr("transform",
                                            "translate(" + margin.left + "," + margin.top + ")");
                                            drawBar(filteredData2, 'db_tehsil', 'age', scatter2, true)

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
                                            drawBar(filteredData, 'db_tehsil', 'perc_nonzero_wage', scatter, true)

                                            let filteredData2 = filterDistrict(tehsilData, county['Name']);
                                            var scatter2 = d3.select("#scatters")
                                            .append("svg")
                                            .attr('id', 'scatter2')
                                            .append("g")
                                            .attr("transform",
                                            "translate(" + margin.left + "," + margin.top + ")");
                                            drawBar(filteredData2, 'db_tehsil', 'age', scatter2, true)

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
                                            drawBar(filteredData, 'db_tehsil', 'perc_nonzero_wage', scatter, true)

                                            let filteredData2 = filterDistrict(tehsilData, county['Name']);
                                            var scatter2 = d3.select("#scatters")
                                            .append("svg")
                                            .attr('id', 'scatter2')
                                            .append("g")
                                            .attr("transform",
                                            "translate(" + margin.left + "," + margin.top + ")");
                                            drawBar(filteredData2, 'db_tehsil', 'age', scatter2, true)
                                            


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
                                            }).on('mouseover', (countyDataItem)=> {

                                                tooltip.transition()
                                                    .style('visibility', 'visible')
                                                let id = countyDataItem.properties['DISTRICT']
                                                let county = educationData.find((item) => {
                                                    return item['Name'] === id
                                                })}).style("cursor", "pointer")

                                            .on('click', (countyDataItem) => {
                                                let id = countyDataItem.properties['DISTRICT']
                                                let county = educationData.find((item) => {
                                                    return item['Name'] === id
                                                })
                                                //account for missing values
                                                d3.selectAll("#circle").remove();
                                                d3.selectAll("#scatter").remove();
                                                d3.selectAll("#scatter2").remove();

                                                tooltip.text(county['Name'] + ' : ' + county[text])
                                                tooltip.attr('data-pop', county[text])
                                                console.log(county['Name']);

                                                let filteredData = filterDistrict(tehsilData, county['Name']);
                                                var scatter = d3.select("#scatters")
                                                .append("svg")
                                                .attr('id', 'scatter')
                                                .append("g")
                                                .attr("transform",
                                                "translate(" + margin.left + "," + margin.top + ")");

                                                drawBar(filteredData, 'db_tehsil', 'perc_nonzero_wage', scatter)
          
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
                                                tooltip.transition()
                                                    .style('visibility', 'hidden')
                                            }).attr("fill", "white")
                                            
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
                                drawBar(educationData, 'district', 'average_daily_wage', scatter)
                                drawBar(educationData, 'district', 'average_age', scatter2)

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
function drawBubble(data) {
    let color = d3.schemeAccent
    let subdata = data;
    let ed_dist = 'kiln_distance_to_nearby_school';
    let dist_health = 'kiln_closest_basichealthunit';
    let dist_health1= 'kiln_closest_dispensary';
    let dist_health2 = 'kiln_closest_ruralhealthcare_facility';

    var circle = d3.select("#cont")
    .append("svg")
    .attr('id', 'circle')
    .append("g")

    const circleEnter = circle.selectAll("circle")
        .data(subdata)
        .enter();

    circleEnter.append("circle")
        .attr("cx", 50)
        .attr("cy", 10)
        .attr("r", function(d) { return d[ed_dist]*4})
        .attr("fill", color[0])
        .attr("id", "circle")
        .text("hello")
    const circleEnter1 = circle.selectAll("circle1")
        .data(subdata)
        .enter();

    circleEnter1.append("circle")
        .attr("cx", 50)
        .attr("cy", 90)
        .attr("r", function(d) { return d[dist_health]*4})
        .append("text")
        .text(function(d) { return d[dist_health]; })
        .attr("fill", color[1])
        .attr("id", "circle1");

    const circleEnter2 = circle.selectAll("circle2")
        .data(subdata)
        .enter();

    circleEnter2.append("circle")
        .attr("cx", 150)
        .attr("cy", 90)
        .attr("r", function(d) { return d[dist_health1]*4})
        .attr("fill", color[2])
        .attr("id", "circle2");

    const circleEnter3 = circle.selectAll("circle2")
        .data(subdata)
        .enter();

    circleEnter3.append("circle")
        .attr("cx", 250)
        .attr("cy", 90)
        .attr("r", function(d) { return d[dist_health2]*4})
        .attr("fill", color[4])
        .attr("id", "circle3");

}

function drawBar(data, xvar, yvar, svg_name, transition) {


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
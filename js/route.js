// draw the route as another view

// y position should be 100-yPos

class Route{
	constructor(data, info){
		this.data = this.mergeData(data, info);
		console.log(this.data);
		
		this.svgWidth = 1000;
		this.svgHeight = 1000;
		
		this.minTiming = 480;
		this.timing = 1000;
		this.maxTiming = 1438;
		
		this.dates = ["Fri", "Sat", "Sun"];
		this.activeDate = 0; // 0 - Fri, 1 - Sat, 2 - Sun
		this.dateIndex = {
			"Fri": 0,
			"Sat": 1,
			"Sun": 2
		}
		
		this.mapScaleX = d3.scaleLinear()
							.domain([0, 100])
							.range([0, 1000]);
		
		this.mapScaleY = d3.scaleLinear()
							.domain([0, 100])
							.range([0, 992.3]);
		
		this.mapScaleCircle = d3.scaleRadial()
								.domain([0, 100])
								.range([0, 40])
		
		this.selectionMode = false;

		this.types = ["thrill", "kiddie", "everyone", "show", "info", "shop", "beer", "rest", "food", "gate"]
		this.typeToColors = {
			"thrill": "red",
			"kiddie": "yellow",
			"everyone": "brown",
			"show": "blue",
			"info": "darkgreen",
			"shop": "pink",
			"beer": "gold",
			"rest": "purple",
			"food": "slateblue",
			"gate": "orange"
		}
	}
	
	mergeData(data, info){
		for (let data_i of data)
		for (let each of data_i){
			let x = each.x;
			let y = each.y;
			for (let obj of info)
				if (x == obj.x && y == obj.y){
					for (let key in obj)
						if (!(key in each))
							each[key] = obj[key];
					break;
				}
		}
		return data;
	}
	
	getStringFromTiming(t = null){
		let length = 2;
		if (this.timing < this.minTiming)
			this.timing = this.minTiming;
		if (this.timing > this.maxTiming)
			this.timing = this.maxTiming;
		if (t == null)
			t = this.timing;
		let h = parseInt(parseInt(t)/60);
		let m = t - h*60;
		console.log(t);
		let hs = (Array(length).join('0') + h).slice(-length);
		let ms = (Array(length).join('0') + m).slice(-length);
		return hs + ":" + ms;
	}
	
	getIndexFromTiming(t = null){
		if (this.timing < this.minTiming)
			this.timing = this.minTiming;
		if (this.timing > this.maxTiming)
			this.timing = this.maxTiming;
		if (t == null)
			t = this.timing;
		let index = parseInt((t-480)/2);
		return index;
	}
	
	drawMap(){
		let that = this;
		let svg = d3.select("#route-map-plots");
		svg.attr("width", this.svgWidth)
			.attr("height", this.svgHeight);
		
		let data_toShow = this.data[this.activeDate];
		let g_selection = svg.selectAll("g")
			.data(data_toShow)
			.join("g")
			.attr("transform", d => "translate("+this.mapScaleX(d.x)+","+this.mapScaleY(100-d.y)+")");
			
		// let aLineTotalLength = aLineChart.node().getTotalLength();

		// aLineChart
		// .attr("stroke-dasharray", aLineTotalLength)
		// .attr("stroke-dashoffset", aLineTotalLength)
		// .transition()
		// .duration(1000)
		// .attr("stroke-dashoffset", 0);
		
	
	
		
	}
	
}

function showPieChart(){
	let width = 800;
	let height = 400;
	let radius = Math.min(width, height) / 2 - 10;

	let svg = d3.select("svg")
		.attr("width", width)
		.attr("height", height)
		.append("g")
		.attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");


	// This creates a pie layout generator; if you give it a data set, it will
	// figure out the needed angles in order to draw a pie
	let pie = d3.pie();

	// Here we tell the pie generator which attribute
	// of the object to use for the layout
	pie.value(function (d) {
		return d.type;
	});


	// Now that we've set up our generator, let's give it our data:
	let pieData = pie(this.data);
	// We'll log it to the console to see how it transformed the data:
	console.log('pieData:', pieData);

	// To make SVG pie slices, we still need more information - for that,
	// we'll create an arc generator, that takes the computed pie data, and
	// produces SVG path strings
	let arc = d3.arc();

	// Let's tell it how large we want it
	arc.outerRadius(radius);
	// We also need to give it an inner radius...
	arc.innerRadius(0);

	// Let's test the arc generator, by giving it the first pie slice:
	console.log('first arc:', arc(pieData[0]));

	// With the pie data generator, and the arc path generator, we're
	// finally ready to start drawing!

	// We'll want a path and a text label for each slice, so first, we'll
	// create a group element:
	let groups = svg.selectAll("g").data(pieData)
		.enter()
		.append("g");

	// Add the path, and use the arc generator to convert the pie data to
	// an SVG shape
	groups.append("path")
		.attr("d", arc)
		// While we're at it, let's set the color of the slice using our color scale
		.style("fill", d => this.typeToColors(d.data.types));

	// add a label
	groups.append("text")
		.text(d => d.data.types)
		.attr("transform", d => "translate(" + arc.centroid(d) + ")")
		.attr("dy", ".35em")
		.style("text-anchor", "middle")
		.style("font-size", "10px");
	
}

function routeSwitchView(){
	// let div = d3.selectAll(".wrapper").style("display","none");
	if (d3.selectAll(".wrapper").style("display") == "block"){
		let div = d3.selectAll(".wrapper").style("display","none");
		// here should display the route view

		console.log("should see pie");
		// showPieChart();
		// this.drawMap();

	}
	else if (d3.selectAll(".wrapper").style("display") == "none"){
		let div = d3.selectAll(".wrapper").style("display","block");
	}



}

// async function changeData() {
// 	//  Load the file indicated by the select menu
// 	let dataFile = document.getElementById("route-dataset").value;

	
// 	try {
// 		const data = await d3.csv("data/" + dataFile + ".csv");
// 		drawMap();
// 	} catch (error) {
// 	  console.log(error)
// 	  alert("Could not load the dataset!");
// 	}
//   }


  

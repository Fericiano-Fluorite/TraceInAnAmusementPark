// draw the route as another view

// y position should be 100-yPos

class Route{
	constructor(data, info){
		let that = this;
		this.data = data;
		this.info = info;
		console.log(this.data);
		console.log(this.info);
		
		this.svgWidth = 1000;
		this.svgHeight = 1000;
		
		this.minTiming = 480;
		this.timing = 1000;
		this.maxTiming = 1438;
		
		this.routes = ["Route_1", "Route_2", "Route_3"];
		this.activeRoute = 0; // 0 - Fri, 1 - Sat, 2 - Sun
		this.dateIndex = {
			"Route_1": 0,
			"Route_2": 1,
			"Route_3": 2
		}
		
		this.routeChoice = d3.select("#route-choice")
		this.routeChoice.on("change", function(d){
			that.activeRoute = that.dateIndex[that.routeChoice.property("value")]
			that.countTime();
			that.drawRoute();
			that.showPieChart();
		})
		
		this.playButton = d3.select("#onplay-button")
		this.playButton.on("click", function(){
			if (that.routeSelection != undefined){
				let LineTotalLength = that.routeSelection.node().getTotalLength();
				
					
				that.routeSelection
					.attr("stroke-dasharray", LineTotalLength)
					.attr("stroke-dashoffset", LineTotalLength)
					.transition()
					.duration(30000)
					.attr("stroke-dashoffset", 0);
				
			}
		})
		
		this.mapScaleX = d3.scaleLinear()
							.domain([0, 100])
							.range([0, 1000]);
		
		this.mapScaleY = d3.scaleLinear()
							.domain([0, 100])
							.range([0, 992.3]);
		
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
		
		this.countTime();
	}
	
	countTime(){
		this.stayTime = {
			"thrill": 0.0,
			"kiddie": 0.0,
			"everyone": 0.0,
			"show": 0.0,
			"info": 0.0,
			"shop": 0.0,
			"beer": 0.0,
			"rest": 0.0,
			"food": 0.0,
			"gate": 0.0
		}
		
		let data_toShow = Array.from(this.data[this.activeRoute]);
		let len_data = data_toShow.length
		for (let i=0; i<len_data-1; i++){
			let obj = data_toShow[i];
			let t = this.getTimingFromString(obj.Timestamp)
			let t_next = this.getTimingFromString(data_toShow[i+1].Timestamp)
			for (let j of this.info){
				if (j.x == obj.X && j.y == obj.Y){
					this.stayTime[j.type] += t_next - t;
					break;
				}
			}
		}
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
	
	getTimingFromString(s){
		let ts = s.split(" ")[1]
		let hs = parseFloat(ts.split(":")[0])
		let ms = parseFloat(ts.split(":")[1])
		let ss = parseFloat(ts.split(":")[2])
		
		return hs*60+ms+ss/60
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
	
	drawRoute(){
		let that = this;
		this.routeSvg = d3.select("#route-map-plots");
		this.routeSvg.attr("width", this.svgWidth)
			.attr("height", this.svgHeight);
		
		let data_toShow = Array.from(this.data[this.activeRoute]);
		
		let lineGenerator = d3.line()
							.x(d => that.mapScaleX(parseInt(d.X)))
							.y(d => that.mapScaleY(100-parseInt(d.Y)))
							
		this.routeSelection = this.routeSvg.selectAll("path")
			.data([data_toShow])
			.join("path")
			.attr("d", d => lineGenerator(d))
			.attr("stroke", "red")
			.attr("fill", "none")
			.attr("stroke-width", 2)
		
		
	}
	
	showPieChart(){
		let width = 800;
		let height = 400;
		let radius = Math.min(width, height) / 2 - 10;

		let svg = d3.select("#pie-view").select("svg")
			.attr("width", width)
			.attr("height", height)
			.append("g")
			.attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

		let data_pie = []
		let sum_pie = 0
		for (let each in this.stayTime){
			data_pie.push({"key": each, "value": parseInt(this.stayTime[each])})
			sum_pie += parseInt(this.stayTime[each])
		}
		console.log(data_pie)
		
		// This creates a pie layout generator; if you give it a data set, it will
		// figure out the needed angles in order to draw a pie
		let pie = d3.pie();

		// Here we tell the pie generator which attribute
		// of the object to use for the layout
		pie.value(function (d) {
			return d.value;
		});


		// Now that we've set up our generator, let's give it our data:
		let pieData = pie(data_pie);
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
		groups.selectAll("path")
			.data(d => [d])
			.join("path")
			.attr("d", arc)
			// While we're at it, let's set the color of the slice using our color scale
			.attr("fill", d => this.typeToColors[d.data.key]);

		// add a label
		groups.selectAll("text")
			.data(d => [d])
			.join("text")
			.text(d => d.value*75>sum_pie?d.data.key:"")
			.attr("transform", d => "translate(" + arc.centroid(d) + ")")
			.attr("dy", ".35em")
			.style("text-anchor", "middle")
			.attr("font-size", "12px")
			.attr("font-weight", "bold");
	
	}
	
}


function routeSwitchView(){
	let mainActive = d3.select("#main-view").style("display")

	if (mainActive != "none"){
		d3.select("#main-view").style("display", "none")
		d3.select("#date-span").style("display", "none")
		d3.select("#time-span").style("display", "none")
		d3.select("#route-view").style("display", "")
		d3.select("#play-span").style("display", "")
	}
	else{
		d3.select("#main-view").style("display", "")
		d3.select("#date-span").style("display", "")
		d3.select("#time-span").style("display", "")
		d3.select("#route-view").style("display", "none")
		d3.select("#play-span").style("display", "none")
	}

}


  

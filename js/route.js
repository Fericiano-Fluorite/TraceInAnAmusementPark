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
		let timeIndex = this.getIndexFromTiming();
		let svg = d3.select("#map-plots");
		svg.attr("width", this.svgWidth)
			.attr("height", this.svgHeight);
		
		let data_toShow = this.data[this.activeDate];
		let g_selection = svg.selectAll("g")
			.data(data_toShow)
			.join("g")
			.attr("transform", d => "translate("+this.mapScaleX(d.x)+","+this.mapScaleY(100-d.y)+")");
		
		g_selection.selectAll("circle")
					.data(d => [d])
					.join("circle")
					.attr("r", d => this.mapScaleCircle(d.population[timeIndex]))
					.attr("fill", "green")
					.classed("unhighlight", true)
					.classed("highlight", false)
					.on("click", d => this.mapClick(d));
		
		g_selection.selectAll("rect")
					.data(d => [d])
					.join("rect")
					.attr("width", 4)
					.attr("height", 4)
					.attr("fill", "white")
					.attr("transform", "translate(-2,-2)")
					.on("click", d => this.mapClick(d));
	}
	
	
	mapClick(d){
		if (this.selectionMode){
			
		}
		else{
			this.showLineChart(d);
		}
	}
}
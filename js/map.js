class Map{
	constructor(data, info){
		this.data = this.mergeData(data, info);
		console.log(this.data);
		
		this.svgWidth = 1000;
		this.svgHeight = 1000;
		
		this.minTiming = 480;
		this.timing = 1000;
		this.maxTiming = 1438;
		this.timingInterval = 10;
		
		this.dates = ["Fri", "Sat", "Sun"];
		this.activeDate = 0; // 0 - Fri, 1 - Sat, 2 - Sun
		this.dateSelection = d3.select("#route-dataset");
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
		
		this.types = ["thrill", "kiddie", "everyone", "show", "info", "shop", "beer", "rest", "food", "gate"]
		this.typeToColors = {
			"thrill": "red",
			"kiddie": "yellow",
			"everyone": "purple",
			"show": "blue",
			"info": "darkgreen",
			"shop": "pink",
			"beer": "gold",
			"rest": "brown",
			"food": "slateblue",
			"gate": "orange"
		}
		
		/* this.mapScaleCircle = d3.scaleRadial()
								.domain([0, 100])
								.range([0, 40]) */
								
		this.mapCircleSize = 15
		
		this.mapScaleColors = {}
		for (let each in this.typeToColors)
			this.mapScaleColors[each] = d3.scaleLinear().domain([0, 100]).range(["white", this.typeToColors[each]])
		
		this.comparisonMode = d3.select("#selection-mode-switch")._groups[0][0].checked;
		this.comparisonSwitch = d3.select("#selection-mode-switch");
		this.comparisonSelected = new Set();
		this.comparisonChoice = d3.select("#comp-choice");
		this.comparisonChoice.property("disabled", true)
		this.addSwitchListener();
		
		d3.selectAll(".tooltip").style("display", "none");
	}
	
	changeDate(){
		let date = this.dateSelection.property("value")
		this.activeDate = this.dateIndex[date]
		this.comparisonSelected.clear()
		this.showComparisonChart()
		this.circleSelection.classed("highlight", false).classed("unhighlight", true)
		this.sideViewSelection.selectAll("path").remove()
		
		this.drawMap()
	}
	
	changeSelection(d){
		if (this.comparisonSelected.has(d)){
			this.comparisonSelected.delete(d)
			return false;
		}
		else{
			if (this.comparisonSelected.size < 15){
				this.comparisonSelected.add(d);
				return true;
			}
			else{
				alert("Please do not compare more than 15 entertainments at the same time")
				return false;
			}
		}
		return false;
	}
	
	isSelected(d){
		return this.comparisonSelected.has(d)
	}
	
	addSwitchListener(){
		let that = this;
		this.comparisonSwitch.on("change", function(){
			that.comparisonMode = d3.select("#selection-mode-switch")._groups[0][0].checked;
			if (!that.comparisonMode){
				d3.select("#comparison-chart").style("display","none");
				d3.select("#side-view").style("display","");
				that.comparisonChoice.property("value", "default")
				that.comparisonChoice.property("disabled", true)
				that.circleSelection.classed("highlight", false).classed("unhighlight", true)
				that.comparisonSelected.clear()
				that.showComparisonChart()
			}
			else{
				d3.select("#side-view").style("display","none");
				d3.select("#comparison-chart").style("display","");
				that.comparisonChoice.property("disabled", false)
				that.circleSelection.classed("highlight", false).classed("unhighlight", true)
				if (that.sideViewSelection != undefined)
					that.sideViewSelection.selectAll("path").remove()
			}
		})
		
		this.comparisonChoice.on("change", function(){
			if (that.comparisonChoice.property("disabled"))
				return
			if (that.comparisonChoice.property("value") == "default")
				return
			let sel_type = that.comparisonChoice.property("value")
			that.comparisonSelected.clear()
			console.log(that.comparisonSelected.size)
			that.circleSelection.filter(d => d.type != sel_type).classed("highlight", false).classed("unhighlight", true)
			that.circleSelection.filter(d => d.type == sel_type).classed("highlight", true).classed("unhighlight", false)
				.each(d => that.changeSelection(d))
			that.showComparisonChart();
		})
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
		// console.log(t);
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
		let index = parseInt((t-480)/this.timingInterval);
		return index;
	}
	
	drawMap(){
		let that = this;
		let timeIndex = this.getIndexFromTiming();
		let svg = d3.select("#map-plots");
		svg.attr("width", this.svgWidth)
			.attr("height", this.svgHeight);
		
		let data_toShow = this.data[this.activeDate];
		let g_selection = svg.selectAll("g")
			.data(data_toShow)
			.join("g")
			.attr("transform", d => "translate("+this.mapScaleX(d.x)+","+this.mapScaleY(100-d.y)+")");
			
		/* g_selection.selectAll("rect")
					.data(d => [d])
					.join("rect")
					.attr("width", 4)
					.attr("height", 4)
					.attr("fill", "white")
					.attr("transform", "translate(-2,-2)")
					.on("click", d => this.mapClick(d)); */
		
		this.circleSelection = g_selection.selectAll("circle")
					.data(d => [d])
					.join("circle")
					.attr("r", this.mapCircleSize)
					.attr("fill", d => this.mapScaleColors[d.type](d.population[timeIndex]))
					.attr("stroke-width", 1)
					.attr("stroke", "black")
					.classed("unhighlight", true)
					.classed("highlight", false)
					
		this.circleSelection.filter(d => this.isSelected(d))
						.classed("unhighlight", false)
						.classed("highlight", true)
		
		
		this.circleSelection.on("click", d => this.mapClick(d));
					
		this.circleSelection.on("mouseover", function(d){
			if (!that.comparisonMode){
				// d3.select(this).classed("hover", true)
			}
			else{
				if (d3.select(this).classed("highlight")){
					d3.select(this).classed("highlight", false)
						.classed("double-highlight", true)
					
					if (that.comparisonSelection != undefined)
						that.comparisonSelection.filter(d_ => d_ == d)
							.classed("highlight", true).classed("unhighlight", false)
				}
				else{
					// d3.select(this).classed("hover", true)
				}
			}
			
			let tooltip = d3.selectAll(".tooltip");
			
			tooltip.style("margin-left", that.mapScaleX(d.x)+"px")
				.style("margin-top", that.mapScaleY(100-d.y)+"px")
				.style("height", "50px")
				.style("width", "150px")
				.transition()
				.duration(200)
				.style("opacity", 0.8)
				.style("display", "");
			tooltip.html("OKAY")
			
		})
		.on("mouseout", function(d){
			if (d3.select(this).classed("double-highlight")){
				d3.select(this).classed("highlight", true)
					.classed("double-highlight", false)
				if (that.comparisonSelection != undefined)
						that.comparisonSelection.filter(d_ => d_ == d)
							.classed("unhighlight", true).classed("highlight", false)
			}
			else{
			}
			d3.selectAll(".tooltip")
				.style("opacity", 0);
		})
	}
	
	showLineChart(d){
		if (this.comparisonMode)
			return;
		let that = this;
		this.sideViewSelection = d3.select("#side-view").selectAll("svg");
		this.sideViewSelection.attr("width", 960)
			.attr("height", this.svgHeight)
			.style("background-color", "#A0A0A0");
		let xAxis = d3.select("#side-view-xAxis");
		let yAxis = d3.select("#side-view-yAxis");
		
		let lineScaleX = d3.scaleLinear()
							.domain([-5, d.population.length])
							.range([0, 900]);
		let lineScaleY = d3.scaleLinear()
							.domain([0, d3.max(d.population)])
							.range([900, 0]).nice()
		// console.log(d3.max(d.population))
		
		xAxis.attr("transform", "translate(40,940)")
			.call(d3.axisBottom(lineScaleX).ticks(10).tickFormat(function(d){return that.getStringFromTiming(d*that.timingInterval+480)}));
		yAxis.attr("transform", "translate(40,40)")
			.call(d3.axisLeft(lineScaleY).ticks(10));
		
		let lineGenerator = d3.line()
							.x((d, i) => lineScaleX(i))
							.y(d => lineScaleY(d));
							
		this.sideViewSelection.selectAll("path")
			.data([d])
			.join("path")
			.attr("d", d => lineGenerator(d.population))
			.attr("fill", "none")
			.attr("stroke", d => this.typeToColors[d.type])
	}
	
	showComparisonChart(){
		let that = this;
		let svg = d3.select("#comparison-chart").selectAll("svg");
		svg.attr("width", 1460)
			.attr("height", this.svgHeight)
			.style("background-color", "#A0A0A0");
		let xAxis = d3.select("#comparison-view-xAxis");
		let yAxis = d3.select("#comparison-view-yAxis");
		
		xAxis.classed("axis", true)
		yAxis.classed("axis", true)
		
		if (this.comparisonSelected.size <= 0){
			svg.selectAll("path").remove();
			xAxis.style("opacity", 0)
			yAxis.style("opacity", 0)
			return;
		}
		
		let maxX = -1
		let maxY = -1
		this.comparisonSelected.forEach((d, i) => {
			maxX = Math.max(maxX, d.population.length)
			maxY = Math.max(maxY, d3.max(d.population))
		})
		
		console.log(this.comparisonSelected)
		
		let lineScaleX = d3.scaleLinear()
							.domain([-5, maxX])
							.range([0, 1400]);
		let lineScaleY = d3.scaleLinear()
							.domain([0, maxY])
							.range([900, 0]).nice()
		// console.log(d3.max(d.population))
		
		xAxis.attr("transform", "translate(40,940)").style("opacity", 1)
			.call(d3.axisBottom(lineScaleX).ticks(10).tickFormat(function(d){return that.getStringFromTiming(d*that.timingInterval+480)}));
		yAxis.attr("transform", "translate(40,40)").style("opacity", 1)
			.call(d3.axisLeft(lineScaleY).ticks(10));
		
		let lineGenerator = d3.line()
							.x((d, i) => lineScaleX(i) + 40)
							.y(d => lineScaleY(d) + 40);
							
		let lineGSelection = svg.selectAll(".path")
			.data([...this.comparisonSelected])
			.join("g")
			.classed("path", true)
			
		this.comparisonSelection = lineGSelection.selectAll("path")
			.data(d => [d])
			.join("path")
			.attr("d", d => lineGenerator(d.population))
			.attr("fill", "none")
			.attr("stroke", d => this.typeToColors[d.type])
			.classed("unhighlight", true)
			.classed("highlight", false)
			.on("mouseover", function(d){
				d3.select(this).classed("highlight", true).classed("unhighlight", false);
				that.circleSelection.filter(d_ => d_ == d).classed("double-highlight", true)
					.classed("highlight", false)
			})
			.on("mouseout", function(d){
				d3.select(this).classed("highlight", false).classed("unhighlight", true);
				that.circleSelection.filter(d_ => d_ == d).classed("double-highlight", false)
					.classed("highlight", true)
			});
			
	}
	
	mapClick(d){
		if (this.comparisonMode){
			let added = this.changeSelection(d)
			this.circleSelection.filter(d_ => d_ == d)
					.classed("highlight", added)
					.classed("unhighlight", !added)
			this.comparisonChoice.property("value", "default")
			this.showComparisonChart()
		}
		else{
			this.circleSelection.filter(d_ => d_ != d)
					.classed("highlight", false)
					.classed("unhighlight", true)
			this.circleSelection.filter(d_ => d_ == d)
					.classed("highlight", true)
					.classed("unhighlight", false)
			this.showLineChart(d);
		}
	}
}
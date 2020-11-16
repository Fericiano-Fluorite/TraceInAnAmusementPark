ride_name = d3.json("data/info.json");
data_fri = d3.json("data/ride-position-Fri.json");
data_sat = d3.json("data/ride-position-Sat.json");
data_sun = d3.json("data/ride-position-Sun.json");
rides = d3.csv("data/rides.csv");


Promise.all([data_fri, data_sat, data_sun, ride_name, rides]).then( data => {
	let movement = data.slice(0,3);
	let rides = data.slice(3,5);
	
	for (let each of rides[1])
		each['detail_type'] = rides[0][each['type']]?rides[0][each['type']]:each['type'];
	
	let map = new Map(movement, rides[1]);
	map.drawMap();
});
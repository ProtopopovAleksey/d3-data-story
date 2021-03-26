function drawMap({svg, data, colorScheme}) {
  
  // async loading of us states geo data
  d3.json("./data/us-geo.json")
    .then(async usGeoData => {
      
      // add shooting data from our dataset to geodata
      usGeoData.features.forEach(state => {
        const stateValue = data.filter(person => person.state === state.properties.postal).length
        state.properties.value = stateValue ? stateValue : 0
      })
      
      // initialize the D3 tip: https://github.com/bumbeishvili/d3-v6-tip
      const tip = d3.tip()
        .attr('class', 'd3-tip')
        // popup template
        .html((event, d) => {
          return `
            <h3>${d.properties.name}</h3>
            <p>${d.properties.value} shooting since 2015</p>
            `
        })
        .offset([120, 0]);
      
      // invoke the tip in the context of your visualization
      svg.call(tip)
      
      // calculating the maximum value by state
      const maxValue = d3.max(usGeoData.features.map(state => state.properties.value))
      
      // Adding a legend. See more in the _legend.js
      legend({
        color: d3.scaleSequential([0, maxValue], colorScheme),
        title: "Shooting since 2015",
        svg: svg
      })
  
      // initialize the projection for geodata: https://github.com/d3/d3-geo#geoAlbersUsa
      const projection = d3.geoAlbersUsa()
      const path = d3.geoPath(d3.geoAlbersUsa())
      
      const statesContainer = svg
        .append("g")
        .attr("transform", 'translate(0, 60)');     // offset the map to leave space for the legend
      
      // drawing geojson
      statesContainer
        .selectAll("path")
        .data(usGeoData.features)
        .join("path")
        .attr("class", "map-state")
        .attr("fill", d => colorScheme(d.properties.value / maxValue))              // the color is determined by the gradient
        .attr("d", path)
        .on('mouseover', (event, d) => tip.show(event, d, d3.select(this).node()))  // show popup on mouseover
        .on('mouseout', tip.hide)                                                   // hide popup on mouseout
      
      // add circles to svg
      statesContainer.selectAll("circle")
        .data(data.filter(d => d.longitude && d.latitude))    // filter data without longitude and latitude
        .enter()
        .append("circle")
        .attr("cx", d => projection([d.longitude, d.latitude])[0])
        .attr("cy", d => projection([d.longitude, d.latitude])[1])
        .attr("r", "3px")
        .attr("class", "map-circle")
    });
}

function drawDonutChart({svg, width, height, data}) {
  
  // total count of shoots
  const totalPersons = data.length
  
  // grouping data by race
  let dataGroup = []
  for (const [raceKey, raceName] of Object.entries(raceDecoder)) {
    
    if (raceName !== 'Other') {
      const personsByRace = data.filter(person => person.race === raceKey).length
      
      dataGroup.push({
        category: raceName,
        value: (personsByRace / totalPersons * 100).toFixed(1),
        valueNumber: personsByRace
      })
    } else {
      // add to the rest data that does not belong to any of the main groups
      const personsByRace = data.filter(person =>
        person.race === 'O' ||
        (person.race !== 'A' &&
        person.race !== 'B' &&
        person.race !== 'H' &&
        person.race !== 'W')).length
      
      dataGroup.push({
        category: raceName,
        value: (personsByRace / totalPersons * 100).toFixed(1),
        valueNumber: personsByRace
      })
    }
  }
  
  // calculate donut radius
  let radius = Math.min(width, height) / 3.3;
  
  // creates a new pie generator: https://github.com/d3/d3-shape#pie
  let pie = d3.pie()
    .value(d => d.value)
    .sort(null)
  
  // contructs and arc generator. This will be used for the donut. The difference between outer and inner
  // radius will dictate the thickness of the donut
  let arc = d3.arc()
    .outerRadius(radius * 0.8)
    .innerRadius(radius * 0.5)
    .cornerRadius(0)
  
  let arcOver = d3.arc()
    .outerRadius(radius * 0.9)
    .innerRadius(radius * 0.55)
  
  // similar arc for labels
  let arcLabel = d3.arc()
    .outerRadius(radius * 0.8)
    .innerRadius(radius * 0.5)
  
  let arcLabelOver = d3.arc()
    .outerRadius(radius * 0.9)
    .innerRadius(radius * 0.55)
  
  // function to animate drawing an arc
  function tweenPie(b) {
    const i = d3.interpolate({startAngle: 0, endAngle: 0}, b);
    return function (t) {
      return arc(i(t));
    };
  }
  
  /** creating the first chart */
  let path1 = svg
    .append('g')
    .attr('id', 'victims')
    .attr('transform', `translate(${width / 6}, ${height / 2})`)
    .selectAll('path')
    .data(pie(dataGroup))
    .enter()
  
  // add chart label
  path1.append('text')
    .attr('class', 'title')
    .attr('x', 0)
    .attr('y', height / 3)
    .attr('text-anchor', 'middle')
    .attr("font-family", "Inconsolata")
    .attr("font-size", "24px")
    .text('Police victims')
  
  // add arcs
  path1.append('path')
    .attr('class', d => `slices arc-${d.data.category}`)
    .attr('fill', d => raceColorMap[d.data.category])
    .transition()
    .duration(2000)
    .attrTween("d", tweenPie);
  
  // Place arc labels
  path1.append("text")
    .attr("transform", d => "translate(" + arcLabel.centroid(d) + ")")
    .attr('class', d => `label-${d.data.category}`)
    .style("font-size", 16)
    .style("font-weight", 'bold')
    .style("pointer-events", 'none')
    .attr("text-anchor", "middle")
    .attr("fill", "#2F394D")
    .text(d => `${d.value}%`);
  
  // add source links
  path1
    .append('a')
    .attr('xlink:href', 'https://www.washingtonpost.com/graphics/investigations/police-shootings-database/')
    .attr('target', '_blank')
    .append('text')
    .attr('class', 'sub-title')
    .attr('x', 0)
    .attr('y', height / 3 + 24)
    .attr('text-anchor', 'middle')
    .attr("font-family", "Inconsolata")
    .attr("font-size", 12)
    .style("fill", 'rgba(47,57,77,0.2)')
    .text('For 2015-2019 according to the Washington Post')
  
  /** creating the second chart */
  let path2 = svg
    .append('g')
    .attr('id', 'population')
    .attr('transform', `translate(${(width / 6) * 3}, ${height / 2})`)
    .selectAll('path')
    .data(pie(usPopulation))
    .enter()
  
  // add arcs
  path2.append('path')
    .attr('class', d => `slices arc-${d.data.category}`)
    .attr('fill', (d, i) => raceColorMap[d.data.category])
    .transition()
    .duration(2000)
    .attrTween("d", tweenPie);
  
  // Place chart label
  path2.append('text')
    .attr('class', 'title')
    .attr('x', 0)
    .attr('y', height / 3)
    .attr('text-anchor', 'middle')
    .attr("font-family", "Inconsolata")
    .attr("font-size", "24px")
    .text('Population')
  
  // Place arc labels
  path2.append("text")
    .attr("transform", d => "translate(" + arcLabel.centroid(d) + ")")
    .attr('class', d => `label-${d.data.category}`)
    .style("font-size", 18)
    .style("font-weight", 'bold')
    .style("pointer-events", 'none')
    .attr("text-anchor", "middle")
    .attr("fill", "#2F394D")
    .text(d => `${d.value}%`);
  
  // add source link
  path2
    .append('a')
    .attr('xlink:href', 'https://www.kff.org/other/state-indicator/distribution-by-raceethnicity/')
    .attr('target', '_blank')
    .append('text')
    .attr('class', 'sub-title')
    .attr('x', 0)
    .attr('y', height / 3 + 24)
    .attr('text-anchor', 'middle')
    .attr("font-family", "Inconsolata")
    .attr("font-size", 12)
    .style("fill", 'rgba(47,57,77,0.2)')
    .text('For 2019 according to KFF')
  
  /** creating the third chart */
  let path3 = svg
    .append('g')
    .attr('id', 'victims')
    .attr('transform', `translate(${(width / 6) * 5}, ${height / 2})`)
    .selectAll('path')
    .data(pie(usMurders))
    .enter()
  
  // add arcs
  path3.append('path')
    .attr('class', d => `slices arc-${d.data.category}`)
    .attr('fill', d => raceColorMap[d.data.category])
    .transition()
    .duration(2000)
    .attrTween("d", tweenPie);
  
  // Place chart label
  path3.append('text')
    .attr('class', 'title')
    .attr('x', 0)
    .attr('y', height / 3)
    .attr('text-anchor', 'middle')
    .attr("font-family", "Inconsolata")
    .attr("font-size", 24)
    .text('Arrests for murder')
  
  // add source link
  path3
    .append('a')
    .attr('xlink:href', 'https://ucr.fbi.gov/crime-in-the-u.s/2019/crime-in-the-u.s.-2019/tables/table-43/')
    .attr('target', '_blank')
    .append('text')
    .attr('class', 'sub-title')
    .attr('x', 0)
    .attr('y', height / 3 + 24)
    .attr('text-anchor', 'middle')
    .attr("font-family", "Inconsolata")
    .attr("font-size", 12)
    .style("fill", 'rgba(47,57,77,0.2)')
    .text('For 2019 according to FBI:UCR')
  
  // Place labels
  path3.append("text")
    .attr("transform", d => "translate(" + arcLabel.centroid(d) + ")")
    .attr('class', d => `label-${d.data.category}`)
    .style("font-size", 18)
    .style("font-weight", 'bold')
    .style("pointer-events", 'none')
    .attr("text-anchor", "middle")
    .attr("fill", "#2F394D")
    .attr("dx", '5px')
    .text(d => `${d.value}%`);
  
  // add legend containers
  let legendG = svg.selectAll(".legend")
    .data(pie(dataGroup))
    .enter().append("g")
    .attr("transform", (d, i) => "translate(-50," + (i * 25 + 20) + ")") // place each legend depending on the index
    .attr("class", "legend");
  
  // add legend matching color rect
  legendG.append("rect")
    .attr("width", 20)
    .attr("height", 20)
    .attr("fill", d=> raceColorMap[d.data.category]);
  
  // add the legend text
  legendG.append("text")
    .text(d => d.data.category)
    .style("font-size", 18)
    .attr("y", 15)
    .attr("x", 25);
  
  legendG.call(toolTip)
  
  // apply mouse actions to all arcs
  d3.selectAll('.slices').call(toolTip);
  
  function toolTip(selection) {
    
    selection.on('mouseover', event => {
      
      // get data of hovered arc
      const data = d3.select(event.target).data()[0]
      
      // select all arcs with the same category as selected
      d3.selectAll(`.arc-${data.data.category}`)
        .transition()
        .duration(400)
        .attr("d", arcOver);
      
      // add circle in the center
      svg.append('circle')
        .attr('class', 'toolCircle')
        .attr('r', radius * 0.45) // radius of tooltip circle
        .attr('transform', `translate(${(width / 6)}, ${height / 2})`)
        .style('fill', raceColorMap[data.data.category]) // colour based on category mouse is over
        .style('fill-opacity', 0.35);
      
      // add text to center circle
      svg.append('text')
        .attr('class', 'toolCircle')
        .attr('dy', -15) // hard-coded. can adjust this to adjust text vertical alignment in tooltip
        .html(toolTipHTML(data, 'victims')) // add text to the circle.
        .attr('transform', `translate(${(width / 6)}, ${height / 2})`)
        .style('font-size', '.7em')
        .style('text-anchor', 'middle'); // centres text in tooltip
      
      svg.append('circle')
        .attr('class', 'toolCircle')
        .attr('r', radius * 0.45) // radius of tooltip circle
        .attr('transform', `translate(${(width / 6) * 3}, ${height / 2})`)
        .style('fill', raceColorMap[data.data.category]) // colour based on category mouse is over
        .style('fill-opacity', 0.35);
      
      svg.append('text')
        .attr('class', 'toolCircle')
        .attr('dy', -15) // hard-coded. can adjust this to adjust text vertical alignment in tooltip
        .html(toolTipHTML(data, 'population')) // add text to the circle.
        .attr('transform', `translate(${(width / 6) * 3}, ${height / 2})`)
        .style('font-size', '.7em')
        .style('text-anchor', 'middle'); // centres text in tooltip
      
      svg.append('circle')
        .attr('class', 'toolCircle')
        .attr('r', radius * 0.45) // radius of tooltip circle
        .attr('transform', `translate(${(width / 6) * 5}, ${height / 2})`)
        .style('fill', raceColorMap[data.data.category]) // colour based on category mouse is over
        .style('fill-opacity', 0.35);
      
      svg.append('text')
        .attr('class', 'toolCircle')
        .attr('dy', -15) // hard-coded. can adjust this to adjust text vertical alignment in tooltip
        .html(toolTipHTML(data, 'crime')) // add text to the circle.
        .attr('transform', `translate(${(width / 6) * 5}, ${height / 2})`)
        .style('font-size', '.7em')
        .style('text-anchor', 'middle'); // centres text in tooltip
      
      d3.selectAll(`.label-${data.data.category}`)
        .transition()
        .duration(400)
        .attr("transform", d => "translate(" + arcLabelOver.centroid(d) + ")")
    });
    
    // remove the tooltip when mouse leaves the slice/label
    selection.on('mouseout', event => {
      
      const data = d3.select(event.target).data()[0]
      
      d3.selectAll(`.arc-${data.data.category}`)
        .transition()
        .duration(400)
        .attr("d", arc);
      
      d3.selectAll('.toolCircle').remove();
      
      d3.selectAll(`.label-${data.data.category}`)
        .transition()
        .duration(400)
        .attr("transform", d => "translate(" + arcLabel.centroid(d) + ")")
    });
  }
  
  // forming data to center tooltips
  const aggregatedData = {
    victims: dataGroup,
    population: usPopulation,
    crime: usMurders
  }
  
  const aggregatedTotalData = {
    victims: totalPersons,
    population: totalPopulation,
    crime: totalMurders
  }
  
  // html template fo tooltip which depend on type of chart
  function toolTipHTML(data, type) {
    const arcData = aggregatedData[type].find(group => group.category === data.data.category)
    return `
        <tspan class="circle-text" x="0" y="0">${arcData.category}</tspan>
        <tspan class="circle-text" x="0" y="0">
          ${numberConvert(arcData.valueNumber)} of ${numberConvert(aggregatedTotalData[type])}
        </tspan>
        <tspan class="circle-text" x="0" dy="14px">${arcData.value}%</tspan>
    `;
  }
}

const raceDecoder = {
  W: 'White',
  B: 'Black',
  A: 'Asian',
  H: 'Hispanic',
  O: 'Other'
}

// helping function to convert big numbers: 1234567 => 1.23M
function numberConvert(number) {
  if (number > 1000000) {
    return `${(number / 1000000).toFixed(2)}M`
  } else {
    return number
  }
}

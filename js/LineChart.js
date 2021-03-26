function drawLineChart({svg, width, height, data, colorScheme}) {
  
  // grouping data by time period
  let dataset = groupByDate(data, sliceDate)
  
  // within time groups, divide the data by race
  dataset = Object.entries(dataset).map(group => {
    const dataGroup = {
      date: new Date(group[0])
    }
    for (const [raceKey, raceName] of Object.entries(raceDecoder)) {
      dataGroup[raceName] = group[1].filter(person => person.race === raceKey).length
    }
    // add to the rest data that does not belong to any of the main groups
    dataGroup['Other'] += group[1].filter(person =>
      person.race !== 'A' &&
      person.race !== 'B' &&
      person.race !== 'H' &&
      person.race !== 'W').length
    
    return dataGroup
  })
  // delete the last time group since the last time period is always not completed at the current moment
  dataset.pop()
  
  // set the scale for the axes
  let xScale = d3.scaleTime()                 // Time scale: https://github.com/d3/d3-scale/blob/v3.2.2/README.md#scaleTime
    .range([0, width])                        // scale's range: from 0 to the width of the svg container
    .domain(d3.extent(dataset, d => d.date))  // scale’s domain: d3.extent computing the minimum and maximum value of dataset's dates
  
  let yScale = d3.scaleLinear()
    .range([height * 0.9, 0])                                   // scale's range: from 0 to the 0.9 * height of the svg container. One tenth of the height will be used to display the legend
    .domain([0, d3.max(dataset.map(group => group.White))]);    // scale’s domain: the maximum value is chosen from among whites, as the most numerous group
  
  // full race names
  const dataMap = Object.values(raceDecoder)
  
  // creating a line for each racial group
  dataMap.forEach(group => {
    
    // define line generator
    const lineInstance = d3.line()
      .x(d => xScale(d.date))       // set property which will be the X coordinate
      .y(d => yScale(d[group]))     // set property which will be the Y coordinate
      .curve(d3.curveNatural)       // add curve the line
    
    // Add the path to svg container with the necessary style properties
    svg.append("path")
      .data([dataset])
      .attr("class", "line")
      .attr("id", `line-${group}`)
      .style("fill", "none")
      .style("stroke-width", "3px")
      .style("stroke", raceColorMap[group])
      .attr("d", lineInstance)
    
    // get path length for
    const totalLength = svg.select(`#line-${group}`).node().getTotalLength();
  
    // set up transition
    svg.select(`#line-${group}`)
      .attr("stroke-dasharray", `${totalLength} ${totalLength}`)
      .attr("stroke-dashoffset", totalLength)
      .transition()                             // call transition method
      .duration(1000)                           // set duration timing (ms)
      .ease(d3.easeLinear)                      // set easing option
      .attr("stroke-dashoffset", 0);            // set transition object
  })
  
  // Add the X Axis to svg container
  svg.append("g")
    .attr("transform", "translate(0," + height * 0.9 + ")")   // move the axis under the chart
    .attr('class', 'line-axis')                               // set class to styling
    .call(d3.axisBottom(xScale))
  
  // Add the Y Axis to svg container
  svg.append("g")
    .attr('class', 'line-axis')                               // set class to styling
    .call(d3.axisLeft(yScale))
    
  
  // creating left-oriented axis generator for horizontal grid
  const makeYLines = () => d3.axisLeft()
    .scale(yScale)
  
  svg.append('g')
    .attr('opacity', 0.4)
    .call(makeYLines()
      .tickSize(-width, 0, 0)     // set size of grid lines
      .tickFormat('')
    )
  
  // append label
  svg.append('text')
    .attr('class', 'chart-title')    // set class to styling
    .attr('x', -20)                  // set X position
    .attr('y', -40)                  // set Y position
    .text('Annual victims by race')  // set text
  
  // append legend
  let legend = svg.selectAll('.legend')
    .data(dataMap)
    .enter().append('g')
    .attr("width", width)
    .attr("height", 30)
    .attr("transform", (d, i) => `translate(${200 + i * 120}, ${height})` )   //calculate the offset relative to the index
  
  // append a matching color rect
  legend.append("rect")
    .attr("width", 20)
    .attr("height", 20)
    .style("fill", d => raceColorMap[d])
  
  // append a legend text
  legend.append("text")
    .attr("x", 25)
    .attr("y", 15)
    .text(d => d)
  
  // this allows to find the closest X index of the mouse:
  const bisect = d3.bisector(function (d) {
    return d.date;
  }).left;
  
  // create the rect that travels after the mouse
  let focus = svg
    .append('g')
    .append('rect')
    .attr("class", 'focus')
    .attr("width", 160)
    .attr("height", 130)
    .attr("transform", 'translate(20, -20)')   // offset relative to mouse position
    
  
  // create the line that travels after the mouse
  let focusLine = svg
    .append('g')
    .append("line")
    .attr("class", 'focus')
    .attr("x1", 0)
    .attr("y1", 0)
    .attr("x2", 0)
    .attr("y2", height * 0.9)
  
  // create the text that travels along the curve of chart
  let focusText = svg.append('text')
    .attr('class', 'focus-text')

  // add a rect on top of the entire svg to track mouse events ("pointer-events", "all")
  svg
    .append('rect')
    .style("fill", "none")
    .style("pointer-events", "all")
    .attr('width', width)
    .attr('height', height)
    .on('mouseover', mouseover)
    .on('mousemove', mousemove)
    .on('mouseout', mouseout);
  
  // What happens when the mouse move -> show the annotations at the right positions.
  function mouseover() {
    focus.style("opacity", 1)
    focusText.style("opacity", 1)
    focusLine.style("opacity", 1)
  }
  
  function mousemove(event) {
    // recover mouse coordinate we need
    let x0 = xScale.invert(d3.pointer(event)[0]);
    let i = bisect(dataset, x0, 1);
    let selectedData = dataset[i]
    const pointDate = new Date(selectedData.date)
    let htmlTemplate = ''
    // add tspan for each race group with an offset of 20 pixels along the Y-axis from the previous
    Object.entries(selectedData).forEach(group => {
      if (typeof group[1] !== 'number') {
        htmlTemplate += `<tspan x="${xScale(selectedData.date) + 30}" fill="#2F394D">${pointDate.getFullYear()}</tspan>`
      } else {
        htmlTemplate += `<tspan x="${xScale(selectedData.date) + 30}" fill="${raceColorMap[group[0]]}" dy="20">${group[0]}: ${selectedData[group[0]]}</tspan>`
      }
    })
    
    // change the position of the elements in accordance with the position of the mouse
    focus
      .attr("x", xScale(selectedData.date))
      .attr("y", d3.pointer(event)[1])
    focusText
      .attr("x", xScale(selectedData.date) + 20)
      .attr("y", d3.pointer(event)[1])
      .html(htmlTemplate)
    focusLine
      .attr("x1", xScale(selectedData.date))
      .attr("x2", xScale(selectedData.date))
  }
  
  // hide the annotation after mouseout
  function mouseout() {
    focus.style("opacity", 0)
    focusText.style("opacity", 0)
    focusLine.style("opacity", 0)
  }
}


// helper function for grouping data by date
function groupByDate(data, keyFunc) {
  let r = {};
  data.forEach(function (x) {
    let y = keyFunc(x);
    r[y] = (r[y] || []).concat(x);
  });
  return r
}

// helper function to slice date
// .slice(0, 4) means we extract only a year: "2019-01-01".slice(0, 4) => "2019"
// to group by month you can use .slice(0, 7): "2019-01-01".slice(0, 7) => "2019-01"
function sliceDate(x) {
  return x.date.slice(0, 4)
}

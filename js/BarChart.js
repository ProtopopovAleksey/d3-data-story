const ageIntervals = ['5-9', '9-14', '15-19', '20-24', '25-29', '30-34', '35-39',
  '40-44', '45-49', '50-54', '55-59', '60-64', '65-69', '70-74', '75-79', '80-84', '85-90', '90-94']

function drawBarChart({svg, width, data, colorScheme}) {
  
  const ageChartHeight = 300
  const genderChartHeight = 100
  
  // grouping data by age
  let dataByAges = {}
  data.forEach(point => {
    if (dataByAges[point.age]) {
      dataByAges[point.age].push(point)
    } else {
      dataByAges[point.age] = [point]
    }
  })
  
  // delete group without empty age
  delete dataByAges['']
  
  // divide the data grouped by age into groups of five years, eg '5-9', '9-14', ...
  const agesGrouped = groupBy(dataByAges, function (x) {
    return Math.floor(x / 5)
  });
  
  const dataByAgeLength = []
  ageIntervals.forEach((interval, index) => {
    dataByAgeLength.push({
      title: interval,
      value: agesGrouped[index].length
    })
  })
  
  const ageChartContainer = svg.append('g')
  
  // initialize scales
  const xScale = d3.scaleBand()                   // create an ordinal band scale
    .range([0, width])
    .domain(dataByAgeLength.map((s) => s.title))  // age group title is a category
    .padding(0.4)                                 // offset of the label from the axis
  
  const yScale = d3.scaleLinear()
    .range([ageChartHeight, 0])
    .domain([0, 1000]);
  
  const makeYLines = () => d3.axisLeft()
    .scale(yScale)
  
  // Add an axis to svg with an offset to the height of the graph
  const xAxis = ageChartContainer.append('g')
    .attr('transform', `translate(0, ${ageChartHeight})`)
    .call(d3.axisBottom(xScale))
  
  // add labels to the Axis
  xAxis.selectAll("text")
      .style("text-anchor", "end")
      .attr("dx", "-.8em")
      .attr("dy", ".15em")
      .attr("transform", "rotate(-65)" )     // rotate labels 65 degrees
      .attr("font-family", "Inconsolata")
      .attr("font-size", 14)
  
  // remove the X axis (the grid will remain)
  xAxis.call(g => g.select(".domain").remove())
  
  const yAxis = ageChartContainer.append('g')
    .call(d3.axisLeft(yScale))
  
  // set Y axis labels
  yAxis.selectAll("text")
      .attr("font-family", "Inconsolata")
      .attr("font-size", 16)
  
  // remove the Y axis and ticks
  yAxis.selectAll("line").remove()
  yAxis.call(g => g.select(".domain").remove())
  
  // add horizontal grid
  ageChartContainer.append('g')
    .call(makeYLines()
      .tickSize(-width, 0, 0)
      .tickFormat('')
    )
    .call(g => g.select(".domain").remove())
    .attr('opacity', 0.4)
  
  // add <g> for bars
  const barGroups = ageChartContainer.selectAll()
    .data(dataByAgeLength)
    .enter()
    .append('g')
  
  let hoverLabel = null
  
  // add rect
  const barRect = barGroups
    .append('rect')
    .attr('class', 'bar')
    .attr('x', g => xScale(g.title))
    .attr('y', yScale(0))
    .attr('height', ageChartHeight - yScale(0))
    .attr('width', xScale.bandwidth() + 10)
    .attr("fill", d => colorScheme(d.value / 1000))
    .on('mouseover', d => {
      hoverLabel = d3.select(d.target.parentNode)
        .append('text')
        .attr("x", d => xScale(d.title))
        .attr("y", d => yScale(d.value) - 4)
        .attr("class", "bar-text")
        
        .text(d => d.value)
    })
    .on('mouseout', () => { if (hoverLabel) hoverLabel.remove() })
  
  // add bars transition
  barRect
    .transition()
    .duration(800)
    .attr("y", (g) => yScale(g.value))                        // transition subject
    .attr("height", (g) => ageChartHeight - yScale(g.value))  // transition subject
    
  // add chart title
  ageChartContainer.append('text')
    .attr('class', 'chart-title')
    .attr('x', 0)
    .attr('y', -20)
    .text('Victims by age')
  
  // creating gender chart
  // grouping data by gender
  let dataByGender = {}
  data.forEach(point => {
    if (dataByGender[point.gender]) {
      dataByGender[point.gender].push(point)
    } else {
      dataByGender[point.gender] = [point]
    }
  })
  
  const dataByGenderLength = [
    {
      gender: 'Male',
      shoots: dataByGender['M'].length
    },
    {
      gender: 'Female',
      shoots: dataByGender['F'].length
    }
  ]
  
  // add a container for gender with an offset
  const GenderChartContainer = svg
    .append("g")
    .attr("transform", 'translate(0, 400)');
  
  const maxScaleValue = dataByGender['M'].length + 2000
  
  // Add X axis
  let x = d3.scaleLinear()
    .domain([0, maxScaleValue])
    .range([0, width]);
  
  let y = d3.scaleBand()
    .range([0, genderChartHeight])
    .domain(dataByGenderLength.map(d => d.gender))
    .padding(.1);
  
  const yAxisGender = GenderChartContainer.append("g")
    .call(d3.axisLeft(y))
    .attr("font-family", "Inconsolata")
    .attr("font-size", 20)
  
  // hide axis
  yAxisGender.selectAll("line").remove()
  yAxisGender.call(g => g.select(".domain").remove())
  
  //Bars
  const bars = GenderChartContainer.selectAll(".gender-rect")
    .data(dataByGenderLength)
    .enter()
    .append("rect")
    .attr('class', 'bar')
  
  bars
    .attr("x", x(0))
    .attr("y", d => y(d.gender))
    .attr("width", 0)
    .attr("height", 40)
    .attr("fill", d => colorScheme(d.shoots / maxScaleValue))
  
  // transition
  bars
    .transition()
    .duration(800)
    .attr("x", x(0))
    .attr("width", (g) => x(g.shoots))
  
  
  GenderChartContainer.append("g")
    .attr("fill", "white")
    .attr("text-anchor", "end")
    .attr("font-family", "Inconsolata")
    .attr("font-size", 20)
    .selectAll("text")
    .data(dataByGenderLength)
    .join("text")
    .attr("x", d => x(d.shoots))
    .attr("y", (d) => y(d.gender))
    .attr("dy", 50 / 2)
    .attr("dx", -4)
    .text(d => d.shoots)
    .call(text => text.filter(d => x(d.shoots) - x(0) < 200) // short bars
      .attr("dx", +4)
      .attr("fill", "#2F394D")
      .attr("text-anchor", "start"));
  
  GenderChartContainer.append('text')
    .attr('class', 'title')
    .attr('x', 0)
    .attr('y', -20)
    .attr('text-anchor', 'start')
    .attr('font-weight', 'bold')
    .text('Victims by gender')
}

/** helper function for grouping data by age */
function groupBy(data, keyFunc) {
  let r = {};
  Object.entries(data).forEach(function (x) {
    const y = keyFunc(x[0]);
    r[y] = (r[y] || []).concat(x[1]);
  });
  return Object.keys(r).map(function (y) {
    return r[y];
  });
}
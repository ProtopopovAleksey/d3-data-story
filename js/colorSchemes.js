// creating a D3 color palette https://github.com/d3/d3-scale-chromatic
const colorScheme = d3.scaleSequential()
  .domain([0, 1])                   // input values range
  .range(["#c1daed", "#08306b"])    // output colors range

// set a color scheme for displaying groups
const raceColorMap = {
  White: '#819fb1',
  Black: '#d08e84',
  Hispanic: '#a03e33',
  Asian: '#80857b',
  Other: '#a9aca9',
}

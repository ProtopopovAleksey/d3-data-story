//https://www.kff.org/other/state-indicator/distribution-by-raceethnicity/

const totalPopulation = 319249300
const AsianPopulation = 18007200
const WhitePopulation = 191757100
const HispanicPopulation = 59102900
const BlackPopulation = 38872200

const usPopulation = [
  {
    category: "White",
    value: (WhitePopulation / totalPopulation * 100).toFixed(1),
    valueNumber: WhitePopulation
  },
  {
    category: "Black",
    value: (BlackPopulation / totalPopulation * 100).toFixed(1),
    valueNumber: BlackPopulation
  },
  {
    category: "Asian",
    value: (AsianPopulation / totalPopulation * 100).toFixed(1),
    valueNumber: AsianPopulation
  },
  {
    category: "Hispanic",
    value: (HispanicPopulation / totalPopulation * 100).toFixed(1),
    valueNumber: HispanicPopulation
  },
  {
    category: "Other",
    value: ((totalPopulation - AsianPopulation - WhitePopulation - HispanicPopulation - BlackPopulation) * 100 / totalPopulation).toFixed(1),
    valueNumber: (totalPopulation - AsianPopulation - WhitePopulation - HispanicPopulation - BlackPopulation)
  }
]


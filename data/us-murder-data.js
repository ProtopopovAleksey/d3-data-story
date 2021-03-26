// For 2019
// https://ucr.fbi.gov/crime-in-the-u.s/2019/crime-in-the-u.s.-2019/tables/table-43/#overview
// ROW: Murder and nonnegligent manslaughter
// :TODO Whites calculated as the difference between Whites and Hispanic, because there is no individual data for Hispanic in race column.
// :TODO I'm not sure if this calculation is correct.


const totalMurders = 7964
const Asian = 83
const Hispanic = 1341
const White = 3650 - Hispanic
const Black = 4078

const usMurders = [
  
  {
    category: "White",
    value: (White / totalMurders * 100).toFixed(1),
    valueNumber: White
  },
  {
    category: "Black",
    value: (Black / totalMurders * 100).toFixed(1),
    valueNumber: Black
  },
  {
    category: "Asian",
    value: (Asian / totalMurders * 100).toFixed(1),
    valueNumber: Asian
  },
  {
    category: "Hispanic",
    value: (Hispanic / totalMurders * 100).toFixed(1),
    valueNumber: Hispanic
  },
  {
    category: "Other",
    value: ((totalMurders - Asian - White - Hispanic - Black) * 100 / totalMurders).toFixed(1),
    valueNumber: (totalMurders - Asian - White - Hispanic - Black)
  },
]

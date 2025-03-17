import type { CovidData } from "./types"

// This function would normally fetch from a real API
// For this example, we're generating mock data
export async function fetchCovidData(): Promise<CovidData> {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // Generate mock data
  const regions = ["North America", "South America", "Europe", "Asia", "Africa", "Oceania"]

  const countries = [
    { code: "USA", name: "United States", region: "North America" },
    { code: "BRA", name: "Brazil", region: "South America" },
    { code: "IND", name: "India", region: "Asia" },
    { code: "RUS", name: "Russia", region: "Europe" },
    { code: "FRA", name: "France", region: "Europe" },
    { code: "GBR", name: "United Kingdom", region: "Europe" },
    { code: "ITA", name: "Italy", region: "Europe" },
    { code: "DEU", name: "Germany", region: "Europe" },
    { code: "ESP", name: "Spain", region: "Europe" },
    { code: "CHN", name: "China", region: "Asia" },
    { code: "MEX", name: "Mexico", region: "North America" },
    { code: "ZAF", name: "South Africa", region: "Africa" },
    { code: "PER", name: "Peru", region: "South America" },
    { code: "IRN", name: "Iran", region: "Asia" },
    { code: "COL", name: "Colombia", region: "South America" },
    { code: "ARG", name: "Argentina", region: "South America" },
    { code: "POL", name: "Poland", region: "Europe" },
    { code: "UKR", name: "Ukraine", region: "Europe" },
    { code: "IDN", name: "Indonesia", region: "Asia" },
    { code: "TUR", name: "Turkey", region: "Asia" },
    { code: "NLD", name: "Netherlands", region: "Europe" },
    { code: "CZE", name: "Czech Republic", region: "Europe" },
    { code: "CAN", name: "Canada", region: "North America" },
    { code: "CHL", name: "Chile", region: "South America" },
    { code: "JPN", name: "Japan", region: "Asia" },
    { code: "AUS", name: "Australia", region: "Oceania" },
    { code: "NZL", name: "New Zealand", region: "Oceania" },
  ]

  // Generate random data for each country
  const countryData = countries.map((country) => {
    const population = Math.floor(Math.random() * 500000000) + 1000000
    const cases = Math.floor(Math.random() * 10000000)
    const deaths = Math.floor(cases * (Math.random() * 0.05))
    const recovered = Math.floor(cases * (Math.random() * 0.8))
    const vaccinated = Math.floor(population * (Math.random() * 0.7))

    return {
      ...country,
      population,
      cases,
      deaths,
      recovered,
      vaccinated,
      casesPerMillion: Math.floor(cases / (population / 1000000)),
      deathsPerMillion: Math.floor(deaths / (population / 1000000)),
      recoveredPerMillion: Math.floor(recovered / (population / 1000000)),
      vaccinatedPerMillion: Math.floor(vaccinated / (population / 1000000)),
      newCases: Math.floor(Math.random() * 50000),
      newDeaths: Math.floor(Math.random() * 1000),
      newRecovered: Math.floor(Math.random() * 40000),
      newVaccinated: Math.floor(Math.random() * 100000),
    }
  })

  // Generate regional data by aggregating country data
  const regionalData = regions.map((region) => {
    const countriesInRegion = countryData.filter((c) => c.region === region)

    return {
      name: region,
      cases: countriesInRegion.reduce((sum, c) => sum + c.cases, 0),
      deaths: countriesInRegion.reduce((sum, c) => sum + c.deaths, 0),
      recovered: countriesInRegion.reduce((sum, c) => sum + c.recovered, 0),
      vaccinated: countriesInRegion.reduce((sum, c) => sum + c.vaccinated, 0),
      population: countriesInRegion.reduce((sum, c) => sum + c.population, 0),
    }
  })

  // Calculate global statistics
  const globalStats = {
    cases: countryData.reduce((sum, c) => sum + c.cases, 0),
    deaths: countryData.reduce((sum, c) => sum + c.deaths, 0),
    recovered: countryData.reduce((sum, c) => sum + c.recovered, 0),
    vaccinated: countryData.reduce((sum, c) => sum + c.vaccinated, 0),
    population: countryData.reduce((sum, c) => sum + c.population, 0),
    newCases: countryData.reduce((sum, c) => sum + c.newCases, 0),
    newDeaths: countryData.reduce((sum, c) => sum + c.newDeaths, 0),
    newRecovered: countryData.reduce((sum, c) => sum + c.newRecovered, 0),
    newVaccinated: countryData.reduce((sum, c) => sum + c.newVaccinated, 0),
  }

  return {
    global: globalStats,
    regions: regionalData,
    countries: countryData,
    lastUpdated: new Date().toLocaleString(),
  }
}


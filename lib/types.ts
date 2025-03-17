export interface CountryData {
  code: string
  name: string
  region: string
  population: number
  cases: number
  deaths: number
  recovered: number
  vaccinated: number
  casesPerMillion: number
  deathsPerMillion: number
  recoveredPerMillion: number
  vaccinatedPerMillion: number
  newCases: number
  newDeaths: number
  newRecovered: number
  newVaccinated: number
}

export interface RegionalData {
  name: string
  cases: number
  deaths: number
  recovered: number
  vaccinated: number
  population: number
}

export interface GlobalStats {
  cases: number
  deaths: number
  recovered: number
  vaccinated: number
  population: number
  newCases: number
  newDeaths: number
  newRecovered: number
  newVaccinated: number
}

export interface CovidData {
  global: GlobalStats
  regions: RegionalData[]
  countries: CountryData[]
  lastUpdated: string
}


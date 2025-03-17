"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import StatisticsPanel from "./statistics-panel"
import RegionalComparison from "./regional-comparison"
import CountryTable from "./country-table"
import { fetchCovidData } from "@/lib/api"
import type { CovidData } from "@/lib/types"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2 } from "lucide-react"

export default function Dashboard() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [covidData, setCovidData] = useState<CovidData | null>(null)
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null)
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const data = await fetchCovidData()
        setCovidData(data)
      } catch (err) {
        setError("Failed to load COVID-19 data. Please try again later.")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const handleCountrySelect = (countryCode: string) => {
    setSelectedCountry(countryCode)
  }

  const handleRegionSelect = (region: string) => {
    setSelectedRegion(region)
    setSelectedCountry(null)
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <span className="ml-2 text-xl">Loading COVID-19 data...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600">Error</h2>
          <p className="mt-2">{error}</p>
        </div>
      </div>
    )
  }

  const filteredCountries = selectedRegion
    ? covidData?.countries.filter((c) => c.region === selectedRegion)
    : covidData?.countries

  return (
    <div className="container mx-auto p-4">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white">COVID-19 Global Dashboard</h1>
        <p className="mt-2 text-lg text-gray-600 dark:text-gray-300">
          Interactive visualization of global COVID-19 statistics
        </p>
      </header>

      <div className="grid gap-6">
        <div>
          <StatisticsPanel
            globalStats={covidData?.global}
            countryStats={selectedCountry ? covidData?.countries.find((c) => c.code === selectedCountry) : null}
          />
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Regional Comparisons</CardTitle>
              <CardDescription>Compare COVID-19 statistics across different regions</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="cases" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="cases">Cases</TabsTrigger>
                  <TabsTrigger value="deaths">Deaths</TabsTrigger>
                  <TabsTrigger value="recovered">Recovered</TabsTrigger>
                  <TabsTrigger value="vaccinated">Vaccinated</TabsTrigger>
                </TabsList>
                {covidData && (
                  <>
                    <TabsContent value="cases">
                      <RegionalComparison
                        data={covidData.regions}
                        dataKey="cases"
                        onRegionSelect={handleRegionSelect}
                        selectedRegion={selectedRegion}
                      />
                    </TabsContent>
                    <TabsContent value="deaths">
                      <RegionalComparison
                        data={covidData.regions}
                        dataKey="deaths"
                        onRegionSelect={handleRegionSelect}
                        selectedRegion={selectedRegion}
                      />
                    </TabsContent>
                    <TabsContent value="recovered">
                      <RegionalComparison
                        data={covidData.regions}
                        dataKey="recovered"
                        onRegionSelect={handleRegionSelect}
                        selectedRegion={selectedRegion}
                      />
                    </TabsContent>
                    <TabsContent value="vaccinated">
                      <RegionalComparison
                        data={covidData.regions}
                        dataKey="vaccinated"
                        onRegionSelect={handleRegionSelect}
                        selectedRegion={selectedRegion}
                      />
                    </TabsContent>
                  </>
                )}
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Country-Level Data</CardTitle>
              <CardDescription>
                {selectedRegion
                  ? `Showing data for ${selectedRegion}`
                  : "Click on a country to view detailed statistics"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredCountries && (
                <CountryTable
                  countries={filteredCountries}
                  onCountrySelect={handleCountrySelect}
                  selectedCountry={selectedCountry}
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <footer className="mt-12 text-center text-sm text-gray-500 dark:text-gray-400">
        <p>Data source: Johns Hopkins University CSSE</p>
        <p className="mt-1">Last updated: {covidData?.lastUpdated}</p>
      </footer>
    </div>
  )
}


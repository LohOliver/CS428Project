"use client"

import * as React from "react"
import { useState } from "react"
import { CartesianGrid, Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"

// Sample data for continents
const globalData = [
  { date: "2020-01", Global: 40 },
  { date: "2020-02", Global: 45 },
  { date: "2020-03", Global: 70 },
  { date: "2020-04", Global: 80 },
  { date: "2020-05", Global: 75 },
  { date: "2020-06", Global: 65 },
]

const continentData = [
  { date: "2020-01", NA: 45, EU: 40, AS: 35, SA: 30, AF: 25, OC: 20 },
  { date: "2020-02", NA: 50, EU: 45, AS: 40, SA: 35, AF: 30, OC: 25 },
  { date: "2020-03", NA: 75, EU: 70, AS: 65, SA: 60, AF: 55, OC: 50 },
  { date: "2020-04", NA: 85, EU: 80, AS: 75, SA: 70, AF: 65, OC: 60 },
  { date: "2020-05", NA: 80, EU: 75, AS: 70, SA: 65, AF: 60, OC: 55 },
  { date: "2020-06", NA: 70, EU: 65, AS: 60, SA: 55, AF: 50, OC: 45 },
]

interface TimeSeriesChartProps {
  selectedCountry: string;  // Receive the selected country as prop
}

export function TimeSeriesChart({ selectedCountry }: TimeSeriesChartProps) {
  const [selectedRegion, setSelectedRegion] = useState("global")

  const chartData = selectedRegion === "global" ? globalData : continentData
  const keys = selectedRegion === "global" ? ["Global"] : ["NA", "EU", "AS", "SA", "AF", "OC"]

  console.log("Selected Country:", selectedCountry);  // Debugging selected country
  console.log("Chart Data:", chartData);  // Debugging chartData
  console.log("Keys:", keys);  // Debugging keys
  
  return (
    <div className={cn("space-y-4")}>
      <Select onValueChange={(value) => setSelectedRegion(value)} defaultValue="global">
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Select Region" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="global">Global Trend</SelectItem>
          <SelectItem value="region">By Continent</SelectItem>
        </SelectContent>
      </Select>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          {keys.map((key) => (
            <Line key={key} type="monotone" dataKey={key} stroke="#8884d8" />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

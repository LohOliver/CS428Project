"use client"

import { Bar, BarChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import type { RegionalData } from "@/lib/types"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface RegionalComparisonProps {
  data: RegionalData[]
  dataKey: "cases" | "deaths" | "recovered" | "vaccinated"
  onRegionSelect: (region: string) => void
  selectedRegion: string | null
}

export default function RegionalComparison({ data, dataKey, onRegionSelect, selectedRegion }: RegionalComparisonProps) {
  // Sort data by the selected metric in descending order
  const sortedData = [...data].sort((a, b) => b[dataKey] - a[dataKey])

  // Format numbers for display
  const formatNumber = (value: number) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`
    return value.toString()
  }

  // Map color based on data key
  const getColor = () => {
    switch (dataKey) {
      case "cases":
        return "hsl(var(--chart-1))"
      case "deaths":
        return "hsl(var(--chart-2))"
      case "recovered":
        return "hsl(var(--chart-3))"
      case "vaccinated":
        return "hsl(var(--chart-4))"
      default:
        return "hsl(var(--chart-1))"
    }
  }

  return (
    <div className="w-full pt-4">
      <ChartContainer
        config={{
          [dataKey]: {
            label: dataKey.charAt(0).toUpperCase() + dataKey.slice(1),
            color: getColor(),
          },
        }}
        className="h-[400px]"
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={sortedData}
            margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
            onClick={(data) => {
              if (data && data.activePayload && data.activePayload[0]) {
                const clickedRegion = data.activePayload[0].payload.name
                onRegionSelect(clickedRegion)
              }
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} tick={{ fontSize: 12 }} />
            <YAxis tickFormatter={formatNumber} tick={{ fontSize: 12 }} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar
              dataKey={dataKey}
              fill={`var(--color-${dataKey})`}
              radius={[4, 4, 0, 0]}
              cursor="pointer"
              stroke={selectedRegion ? "#000" : undefined}
              strokeWidth={0.5}
            />
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  )
}


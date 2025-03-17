"use client"

import type React from "react"

import { Card, CardContent } from "@/components/ui/card"
import type { CountryData, GlobalStats } from "@/lib/types"
import { ArrowUpIcon, ArrowDownIcon, Activity, Users, Heart, Syringe } from "lucide-react"

interface StatisticsPanelProps {
  globalStats: GlobalStats | undefined
  countryStats: CountryData | null | undefined
}

export default function StatisticsPanel({ globalStats, countryStats }: StatisticsPanelProps) {
  const stats = countryStats || globalStats

  if (!stats) return null

  const title = countryStats ? countryStats.name : "Global Statistics"

  return (
    <div className="w-full">
      <h2 className="mb-4 text-2xl font-bold">{title}</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Cases"
          value={stats.cases}
          change={stats.newCases}
          icon={<Activity className="h-8 w-8 text-blue-500" />}
          color="blue"
        />
        <StatCard
          title="Deaths"
          value={stats.deaths}
          change={stats.newDeaths}
          icon={<Users className="h-8 w-8 text-red-500" />}
          color="red"
        />
        <StatCard
          title="Recovered"
          value={stats.recovered}
          change={stats.newRecovered}
          icon={<Heart className="h-8 w-8 text-green-500" />}
          color="green"
        />
        <StatCard
          title="Vaccinated"
          value={stats.vaccinated}
          change={stats.newVaccinated}
          icon={<Syringe className="h-8 w-8 text-purple-500" />}
          color="purple"
        />
      </div>
    </div>
  )
}

interface StatCardProps {
  title: string
  value: number
  change: number
  icon: React.ReactNode
  color: "blue" | "red" | "green" | "purple"
}

function StatCard({ title, value, change, icon, color }: StatCardProps) {
  const colorClasses = {
    blue: "bg-blue-50 dark:bg-blue-900/20",
    red: "bg-red-50 dark:bg-red-900/20",
    green: "bg-green-50 dark:bg-green-900/20",
    purple: "bg-purple-50 dark:bg-purple-900/20",
  }

  return (
    <Card className={`${colorClasses[color]} border-0`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
            <h3 className="mt-1 text-2xl font-bold">{value.toLocaleString()}</h3>
            {change > 0 && (
              <div className="mt-1 flex items-center text-sm text-gray-500 dark:text-gray-400">
                <ArrowUpIcon className="mr-1 h-4 w-4 text-red-500" />
                <span>+{change.toLocaleString()} new</span>
              </div>
            )}
            {change < 0 && (
              <div className="mt-1 flex items-center text-sm text-gray-500 dark:text-gray-400">
                <ArrowDownIcon className="mr-1 h-4 w-4 text-green-500" />
                <span>{Math.abs(change).toLocaleString()} decrease</span>
              </div>
            )}
            {change === 0 && (
              <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                <span>No change</span>
              </div>
            )}
          </div>
          <div className="rounded-full p-3">{icon}</div>
        </div>
      </CardContent>
    </Card>
  )
}


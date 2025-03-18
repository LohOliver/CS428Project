"use client";

import * as React from "react";
import { Globe, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { WorldMap } from "../../components/world-map";
import { TimeSeriesChart } from "../../components/time-series-chart";
import { PolicyBreakdown } from "../../components/policy-breakdown";

export default function DashboardPage() {
  const [selectedCountry, setSelectedCountry] = React.useState<string>("USA");
  const [selectedCountryName, setSelectedCountryName] =
    React.useState<string>("United States");
  const [timeRange, setTimeRange] = React.useState("2020-2023");

  const handleCountryClick = (countryName: string) => {
    setSelectedCountryName(countryName);
    console.log(`Selected country: ${countryName} `);
  };

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="flex items-center gap-2 font-semibold">
            <Globe className="h-5 w-5" />
            <span>Global Policy Stringency Dashboard</span>
          </div>
        </div>
      </header>

      <main className="flex-1 space-y-4 p-4 md:p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold">Dashboard Overview</h1>
            <p className="text-sm text-muted-foreground">
              Track and analyze global policy responses and restrictions
            </p>
          </div>
          <div className="flex items-center gap-2">
            {selectedCountryName && (
              <div className="mr-4 text-sm font-medium">
                Selected Country:{" "}
                <span className="font-bold">{selectedCountryName}</span>
              </div>
            )}
            <Select
              defaultValue={timeRange}
              onValueChange={(value) => setTimeRange(value)}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Select time range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2020-2023">2020-2023</SelectItem>
                <SelectItem value="2020">2020</SelectItem>
                <SelectItem value="2021">2021</SelectItem>
                <SelectItem value="2022">2022</SelectItem>
                <SelectItem value="2023">2023</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-7">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Global Stringency Map
                <Info className="h-4 w-4 text-muted-foreground" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <WorldMap
                className="aspect-[6/2] w-full"
                onCountryClick={handleCountryClick}
              />
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Stringency Evolution: {selectedCountryName}</CardTitle>
            </CardHeader>
            <CardContent>
              <TimeSeriesChart
                className="h-[400px] w-full"
                country={selectedCountry}
                countryName={selectedCountryName}
              />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>
                Policy Measures Breakdown: {selectedCountryName}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <PolicyBreakdown
                className="h-[400px]"
                country={selectedCountry}
                countryName={selectedCountryName}
              />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
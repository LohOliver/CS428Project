"use client";

import * as React from "react";
import { useState, useEffect, useRef } from "react";
import * as d3 from "d3";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

// Updated sample data - Global stringency and COVID-19 metrics
const globalData = [
  {
    date: "2020-01",
    stringency: 10,
    cases: 100,
    deaths: 0,
    active: 98,
    recovered: 2,
    vaccinations: 0,
  },
  {
    date: "2020-02",
    stringency: 15,
    cases: 1000,
    deaths: 40,
    active: 850,
    recovered: 110,
    vaccinations: 0,
  },
  {
    date: "2020-03",
    stringency: 70,
    cases: 200000,
    deaths: 10000,
    active: 170000,
    recovered: 20000,
    vaccinations: 0,
  },
  {
    date: "2020-04",
    stringency: 85,
    cases: 1000000,
    deaths: 50000,
    active: 800000,
    recovered: 150000,
    vaccinations: 0,
  },
  {
    date: "2020-05",
    stringency: 80,
    cases: 2000000,
    deaths: 120000,
    active: 1200000,
    recovered: 680000,
    vaccinations: 0,
  },
  {
    date: "2020-06",
    stringency: 75,
    cases: 2800000,
    deaths: 170000,
    active: 1000000,
    recovered: 1630000,
    vaccinations: 0,
  },
  {
    date: "2020-07",
    stringency: 65,
    cases: 4000000,
    deaths: 220000,
    active: 1400000,
    recovered: 2380000,
    vaccinations: 0,
  },
  {
    date: "2020-08",
    stringency: 60,
    cases: 5500000,
    deaths: 300000,
    active: 1700000,
    recovered: 3500000,
    vaccinations: 0,
  },
  {
    date: "2020-09",
    stringency: 55,
    cases: 7000000,
    deaths: 350000,
    active: 1900000,
    recovered: 4750000,
    vaccinations: 0,
  },
  {
    date: "2020-10",
    stringency: 60,
    cases: 9000000,
    deaths: 450000,
    active: 2200000,
    recovered: 6350000,
    vaccinations: 0,
  },
  {
    date: "2020-11",
    stringency: 68,
    cases: 12000000,
    deaths: 550000,
    active: 3000000,
    recovered: 8450000,
    vaccinations: 0,
  },
  {
    date: "2020-12",
    stringency: 72,
    cases: 16000000,
    deaths: 650000,
    active: 4000000,
    recovered: 11350000,
    vaccinations: 0.5,
  },
  {
    date: "2021-01",
    stringency: 75,
    cases: 20000000,
    deaths: 780000,
    active: 4500000,
    recovered: 14720000,
    vaccinations: 2,
  },
  {
    date: "2021-02",
    stringency: 70,
    cases: 23000000,
    deaths: 900000,
    active: 4000000,
    recovered: 18100000,
    vaccinations: 5,
  },
  {
    date: "2021-03",
    stringency: 65,
    cases: 26000000,
    deaths: 1000000,
    active: 3800000,
    recovered: 21200000,
    vaccinations: 10,
  },
  {
    date: "2021-04",
    stringency: 60,
    cases: 29000000,
    deaths: 1100000,
    active: 3500000,
    recovered: 24400000,
    vaccinations: 15,
  },
  {
    date: "2021-05",
    stringency: 55,
    cases: 31000000,
    deaths: 1200000,
    active: 3000000,
    recovered: 26800000,
    vaccinations: 25,
  },
  {
    date: "2021-06",
    stringency: 45,
    cases: 33000000,
    deaths: 1300000,
    active: 2500000,
    recovered: 29200000,
    vaccinations: 35,
  },
];

// Continental data with stringency and COVID-19 metrics
const continentData = [
  {
    date: "2020-01",
    NA_stringency: 5,
    NA_cases: 0,
    NA_deaths: 0,
    EU_stringency: 5,
    EU_cases: 0,
    EU_deaths: 0,
    AS_stringency: 15,
    AS_cases: 100,
    AS_deaths: 0,
    SA_stringency: 5,
    SA_cases: 0,
    SA_deaths: 0,
    AF_stringency: 5,
    AF_cases: 0,
    AF_deaths: 0,
    OC_stringency: 5,
    OC_cases: 0,
    OC_deaths: 0,
  },
  {
    date: "2020-02",
    NA_stringency: 10,
    NA_cases: 15,
    NA_deaths: 0,
    EU_stringency: 15,
    EU_cases: 380,
    EU_deaths: 10,
    AS_stringency: 40,
    AS_cases: 75000,
    AS_deaths: 2000,
    SA_stringency: 10,
    SA_cases: 5,
    SA_deaths: 0,
    AF_stringency: 5,
    AF_cases: 0,
    AF_deaths: 0,
    OC_stringency: 15,
    OC_cases: 10,
    OC_deaths: 0,
  },
  {
    date: "2020-03",
    NA_stringency: 65,
    NA_cases: 200000,
    NA_deaths: 5000,
    EU_stringency: 75,
    EU_cases: 500000,
    EU_deaths: 30000,
    AS_stringency: 70,
    AS_cases: 250000,
    AS_deaths: 10000,
    SA_stringency: 60,
    SA_cases: 50000,
    SA_deaths: 2000,
    AF_stringency: 50,
    AF_cases: 10000,
    AF_deaths: 500,
    OC_stringency: 60,
    OC_cases: 5000,
    OC_deaths: 50,
  },
  {
    date: "2020-04",
    NA_stringency: 80,
    NA_cases: 1200000,
    NA_deaths: 70000,
    EU_stringency: 85,
    EU_cases: 1500000,
    EU_deaths: 150000,
    AS_stringency: 75,
    AS_cases: 600000,
    AS_deaths: 25000,
    SA_stringency: 75,
    SA_cases: 250000,
    SA_deaths: 12000,
    AF_stringency: 65,
    AF_cases: 50000,
    AF_deaths: 2000,
    OC_stringency: 70,
    OC_cases: 8000,
    OC_deaths: 100,
  },
  {
    date: "2020-05",
    NA_stringency: 75,
    NA_cases: 1800000,
    NA_deaths: 110000,
    EU_stringency: 75,
    EU_cases: 1800000,
    EU_deaths: 170000,
    AS_stringency: 70,
    AS_cases: 850000,
    AS_deaths: 40000,
    SA_stringency: 70,
    SA_cases: 600000,
    SA_deaths: 30000,
    AF_stringency: 60,
    AF_cases: 120000,
    AF_deaths: 5000,
    OC_stringency: 65,
    OC_cases: 9000,
    OC_deaths: 120,
  },
  {
    date: "2020-06",
    NA_stringency: 70,
    NA_cases: 2500000,
    NA_deaths: 130000,
    EU_stringency: 65,
    EU_cases: 2000000,
    EU_deaths: 180000,
    AS_stringency: 65,
    AS_cases: 1100000,
    AS_deaths: 50000,
    SA_stringency: 65,
    SA_cases: 1200000,
    SA_deaths: 60000,
    AF_stringency: 55,
    AF_cases: 250000,
    AF_deaths: 10000,
    OC_stringency: 55,
    OC_cases: 10000,
    OC_deaths: 130,
  },
];

// Country specific data
const countryData: Record<string, any[]> = {
  USA: [
    {
      date: "2020-01",
      stringency: 5,
      cases: 0,
      deaths: 0,
      active: 0,
      recovered: 0,
      vaccinations: 0,
    },
    {
      date: "2020-02",
      stringency: 10,
      cases: 15,
      deaths: 0,
      active: 15,
      recovered: 0,
      vaccinations: 0,
    },
    {
      date: "2020-03",
      stringency: 65,
      cases: 190000,
      deaths: 4000,
      active: 180000,
      recovered: 6000,
      vaccinations: 0,
    },
    {
      date: "2020-04",
      stringency: 75,
      cases: 1100000,
      deaths: 65000,
      active: 900000,
      recovered: 135000,
      vaccinations: 0,
    },
    {
      date: "2020-05",
      stringency: 70,
      cases: 1700000,
      deaths: 100000,
      active: 1000000,
      recovered: 600000,
      vaccinations: 0,
    },
    {
      date: "2020-06",
      stringency: 65,
      cases: 2300000,
      deaths: 120000,
      active: 900000,
      recovered: 1280000,
      vaccinations: 0,
    },
    {
      date: "2020-07",
      stringency: 60,
      cases: 4500000,
      deaths: 150000,
      active: 1600000,
      recovered: 2750000,
      vaccinations: 0,
    },
    {
      date: "2020-08",
      stringency: 55,
      cases: 6000000,
      deaths: 180000,
      active: 2000000,
      recovered: 3820000,
      vaccinations: 0,
    },
    {
      date: "2020-09",
      stringency: 50,
      cases: 7200000,
      deaths: 200000,
      active: 2200000,
      recovered: 4800000,
      vaccinations: 0,
    },
    {
      date: "2020-10",
      stringency: 55,
      cases: 9100000,
      deaths: 230000,
      active: 2800000,
      recovered: 6070000,
      vaccinations: 0,
    },
    {
      date: "2020-11",
      stringency: 60,
      cases: 13600000,
      deaths: 270000,
      active: 4500000,
      recovered: 8830000,
      vaccinations: 0,
    },
    {
      date: "2020-12",
      stringency: 65,
      cases: 19200000,
      deaths: 330000,
      active: 6500000,
      recovered: 12370000,
      vaccinations: 0.5,
    },
  ],
  GBR: [
    {
      date: "2020-01",
      stringency: 5,
      cases: 0,
      deaths: 0,
      active: 0,
      recovered: 0,
      vaccinations: 0,
    },
    {
      date: "2020-02",
      stringency: 10,
      cases: 20,
      deaths: 0,
      active: 20,
      recovered: 0,
      vaccinations: 0,
    },
    {
      date: "2020-03",
      stringency: 70,
      cases: 30000,
      deaths: 2000,
      active: 27000,
      recovered: 1000,
      vaccinations: 0,
    },
    {
      date: "2020-04",
      stringency: 85,
      cases: 170000,
      deaths: 25000,
      active: 130000,
      recovered: 15000,
      vaccinations: 0,
    },
    {
      date: "2020-05",
      stringency: 80,
      cases: 270000,
      deaths: 38000,
      active: 170000,
      recovered: 62000,
      vaccinations: 0,
    },
    {
      date: "2020-06",
      stringency: 75,
      cases: 310000,
      deaths: 43000,
      active: 150000,
      recovered: 117000,
      vaccinations: 0,
    },
  ],
  // More countries...
};

// Add more countries with same structure (sample data, not real)
const countries = ["USA", "GBR", "DEU", "FRA", "ITA", "ESP", "BRA", "IND"];
const countryNames = {
  USA: "United States",
  GBR: "United Kingdom",
  DEU: "Germany",
  FRA: "France",
  ITA: "Italy",
  ESP: "Spain",
  BRA: "Brazil",
  IND: "India",
};

// Generate sample data for countries that don't have defined data
countries.forEach((country) => {
  if (!countryData[country] || countryData[country].length < 5) {
    countryData[country] = globalData.map((entry) => {
      const randomFactor = 0.5 + Math.random();
      return {
        date: entry.date,
        stringency: Math.min(
          100,
          Math.max(0, entry.stringency * (0.8 + Math.random() * 0.4))
        ),
        cases: Math.floor(entry.cases * randomFactor * 0.3),
        deaths: Math.floor(entry.deaths * randomFactor * 0.25),
        active: Math.floor(entry.active * randomFactor * 0.3),
        recovered: Math.floor(entry.recovered * randomFactor * 0.35),
        vaccinations: Math.min(100, entry.vaccinations * randomFactor * 1.2),
      };
    });
  }
});

interface TimeSeriesChartProps {
  selectedCountry: string; // Receive the selected country as prop
}

export function TimeSeriesChart({ selectedCountry }: TimeSeriesChartProps) {
  const [selectedRegion, setSelectedRegion] = useState("country");
  const [selectedMetric, setSelectedMetric] = useState("cases");

  // Refs for chart container and tooltip
  const chartRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Define colors for consistent styling
  const colors = {
    stringency: "#2563eb", // Blue
    cases: "#ef4444", // Red
    deaths: "#000000", // Black
    active: "#f97316", // Orange
    recovered: "#10b981", // Green
    vaccinations: "#8b5cf6", // Purple
    NA: "#3b82f6", // North America - Blue
    EU: "#ef4444", // Europe - Red
    AS: "#f59e0b", // Asia - Amber
    SA: "#10b981", // South America - Green
    AF: "#8b5cf6", // Africa - Purple
    OC: "#ec4899", // Oceania - Pink
  };

  // Define metric labels
  const metricLabels = {
    cases: "Total Cases",
    deaths: "Total Deaths",
    active: "Active Cases",
    recovered: "Recovered",
    vaccinations: "Vaccination Rate (%)",
  };

  
  // Get chart data based on selection
  const getChartData = () => {
    if (selectedRegion === "country") {
      return countryData[selectedCountry] || countryData["USA"];
    } else if (selectedRegion === "global") {
      return globalData;
    } else {
      return continentData;
    }
  };

  // Get keys for lines based on selection
  const getLineKeys = () => {
    if (selectedRegion === "continent") {
      return ["NA", "EU", "AS", "SA", "AF", "OC"];
    }
    return [selectedMetric];
  };

  // Format large numbers for tooltip
  const formatNumber = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toString();
  };

  // D3 chart creation effect
  useEffect(() => {
    if (!chartRef.current) return;

    // Clear previous chart
    d3.select(chartRef.current).selectAll("*").remove();

    // Get data based on selection
    const chartData = getChartData();

    // Set up dimensions
    const margin = { top: 20, right: 65, left: 60, bottom: 40 };
    const width = chartRef.current.clientWidth - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    // Create SVG
    const svg = d3
      .select(chartRef.current)
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Create tooltip if it doesn't exist
    const tooltip = d3
      .select(tooltipRef.current)
      .style("opacity", 0)
      .attr(
        "class",
        "absolute bg-white p-2 border rounded shadow-lg text-sm pointer-events-none z-50"
      );


      // Dual-axis chart for country/global view

      // Create x scale
      const x = d3
        .scaleBand()
        .domain(chartData.map((d) => d.date))
        .range([0, width])
        .padding(0.1);

      // Find max values
      const maxStringency = d3.max(chartData, (d) => d.stringency) || 0;
      const maxMetric = d3.max(chartData, (d) => d[selectedMetric]) || 0;

      // Create y scales (left for stringency, right for selected metric)
      const yLeft = d3
        .scaleLinear()
        .domain([0, 100]) // Stringency is always 0-100
        .range([height, 0]);

      const yRight = d3
        .scaleLinear()
        .domain([0, maxMetric * 1.1]) // Add 10% padding at top
        .nice()
        .range([height, 0]);

      // Add x axis
      svg
        .append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x));

      // Add left y axis (stringency)
      svg.append("g").call(d3.axisLeft(yLeft).ticks(5));

      // Add right y axis (selected metric)
      svg
        .append("g")
        .attr("transform", `translate(${width}, 0)`)
        .call(
          d3
            .axisRight(yRight)
            .ticks(5)
            .tickFormat((d) => formatNumber(+d))
        );

      // Add grid lines
      svg
        .append("g")
        .attr("class", "grid")
        .call(
          d3
            .axisLeft(yLeft)
            .ticks(5)
            .tickSize(-width)
            .tickFormat(() => "")
        )
        .selectAll("line")
        .style("stroke", "#e2e8f0")
        .style("stroke-opacity", 0.5);

      // Create line generators
      const stringencyLine = d3
        .line<any>()
        .x((d) => x(d.date) || 0)
        .y((d) => yLeft(d.stringency))
        .curve(d3.curveMonotoneX);

      const metricLine = d3
        .line<any>()
        .x((d) => x(d.date) || 0)
        .y((d) => yRight(d[selectedMetric]))
        .curve(d3.curveMonotoneX);

      // Add stringency line
      svg
        .append("path")
        .datum(chartData)
        .attr("fill", "none")
        .attr("stroke", colors.stringency)
        .attr("stroke-width", 3)
        .attr("d", stringencyLine);

      // Add metric line
      svg
        .append("path")
        .datum(chartData)
        .attr("fill", "none")
        .attr("stroke", colors[selectedMetric])
        .attr("stroke-width", 3)
        .attr("d", metricLine);

      // Add area under metric line
      const areaGenerator = d3
        .area<any>()
        .x((d) => x(d.date) || 0)
        .y0(height)
        .y1((d) => yRight(d[selectedMetric]))
        .curve(d3.curveMonotoneX);

      svg
        .append("path")
        .datum(chartData)
        .attr("fill", colors[selectedMetric])
        .attr("fill-opacity", 0.1)
        .attr("d", areaGenerator);

      // Add points for stringency
      svg
        .selectAll(".point-stringency")
        .data(chartData)
        .enter()
        .append("circle")
        .attr("class", "point-stringency")
        .attr("cx", (d) => x(d.date) || 0)
        .attr("cy", (d) => yLeft(d.stringency))
        .attr("r", 4)
        .attr("fill", colors.stringency)
        .on("mouseover", function (event, d) {
          // Show tooltip
          tooltip.transition().duration(200).style("opacity", 1);

          tooltip
            .html(
              `
            <div class="font-medium">${d.date}</div>
            <div style="color:${colors.stringency}">Stringency Index: ${d.stringency}%</div>
          `
            )
            .style("left", `${event.pageX + 10}px`)
            .style("top", `${event.pageY - 28}px`);

          // Highlight point
          d3.select(this)
            .attr("r", 6)
            .attr("stroke", "#fff")
            .attr("stroke-width", 2);
        })
        .on("mouseout", function () {
          // Hide tooltip
          tooltip.transition().duration(500).style("opacity", 0);

          // Reset point
          d3.select(this).attr("r", 4).attr("stroke", "none");
        });

      // Add points for metric
      svg
        .selectAll(".point-metric")
        .data(chartData)
        .enter()
        .append("circle")
        .attr("class", "point-metric")
        .attr("cx", (d) => x(d.date) || 0)
        .attr("cy", (d) => yRight(d[selectedMetric]))
        .attr("r", 4)
        .attr("fill", colors[selectedMetric])
        .on("mouseover", function (event, d) {
          // Show tooltip
          tooltip.transition().duration(200).style("opacity", 1);

          let tooltipContent = `
            <div class="font-medium">${d.date}</div>
            <div style="color:${colors[selectedMetric]}">
              ${metricLabels[selectedMetric]}: ${
            selectedMetric === "vaccinations"
              ? d[selectedMetric] + "%"
              : formatNumber(d[selectedMetric])
          }
            </div>
          `;

          tooltip
            .html(tooltipContent)
            .style("left", `${event.pageX + 10}px`)
            .style("top", `${event.pageY - 28}px`);

          // Highlight point
          d3.select(this)
            .attr("r", 6)
            .attr("stroke", "#fff")
            .attr("stroke-width", 2);
        })
        .on("mouseout", function () {
          // Hide tooltip
          tooltip.transition().duration(500).style("opacity", 0);

          // Reset point
          d3.select(this).attr("r", 4).attr("stroke", "none");
        });

      // Add legend
      const legend = svg.append("g").attr("font-size", "12px");

      // Stringency Legend
      const stringencyLegend = legend
        .append("g")
        .attr("transform", "translate(0, 0)");

      stringencyLegend
        .append("line")
        .attr("x1", 0)
        .attr("y1", 6)
        .attr("x2", 15)
        .attr("y2", 6)
        .attr("stroke", colors.stringency)
        .attr("stroke-width", 3);

      stringencyLegend
        .append("text")
        .attr("x", 20)
        .attr("y", 9)
        .text("Stringency Index");

      // Metric Legend
      const metricLegend = legend
        .append("g")
        .attr("transform", "translate(0, 20)");

      metricLegend
        .append("line")
        .attr("x1", 0)
        .attr("y1", 6)
        .attr("x2", 15)
        .attr("y2", 6)
        .attr("stroke", colors[selectedMetric])
        .attr("stroke-width", 3);

      metricLegend
        .append("text")
        .attr("x", 20)
        .attr("y", 9)
        .text(metricLabels[selectedMetric]);

      // Add axes labels
      svg
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", -margin.left + 15)
        .attr("x", -height / 2)
        .attr("text-anchor", "middle")
        .style("font-size", "12px")
        .text("Stringency Index (%)");

      svg
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", width + margin.right - 15)
        .attr("x", -height / 2)
        .attr("text-anchor", "middle")
        .style("font-size", "12px")
        .style("fill", colors[selectedMetric])
        .text(metricLabels[selectedMetric]);
    

    // Handle resize
    const handleResize = () => {
      if (!chartRef.current) return;

      // Clear and redraw chart
      d3.select(chartRef.current).selectAll("*").remove();
      // Full redraw is easier than updating all elements

      // TODO: redraw chart with new dimensions
      // This would need to recreate the SVG and all elements
    };

    // Add resize listener
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [selectedRegion, selectedMetric, selectedCountry]);

  return (
    <Card>
      <CardContent>
        <div className="space-y-4 pt-6">
          <div className="flex flex-wrap gap-4 items-center">
            <Tabs
              defaultValue={selectedMetric}
              onValueChange={setSelectedMetric}
              className="w-auto"
            >
              <TabsList>
                <TabsTrigger value="global">Global Index</TabsTrigger>
                <TabsTrigger value="cases">Cases</TabsTrigger>
                <TabsTrigger value="deaths">Deaths</TabsTrigger>
                <TabsTrigger value="active">Active</TabsTrigger>
                <TabsTrigger value="recovered">Recovered</TabsTrigger>
                <TabsTrigger value="vaccinations">Vaccinations</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div ref={chartRef} className="w-full h-96"></div>

          <div
            ref={tooltipRef}
            className="absolute bg-white p-2 border rounded shadow-md opacity-0 pointer-events-none z-50"
            style={{ position: "absolute", opacity: 0 }}
          ></div>

          <div className="text-sm text-muted-foreground">
            {selectedRegion !== "continent" ? (
              <p>
                This chart shows the relationship between policy stringency
                measures (blue line) and{" "}
                {metricLabels[selectedMetric].toLowerCase()} (
                {selectedMetric === "vaccinations"
                  ? "purple"
                  : colors[selectedMetric]}{" "}
                line) over time.
              </p>
            ) : (
              <p>
                This chart compares {metricLabels[selectedMetric].toLowerCase()}{" "}
                across different continents. NA: North America, EU: Europe, AS:
                Asia, SA: South America, AF: Africa, OC: Oceania.
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

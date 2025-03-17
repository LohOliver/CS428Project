"use client"

import { useEffect, useRef } from "react"
import * as d3 from "d3"
import { geoNaturalEarth1, geoPath } from "d3-geo"
import { feature } from "topojson-client"
import type { CountryData } from "@/lib/types"

interface WorldMapProps {
  data: CountryData[]
  onCountrySelect: (countryCode: string) => void
  selectedCountry: string | null
}

export default function WorldMap({ data, onCountrySelect, selectedCountry }: WorldMapProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!data.length || !svgRef.current || !tooltipRef.current || !wrapperRef.current) return

    const width = wrapperRef.current.clientWidth
    const height = width * 0.5

    // Clear previous SVG content
    const svg = d3.select(svgRef.current)
    svg.selectAll("*").remove()

    svg
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [0, 0, width, height])
      .attr("style", "max-width: 100%; height: auto;")

    const tooltip = d3
      .select(tooltipRef.current)
      .style("position", "absolute")
      .style("visibility", "hidden")
      .style("background-color", "rgba(0, 0, 0, 0.8)")
      .style("color", "white")
      .style("padding", "8px")
      .style("border-radius", "4px")
      .style("font-size", "12px")
      .style("pointer-events", "none")
      .style("z-index", "10")

    // Create a map of country data by code for quick lookup
    const countryDataMap = new Map(data.map((d) => [d.code, d]))

    // Create color scale for cases per million
    const colorScale = d3.scaleSequential(d3.interpolateYlOrRd).domain([0, d3.max(data, (d) => d.casesPerMillion) || 0])

    // Load world map data
    d3.json("/world-110m.json").then((worldData: any) => {
      const countries = feature(worldData, worldData.objects.countries)

      // Create projection
      const projection = geoNaturalEarth1().fitSize([width, height], countries)

      // Create path generator
      const pathGenerator = geoPath().projection(projection)

      // Draw countries
      svg
        .selectAll("path")
        .data(countries.features)
        .enter()
        .append("path")
        .attr("d", pathGenerator)
        .attr("fill", (d: any) => {
          const countryData = countryDataMap.get(d.id)
          return countryData ? colorScale(countryData.casesPerMillion) : "#ccc"
        })
        .attr("stroke", "#fff")
        .attr("stroke-width", 0.5)
        .attr("class", (d: any) => `country ${d.id === selectedCountry ? "selected" : ""}`)
        .classed("selected", (d: any) => d.id === selectedCountry)
        .style("cursor", "pointer")
        .on("mouseover", function (event, d: any) {
          const countryData = countryDataMap.get(d.id)
          if (countryData) {
            d3.select(this).attr("stroke-width", 1.5)
            tooltip.style("visibility", "visible").html(`
                <strong>${countryData.name}</strong><br/>
                Cases: ${countryData.cases.toLocaleString()}<br/>
                Deaths: ${countryData.deaths.toLocaleString()}<br/>
                Recovered: ${countryData.recovered.toLocaleString()}<br/>
                Vaccinated: ${countryData.vaccinated.toLocaleString()}
              `)
          }
        })
        .on("mousemove", (event) => {
          tooltip.style("top", `${event.pageY - 10}px`).style("left", `${event.pageX + 10}px`)
        })
        .on("mouseout", function () {
          d3.select(this).attr("stroke-width", 0.5)
          tooltip.style("visibility", "hidden")
        })
        .on("click", (event, d: any) => {
          onCountrySelect(d.id)
        })

      // Update selected country
      if (selectedCountry) {
        svg
          .selectAll(".country")
          .attr("stroke-width", (d: any) => (d.id === selectedCountry ? 2 : 0.5))
          .attr("stroke", (d: any) => (d.id === selectedCountry ? "#000" : "#fff"))
      }

      // Add legend
      const legendWidth = 200
      const legendHeight = 20
      const legendX = width - legendWidth - 20
      const legendY = height - 40

      const legendScale = d3
        .scaleLinear()
        .domain([0, d3.max(data, (d) => d.casesPerMillion) || 0])
        .range([0, legendWidth])

      const legendAxis = d3
        .axisBottom(legendScale)
        .ticks(5)
        .tickFormat((d) => `${d}`)

      const legend = svg.append("g").attr("transform", `translate(${legendX}, ${legendY})`)

      // Create gradient for legend
      const defs = svg.append("defs")
      const linearGradient = defs
        .append("linearGradient")
        .attr("id", "legend-gradient")
        .attr("x1", "0%")
        .attr("y1", "0%")
        .attr("x2", "100%")
        .attr("y2", "0%")

      // Add color stops to gradient
      const colorDomain = colorScale.domain()
      linearGradient.append("stop").attr("offset", "0%").attr("stop-color", colorScale(colorDomain[0]))

      linearGradient.append("stop").attr("offset", "100%").attr("stop-color", colorScale(colorDomain[1]))

      // Draw legend rectangle
      legend
        .append("rect")
        .attr("width", legendWidth)
        .attr("height", legendHeight)
        .style("fill", "url(#legend-gradient)")

      // Add legend axis
      legend.append("g").attr("transform", `translate(0, ${legendHeight})`).call(legendAxis).select(".domain").remove()

      // Add legend title
      legend.append("text").attr("x", 0).attr("y", -5).style("font-size", "12px").text("Cases per million")
    })

    // Handle window resize
    const handleResize = () => {
      if (wrapperRef.current) {
        const newWidth = wrapperRef.current.clientWidth
        const newHeight = newWidth * 0.5

        svg.attr("width", newWidth).attr("height", newHeight).attr("viewBox", [0, 0, newWidth, newHeight])
      }
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [data, selectedCountry, onCountrySelect])

  return (
    <div ref={wrapperRef} className="relative w-full">
      <svg ref={svgRef} className="w-full"></svg>
      <div ref={tooltipRef} className="absolute pointer-events-none"></div>
    </div>
  )
}


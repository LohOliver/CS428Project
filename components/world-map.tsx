"use client";

import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import * as topojson from "topojson-client";
import { Feature, FeatureCollection, Geometry, GeoJsonProperties } from "geojson";

interface WorldMapProps {
  className?: string;
  onCountryClick?: (countryName: string) => void;
}

export const WorldMap: React.FC<WorldMapProps> = ({
  className,
  onCountryClick,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const fetchData = async () => {
      try {
        // Fetch world map data - using a more reliable source
        const response = await fetch(
          "https://unpkg.com/world-atlas@2.0.2/countries-50m.json"
        );
        const data = await response.json();
        console.log("Fetched map data:", data);
        drawMap(data);
      } catch (error) {
        console.error("Error fetching map data:", error);
      }
    };

    fetchData();

    // Cleanup function
    return () => {
      if (svgRef.current) {
        d3.select(svgRef.current).selectAll("*").remove();
      }
    };
  }, []);

  const drawMap = (worldData: any) => {
    if (!svgRef.current) return;

    // Clear previous contents
    d3.select(svgRef.current).selectAll("*").remove();

    // Set up the svg container
    const svg = d3.select(svgRef.current);
    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;

    // Create tooltip if it doesn't exist
    if (!tooltipRef.current) {
      const tooltipDiv = document.createElement("div");
      tooltipDiv.className = "absolute hidden p-2 bg-black bg-opacity-70 text-white text-xs rounded pointer-events-none";
      document.body.appendChild(tooltipDiv);
      tooltipRef.current = tooltipDiv;
    }

    // Create a projection
    const projection = d3
      .geoMercator()
      .scale((width - 3) / (2 * Math.PI))
      .translate([width / 2, height / 2 + height * 0.2]);

    // Create a path generator
    const path = d3.geoPath().projection(projection);

    // Convert TopoJSON to GeoJSON
    const geoData = topojson.feature(
      worldData, 
      worldData.objects.countries || worldData.objects.land || worldData.objects.nations
    );
    
    // Ensure we have a FeatureCollection
    const countries = geoData.type === "FeatureCollection" 
      ? geoData 
      : { type: "FeatureCollection", features: [geoData] };

    // Color scale for countries
    const colorScale = d3
      .scaleSequential(d3.interpolateBlues)
      .domain([0, 100]);

    // Draw countries
    svg
      .selectAll("path.country")
      .data(countries.features)
      .enter()
      .append("path")
      .attr("class", "country")
      .attr("d", path as any)
      .attr("fill", (d: any) => {
        // Just a placeholder; in a real app, you'd use actual data
        return d.properties.iso_a3 === selectedCountry 
          ? "#1d4ed8" // Selected country in darker blue
          : colorScale(Math.random() * 30 + 10); // Random light blue for other countries
      })
      .attr("stroke", "#ddd")
      .attr("stroke-width", 0.5)
      .style("cursor", "pointer") // Add pointer cursor to indicate clickable
      .on("mouseover", function(event, d: any) {
        d3.select(this)
          .attr("stroke", "#333")
          .attr("stroke-width", 1.5);
        
        const tooltip = d3.select(tooltipRef.current!);
        tooltip
          .html(d.properties.name || "Unknown")
          .style("left", `${event.pageX + 10}px`)
          .style("top", `${event.pageY - 28}px`)
          .classed("hidden", false);
      })
      .on("mousemove", function(event) {
        const tooltip = d3.select(tooltipRef.current!);
        tooltip
          .style("left", `${event.pageX + 10}px`)
          .style("top", `${event.pageY - 28}px`);
      })
      .on("mouseout", function() {
        d3.select(this)
          .attr("stroke", "#ddd")
          .attr("stroke-width", 0.5);
        
        d3.select(tooltipRef.current!)
          .classed("hidden", true);
      })
      .on("click", function(event, d: any) {
        // Log the full properties object to see what's available
        console.log("Full country properties:", d.properties);
        
        // Try multiple potential property names for country name
        const countryName = d.properties.name || d.properties.name_long || 
                            d.properties.admin || d.properties.ADMIN || "Unknown";
        
        // Try multiple potential property names for country code (for highlighting)
        const countryCode = d.properties.iso_a3 || d.properties.adm0_a3 || 
                            d.properties.iso_n3 || d.properties.id || d.id || "UNK";
        
        // Log click for debugging
        console.log(`Clicked on country:`, {
          name: countryName,
          code: countryCode,
          rawData: d
        });
        
        // Update internal state (still keep track of code for highlighting)
        setSelectedCountry(countryCode);
        
        // Call the callback function with just the country name to match Dashboard expectations
        if (onCountryClick) {
          console.log(`Calling onCountryClick with: ${countryName}`);
          onCountryClick(countryName);
        }
      });
  };

  return (
    <div className={`relative ${className || ""}`}>
      <svg 
        ref={svgRef} 
        className="w-full h-full"
        style={{ minHeight: "300px" }}
      />
    </div>
  );
};
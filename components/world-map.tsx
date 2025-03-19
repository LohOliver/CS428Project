"use client";

import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import * as topojson from "topojson-client";
import { Feature, FeatureCollection, Geometry, GeoJsonProperties } from "geojson";

interface StringencyData {
  country: string;
  code: string;
  value: number;
  date?: string; // Changed from year to date string (YYYY-MM-DD)
}

// Updated interface for time series data using date strings as keys
interface TimeSeriesData {
  [dateKey: string]: StringencyData[];
}

interface WorldMapProps {
  className?: string;
  onCountryClick?: (countryName: string) => void;
  stringencyData?: StringencyData[];
  timeSeriesData?: TimeSeriesData; // Time series data with date keys
  maxStringency?: number;
  availableDates?: string[]; // Array of available dates in YYYY-MM-DD format
}

export const WorldMap: React.FC<WorldMapProps> = ({
  className,
  onCountryClick,
  stringencyData = [],
  timeSeriesData = {},
  maxStringency = 100,
  availableDates = [],
}) => {
  // If no dates are provided but we have timeSeriesData, extract dates from it
  const actualDates = availableDates.length > 0 
    ? availableDates 
    : Object.keys(timeSeriesData).sort();
  
  console.log("Available dates:", actualDates);

  const svgRef = useRef<SVGSVGElement>(null);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const legendRef = useRef<SVGGElement>(null);
  
  // Animation state - now using date strings
  const [currentDateIndex, setCurrentDateIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [animationSpeed, setAnimationSpeed] = useState<number>(1000); // ms between frames
  const animationRef = useRef<number | null>(null);
  const lastFrameTimeRef = useRef<number>(0);

  // World data cache to avoid repeated fetching
  const [worldData, setWorldData] = useState<any>(null);

  // Already defined currentDate above
  
  // Format the date for display
  const formatDisplayDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Get the current date string from the index
  const currentDate = actualDates.length > 0 ? actualDates[currentDateIndex] : "";
  
  // Determine which data to use - either the static stringencyData or the date's data from timeSeriesData
  const activeData = timeSeriesData[currentDate] || stringencyData;

  // Effect for fetching world map data
  useEffect(() => {
    const fetchData = async () => {
      if (worldData) return; // Skip if we already have data
      
      try {
        const response = await fetch(
          "https://unpkg.com/world-atlas@2.0.2/countries-50m.json"
        );
        const data = await response.json();
        console.log("Fetched map data:", data);
        setWorldData(data);
      } catch (error) {
        console.error("Error fetching map data:", error);
      }
    };

    fetchData();

    // Cleanup function
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  // Effect for drawing the map when data changes
  useEffect(() => {
    if (worldData) {
      drawMap(worldData);
    }
  }, [worldData, activeData, maxStringency, selectedCountry, currentDate]);
  
  // Debug effect to see if data is available
  useEffect(() => {
    console.log("Component state:", {
      hasWorldData: !!worldData,
      availableDatesCount: actualDates.length,
      currentDate,
      firstFewDates: actualDates.slice(0, 3),
      hasTimeSeriesData: Object.keys(timeSeriesData).length > 0,
    });
  }, [worldData, timeSeriesData, actualDates, currentDate]);

  // Animation loop
  useEffect(() => {
    if (!isPlaying || actualDates.length <= 1) return;

    const animate = (timestamp: number) => {
      if (timestamp - lastFrameTimeRef.current >= animationSpeed) {
        lastFrameTimeRef.current = timestamp;
        
        // Move to next date or loop back to start
        setCurrentDateIndex(prevIndex => (prevIndex + 1) % actualDates.length);
      }
      
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, currentDateIndex, actualDates, animationSpeed]);

  const togglePlayPause = () => {
    setIsPlaying(prev => !prev);
    lastFrameTimeRef.current = performance.now();
  };

  const handleDateSliderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newIndex = parseInt(event.target.value, 10);
    setCurrentDateIndex(newIndex);
  };

  const stepForward = () => {
    setCurrentDateIndex(prevIndex => (prevIndex + 1) % actualDates.length);
  };

  const stepBackward = () => {
    setCurrentDateIndex(prevIndex => (prevIndex - 1 + actualDates.length) % actualDates.length);
  };

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

    // Create a map of country codes to stringency values for faster lookup
    const stringencyMap = new Map();
    activeData.forEach(d => {
      stringencyMap.set(d.code.toUpperCase(), d.value);
    });

    // Color scale for countries based on stringency
    const colorScale = d3
      .scaleSequential(d3.interpolateBlues)
      .domain([0, maxStringency]);

    // Draw countries
    svg
      .selectAll("path.country")
      .data(countries.features)
      .enter()
      .append("path")
      .attr("class", "country")
      .attr("d", path as any)
      .attr("fill", (d: any) => {
        // Get country code
        const countryCode = (d.properties.iso_a3 || d.properties.adm0_a3 || "").toUpperCase();
        
        // Get stringency value if available
        const stringencyValue = stringencyMap.get(countryCode);
        
        if (d.properties.iso_a3 === selectedCountry) {
          return "#1d4ed8"; // Selected country in darker blue
        } else if (stringencyValue !== undefined) {
          return colorScale(stringencyValue); // Use stringency value for color
        } else {
          return "#f0f0f0"; // Light gray for countries without data
        }
      })
      .attr("stroke", "#ddd")
      .attr("stroke-width", 0.5)
      .style("cursor", "pointer") // Add pointer cursor to indicate clickable
      .on("mouseover", function(event, d: any) {
        d3.select(this)
          .attr("stroke", "#333")
          .attr("stroke-width", 1.5);
        
        // Get country code for data lookup
        const countryCode = (d.properties.iso_a3 || d.properties.adm0_a3 || "").toUpperCase();
        const stringencyValue = stringencyMap.get(countryCode);
        
        const tooltip = d3.select(tooltipRef.current!);
        const countryName = d.properties.name || "Unknown";
        const valueText = stringencyValue !== undefined 
          ? `<br/>Stringency: ${stringencyValue.toFixed(1)}` 
          : "<br/>No data available";
          
        tooltip
          .html(`${countryName}${valueText}`)
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

    // Add legend
    drawLegend(svg, colorScale, width, height);
    
    // Add date title if using time series data
    if (actualDates.length > 0) {
      svg.append("text")
        .attr("class", "date-title")
        .attr("x", width / 2)
        .attr("y", 30)
        .attr("text-anchor", "middle")
        .style("font-size", "24px")
        .style("font-weight", "bold")
        .text(formatDisplayDate(currentDate));
    }
  };

  const drawLegend = (svg: d3.Selection<SVGSVGElement, unknown, null, undefined>, 
                      colorScale: d3.ScaleSequential<string, never>, 
                      width: number, 
                      height: number) => {
    // Legend configuration
    const legendWidth = 20;
    const legendHeight = 200;
    const legendX = width - legendWidth - 20; // Position on right side with margin
    const legendY = height / 2 - legendHeight / 2; // Vertically centered
    
    // Create legend group
    const legend = svg.append("g")
      .attr("class", "legend")
      .attr("transform", `translate(${legendX}, ${legendY})`);
    
    // Create gradient for legend
    const gradient = legend.append("defs")
      .append("linearGradient")
      .attr("id", "legend-gradient")
      .attr("x1", "0%")
      .attr("y1", "100%")
      .attr("x2", "0%")
      .attr("y2", "0%");
    
    // Add gradient stops
    const numStops = 10;
    for (let i = 0; i <= numStops; i++) {
      const offset = i / numStops;
      const value = maxStringency * offset;
      gradient.append("stop")
        .attr("offset", `${offset * 100}%`)
        .attr("stop-color", colorScale(value));
    }
    
    // Add gradient rectangle
    legend.append("rect")
      .attr("width", legendWidth)
      .attr("height", legendHeight)
      .style("fill", "url(#legend-gradient)")
      .style("stroke", "#ddd")
      .style("stroke-width", "1px");
    
    // Add legend title
    legend.append("text")
      .attr("x", legendWidth / 2)
      .attr("y", -10)
      .attr("text-anchor", "middle")
      .style("font-size", "12px")
      .text("Stringency Index");
    
    // Add legend ticks and labels
    const ticks = [0, 25, 50, 75, 100];
    ticks.forEach(tick => {
      const yPos = legendHeight * (1 - tick / maxStringency);
      
      // Add tick line
      legend.append("line")
        .attr("x1", -5)
        .attr("y1", yPos)
        .attr("x2", legendWidth)
        .attr("y2", yPos)
        .style("stroke", "#333")
        .style("stroke-width", 1);
      
      // Add tick label
      legend.append("text")
        .attr("x", -8)
        .attr("y", yPos)
        .attr("text-anchor", "end")
        .attr("dominant-baseline", "middle")
        .style("font-size", "10px")
        .text(tick.toString());
    });
  };

  // Function to get custom date tick labels
  const getTickLabels = () => {
    if (actualDates.length <= 1) return [];
    
    // For fewer dates, show more labels
    if (actualDates.length <= 12) {
      return actualDates.map((date, index) => ({
        index,
        label: new Date(date).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })
      }));
    }
    
    // For many dates, show fewer labels
    const tickCount = 5;
    const step = Math.floor(actualDates.length / (tickCount - 1));
    const ticks = [];
    
    for (let i = 0; i < actualDates.length; i += step) {
      if (ticks.length < tickCount - 1) {
        ticks.push({
          index: i,
          label: new Date(actualDates[i]).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })
        });
      }
    }
    
    // Always include the last date
    if (ticks.length > 0 && ticks[ticks.length - 1].index !== actualDates.length - 1) {
      ticks.push({
        index: actualDates.length - 1,
        label: new Date(actualDates[actualDates.length - 1]).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })
      });
    }
    
    return ticks;
  };

  // Get tick labels for the slider
  const tickLabels = getTickLabels();

  return (
    <div className={`relative ${className || ""}`}>
      <svg 
        ref={svgRef} 
        className="w-full h-full"
        style={{ minHeight: "300px" }}
      />
      
      {/* Animation controls - only show if we have time series data */}
      {actualDates.length > 1 && (
        <div className="flex flex-col items-center mt-4 w-full">
          <div className="text-xl font-bold mb-2">
            Stringency Index for {formatDisplayDate(currentDate)}
          </div>
          
          <div className="flex items-center space-x-4 mb-2">
            <button
              onClick={stepBackward}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-1 px-3 rounded"
              aria-label="Previous date"
            >
              &#9664;
            </button>
            
            <button
              onClick={togglePlayPause}
              className="bg-blue-600 hover:bg-blue-700 text-white py-1 px-4 rounded flex items-center justify-center w-20"
            >
              {isPlaying ? "Pause" : "Play"}
            </button>
            
            <button
              onClick={stepForward}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-1 px-3 rounded"
              aria-label="Next date"
            >
              &#9654;
            </button>
          </div>
          
          {/* Date slider with custom tick marks */}
          <div className="flex flex-col w-full max-w-lg mb-4">
            <input
              type="range"
              min={0}
              max={actualDates.length - 1}
              value={currentDateIndex}
              step={1}
              onChange={handleDateSliderChange}
              className="w-full mb-1"
            />
            
            <div className="relative w-full h-6">
              {tickLabels.map(tick => (
                <div 
                  key={tick.index}
                  className="absolute transform -translate-x-1/2 text-xs"
                  style={{
                    left: `${(tick.index / (actualDates.length - 1)) * 100}%`,
                  }}
                >
                  {tick.label}
                </div>
              ))}
            </div>
          </div>
          
          <div className="mt-2 flex items-center">
            <label className="text-sm mr-2">Animation Speed:</label>
            <input
              type="range"
              min={100}
              max={3000}
              step={100}
              value={animationSpeed}
              onChange={(e) => setAnimationSpeed(Number(e.target.value))}
              className="w-32"
            />
            <span className="ml-2 text-xs">
              {animationSpeed < 500 ? "Fast" : animationSpeed > 1500 ? "Slow" : "Medium"}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
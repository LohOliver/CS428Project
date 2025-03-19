"use client"
import * as React from "react"
import { useState, useEffect, useMemo, useRef } from "react"
import * as d3 from "d3"
import { cn } from "@/lib/utils"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

// Define types for raw policy data
interface RawPolicyData {
  COUNTRY: string;
  Region: string;
  Category: string;
  date_implemented: string;
}

// Define types for processed policy counts
interface PolicyCount {
  name: string;
  count: number;
  policies?: RawPolicyData[]; // Store the actual policies for tooltip details
}

interface PolicyBreakdownProps {
  className?: string;
  country?: string;
  countryName?: string;
  selectedDate?: string;
  rawData: RawPolicyData[];
  onDateChange?: (date: string) => void;
}

// Sample raw data (you would replace this with your actual data)
const sampleRawData: RawPolicyData[] = [
  { COUNTRY: "USA", Region: "National", Category: "School Closures", date_implemented: "2020-03-15" },
  { COUNTRY: "USA", Region: "National", Category: "School Closures", date_implemented: "2020-03-16" },
  { COUNTRY: "USA", Region: "National", Category: "School Closures", date_implemented: "2020-03-20" },
  { COUNTRY: "USA", Region: "National", Category: "Workplace Closures", date_implemented: "2020-03-17" },
  { COUNTRY: "USA", Region: "National", Category: "Workplace Closures", date_implemented: "2020-03-19" },
  { COUNTRY: "USA", Region: "National", Category: "Public Events", date_implemented: "2020-03-12" },
  { COUNTRY: "USA", Region: "National", Category: "Public Events", date_implemented: "2020-03-15" },
  { COUNTRY: "USA", Region: "National", Category: "Gatherings", date_implemented: "2020-03-16" },
  { COUNTRY: "USA", Region: "National", Category: "Public Transport", date_implemented: "2020-03-21" },
  { COUNTRY: "USA", Region: "National", Category: "Stay at Home", date_implemented: "2020-03-19" },
  { COUNTRY: "USA", Region: "National", Category: "Stay at Home", date_implemented: "2020-03-22" },
  { COUNTRY: "USA", Region: "National", Category: "Travel Controls", date_implemented: "2020-02-02" },
  { COUNTRY: "USA", Region: "National", Category: "Travel Controls", date_implemented: "2020-03-11" },
  { COUNTRY: "USA", Region: "National", Category: "Travel Controls", date_implemented: "2020-03-19" },
  
  { COUNTRY: "USA", Region: "National", Category: "School Closures", date_implemented: "2020-05-15" },
  { COUNTRY: "USA", Region: "National", Category: "Workplace Closures", date_implemented: "2020-06-01" },
  { COUNTRY: "USA", Region: "National", Category: "Travel Controls", date_implemented: "2020-06-15" },
  
  { COUNTRY: "USA", Region: "National", Category: "School Closures", date_implemented: "2020-09-01" },
  { COUNTRY: "USA", Region: "National", Category: "Public Events", date_implemented: "2020-09-15" },
  { COUNTRY: "USA", Region: "National", Category: "Travel Controls", date_implemented: "2020-09-22" },
  
  { COUNTRY: "USA", Region: "National", Category: "School Closures", date_implemented: "2020-12-01" },
  { COUNTRY: "USA", Region: "National", Category: "Public Events", date_implemented: "2020-12-10" },
  { COUNTRY: "USA", Region: "National", Category: "Stay at Home", date_implemented: "2020-12-15" },
  { COUNTRY: "USA", Region: "National", Category: "Travel Controls", date_implemented: "2020-12-21" },
  
  { COUNTRY: "GBR", Region: "National", Category: "School Closures", date_implemented: "2020-03-18" },
  { COUNTRY: "GBR", Region: "National", Category: "Workplace Closures", date_implemented: "2020-03-20" },
  { COUNTRY: "GBR", Region: "National", Category: "Public Events", date_implemented: "2020-03-16" },
  { COUNTRY: "GBR", Region: "National", Category: "Gatherings", date_implemented: "2020-03-23" },
  
  { COUNTRY: "IRN", Region: "National", Category: "School Closures", date_implemented: "2020-03-05" },
  { COUNTRY: "IRN", Region: "National", Category: "Public Events", date_implemented: "2020-03-06" },
  { COUNTRY: "IRN", Region: "National", Category: "Public Transport", date_implemented: "2020-03-15" },
  { COUNTRY: "IRN", Region: "National", Category: "Travel Controls", date_implemented: "2020-03-10" }
];

// Format date for display
const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", { year: 'numeric', month: 'long' });
};

// Get color based on policy count
const getColorForCount = (count: number): string => {
  if (count >= 3) return "#2563eb"; // Dark blue
  if (count === 2) return "#3b82f6"; // Medium blue
  if (count === 1) return "#60a5fa"; // Light blue
  return "#dbeafe"; // Extremely light blue for 0
};

// Get the year-month from a date string (YYYY-MM-DD)
const getYearMonth = (dateStr: string): string => {
  return dateStr.substring(0, 7); // "2020-03-15" -> "2020-03"
};

// Generate array of year-month strings from date range
const generateMonthArray = (startDate: string, endDate: string): string[] => {
  const result: string[] = [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  let current = new Date(start);
  current.setDate(1); // Start at beginning of month
  
  while (current <= end) {
    const year = current.getFullYear();
    const month = (current.getMonth() + 1).toString().padStart(2, '0');
    result.push(`${year}-${month}`);
    
    // Move to next month
    current.setMonth(current.getMonth() + 1);
  }
  
  return result;
};

export function PolicyBreakdown({ 
  className, 
  country = "USA",
  countryName,
  selectedDate,
  rawData = sampleRawData, // Use sample data by default
  onDateChange,
  ...props
}: PolicyBreakdownProps) {
  // Find min and max dates in the data
  const dateRange = useMemo(() => {
    const filteredData = rawData.filter(item => item.COUNTRY === country);
    if (filteredData.length === 0) return { min: "2020-01", max: "2021-06" };
    
    const dates = filteredData.map(item => item.date_implemented);
    return {
      min: dates.reduce((min, date) => date < min ? date : min, dates[0]),
      max: dates.reduce((max, date) => date > max ? date : max, dates[0])
    };
  }, [rawData, country]);
  
  // Generate array of available months
  const availableMonths = useMemo(() => {
    return generateMonthArray(dateRange.min, dateRange.max);
  }, [dateRange]);
  
  // Internal state for date selection if not controlled externally
  const [internalSelectedDate, setInternalSelectedDate] = useState<string>(availableMonths[2] || "2020-03");
  
  // Use either the controlled date or the internal state
  const effectiveDate = selectedDate || internalSelectedDate;
  
  // Handle date change
  const handleDateChange = (date: string) => {
    if (onDateChange) {
      onDateChange(date);
    } else {
      setInternalSelectedDate(date);
    }
  };
  
  // Process raw data to get policy counts for the selected date
  const processedData = useMemo(() => {
    // Only include policies for the selected country
    const countryData = rawData.filter(item => item.COUNTRY === country);
    
    // Get the last day of the selected month for comparison
    const [year, month] = effectiveDate.split('-');
    const lastDay = new Date(parseInt(year), parseInt(month), 0).getDate();
    const dateLimit = `${effectiveDate}-${lastDay}`;
    
    // Only include policies implemented before or during the selected month
    const activePolicies = countryData.filter(item => item.date_implemented <= dateLimit);
    
    // Count policies by category
    const categoryCounts: Record<string, PolicyCount> = {};
    
    activePolicies.forEach(policy => {
      if (!categoryCounts[policy.Category]) {
        categoryCounts[policy.Category] = {
          name: policy.Category,
          count: 0,
          policies: []
        };
      }
      
      categoryCounts[policy.Category].count++;
      categoryCounts[policy.Category].policies?.push(policy);
    });
    
    // Convert to array and ensure we have all standard categories even if count is 0
    const standardCategories = [
      "School Closures", "Workplace Closures", "Public Events", 
      "Gatherings", "Public Transport", "Stay at Home", "Travel Controls"
    ];
    
    const result: PolicyCount[] = standardCategories.map(category => {
      return categoryCounts[category] || { name: category, count: 0, policies: [] };
    });
    
    return result;
  }, [rawData, country, effectiveDate]);
  
  // Calculate total active policies
  const totalActivePolicies = processedData.reduce((sum, item) => sum + item.count, 0);
  
  // Create refs for the chart container and tooltip
  const chartRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  
  // D3 chart creation effect
  useEffect(() => {
    if (!chartRef.current || processedData.length === 0) return;
    
    // Clear previous chart
    d3.select(chartRef.current).selectAll("*").remove();
    
    // Set up dimensions
    const margin = { top: 20, right: 30, left: 50, bottom: 100 };
    const width = chartRef.current.clientWidth - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;
    
    // Create SVG
    const svg = d3.select(chartRef.current)
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // Create scales
    const x = d3.scaleBand()
      .domain(processedData.map(d => d.name))
      .range([0, width])
      .padding(0.1);
    
    const y = d3.scaleLinear()
      .domain([0, d3.max(processedData, d => d.count) || 0])
      .nice()
      .range([height, 0]);
    
    // Create axes
    const xAxis = svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .style("text-anchor", "end")
      .attr("dx", "-.8em")
      .attr("dy", ".15em")
      .attr("transform", "rotate(-45)");
    
    const yAxis = svg.append("g")
      .call(d3.axisLeft(y).ticks(5).tickFormat(d => d.toString()));
    
    // Add y-axis label
    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left)
      .attr("x", 0 - (height / 2))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .style("font-size", "12px")
      .text("Number of Active Policies");
    
    // Add grid lines
    svg.append("g")
      .attr("class", "grid")
      .call(d3.axisLeft(y)
        .ticks(5)
        .tickSize(-width)
        .tickFormat(() => "")
      )
      .selectAll("line")
      .style("stroke", "#e2e8f0")
      .style("stroke-dasharray", "3,3");
    
    // Create tooltip div if it doesn't exist
    const tooltip = d3.select(tooltipRef.current);
    
    // Add bars
    svg.selectAll(".bar")
      .data(processedData)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", d => x(d.name) || 0)
      .attr("width", x.bandwidth())
      .attr("y", d => y(d.count))
      .attr("height", d => height - y(d.count))
      .attr("fill", d => getColorForCount(d.count))
      .on("mouseover", function(event, d) {
        // Show tooltip
        tooltip.style("opacity", 1);
        
        // Format tooltip content
        let tooltipContent = `
          <div class="font-bold">${d.name}</div>
          <div>${d.count} active ${d.count === 1 ? "policy" : "policies"}</div>
        `;
        
        if (d.policies && d.policies.length > 0) {
          tooltipContent += `
            <div class="text-sm text-gray-600 mt-1">
              <div class="font-medium">Implementation dates:</div>
              <ul class="list-disc pl-4 mt-1">
          `;
          
          d.policies.forEach(p => {
            tooltipContent += `
              <li>${formatDate(p.date_implemented)}${p.Region !== "National" ? ` (${p.Region})` : ''}</li>
            `;
          });
          
          tooltipContent += `
              </ul>
            </div>
          `;
        }
        
        tooltip.html(tooltipContent)
          .style("left", `${event.pageX + 10}px`)
          .style("top", `${event.pageY - 28}px`);
          
        // Highlight bar
        d3.select(this)
          .attr("fill", d3.color(getColorForCount(d.count))?.darker().toString() || "#1e40af");
      })
      .on("mouseout", function(event, d) {
        // Hide tooltip
        tooltip.style("opacity", 0);
        
        // Reset bar color
        d3.select(this)
          .attr("fill", getColorForCount(d.count));
      });
    
    // Add legend
    const legendData = [
      { label: "3+ policies", color: "#2563eb" },
      { label: "2 policies", color: "#3b82f6" },
      { label: "1 policy", color: "#60a5fa" },
      { label: "0 policies", color: "#dbeafe" }
    ];
    
    const legend = svg.append("g")
      .attr("transform", `translate(${width - 160}, ${height + 60})`);
    
    legendData.forEach((item, i) => {
      const legendRow = legend.append("g")
        .attr("transform", `translate(0, ${i * 20})`);
      
      legendRow.append("rect")
        .attr("width", 15)
        .attr("height", 15)
        .attr("fill", item.color);
      
      legendRow.append("text")
        .attr("x", 20)
        .attr("y", 12)
        .style("font-size", "12px")
        .text(item.label);
    });
    
    // Handle resize
    const handleResize = () => {
      if (!chartRef.current) return;
      
      // Update chart dimensions
      const newWidth = chartRef.current.clientWidth - margin.left - margin.right;
      
      // Update scales
      x.range([0, newWidth]);
      
      // Update SVG dimensions
      d3.select(chartRef.current).select("svg")
        .attr("width", newWidth + margin.left + margin.right);
      
      // Update x-axis
      svg.select(".x-axis")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x));
      
      // Update bars
      svg.selectAll(".bar")
        .attr("x", d => x(d.name) || 0)
        .attr("width", x.bandwidth());
      
      // Update grid
      svg.select(".grid")
        .call(d3.axisLeft(y)
          .ticks(5)
          .tickSize(-newWidth)
          .tickFormat(() => "")
        );
    };
    
    // Add resize listener
    window.addEventListener("resize", handleResize);
    
    // Cleanup function
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [processedData]);
  
  // Extract only valid HTML attributes to spread to the div
  const { style, id, role, tabIndex, ...otherProps } = props;
  const validHtmlProps = { style, id, role, tabIndex };
  
  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <Select value={effectiveDate} onValueChange={handleDateChange}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select date" />
            </SelectTrigger>
            <SelectContent>
              {availableMonths.map(date => (
                <SelectItem key={date} value={date}>
                  {formatDate(`${date}-01`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="text-sm font-medium">
            Total active policies: {totalActivePolicies}
          </div>
        </div>
        <div className="text-sm text-muted-foreground">
          Showing number of active policies by type as of {formatDate(`${effectiveDate}-01`)}
        </div>
      </CardHeader>
      <CardContent>
        {/* D3.js chart container */}
        <div ref={chartRef} className="w-full h-96"></div>
        
        {/* Tooltip */}
        <div 
          ref={tooltipRef} 
          className="absolute bg-white p-2 border rounded shadow-md max-w-xs opacity-0 pointer-events-none z-50"
          style={{ 
            position: "absolute", 
            opacity: 0,
            pointerEvents: "none"
          }}
        ></div>
      </CardContent>
    </Card>
  );
}
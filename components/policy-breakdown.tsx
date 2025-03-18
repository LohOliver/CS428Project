"use client"

import * as React from "react"
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis, Legend, Tooltip } from "recharts"
import { cn } from "@/lib/utils"

// Sample data for country policies
const countryPolicyData = {
  "USA": [
    { name: "School Closures", value: 85 },
    { name: "Workplace Closures", value: 75 },
    { name: "Public Events", value: 90 },
    { name: "Gatherings", value: 80 },
    { name: "Public Transport", value: 60 },
    { name: "Stay at Home", value: 70 },
    { name: "Travel Controls", value: 95 },
  ],
  "Germany": [
    { name: "School Closures", value: 80 },
    { name: "Workplace Closures", value: 70 },
    { name: "Public Events", value: 85 },
    { name: "Gatherings", value: 75 },
    { name: "Public Transport", value: 65 },
    { name: "Stay at Home", value: 60 },
    { name: "Travel Controls", value: 90 },
  ],
  "Brazil": [
    { name: "School Closures", value: 90 },
    { name: "Workplace Closures", value: 80 },
    { name: "Public Events", value: 95 },
    { name: "Gatherings", value: 85 },
    { name: "Public Transport", value: 70 },
    { name: "Stay at Home", value: 65 },
    { name: "Travel Controls", value: 80 },
  ],
}

interface PolicyBreakdownProps {
  className?: string;
  country?: string;       
  countryName?: string;   
}

export function PolicyBreakdown({ 
  className, 
  country = "USA",  // Default to USA if no country provided
  countryName,      
  ...props
}: PolicyBreakdownProps) {
  // Use the country code to get data, fall back to USA data if not found
  const data = country && countryPolicyData[country] 
    ? countryPolicyData[country] 
    : countryPolicyData["USA"];

  // Extract only valid HTML attributes to spread to the div
  const { style, id, role, tabIndex, ...otherProps } = props;
  const validHtmlProps = { style, id, role, tabIndex };

  return (
    <div className={cn("", className)} {...validHtmlProps}>
      {countryName && (
        <div className="mb-4 text-center text-sm font-medium">
          Showing policy measures for {countryName}
        </div>
      )}
      <ResponsiveContainer width="100%" height="100%">
        <BarChart 
          data={data} 
          margin={{ top: 20, right: 30, left: 30, bottom: 40 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
          <Tooltip formatter={(value) => [`${value}%`, "Stringency"]} />
          <Legend verticalAlign="bottom" height={36} />
          <Bar dataKey="value" name="Stringency Level (%)" fill="#2563eb" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
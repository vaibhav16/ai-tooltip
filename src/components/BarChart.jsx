import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const data = [
  { month: "Jan", hires: 12 },
  { month: "Feb", hires: 18 },
  { month: "Mar", hires: 9 },
  { month: "Apr", hires: 22 },
  { month: "May", hires: 15 },
  { month: "Jun", hires: 19 },
  { month: "Jul", hires: 24 },
];

export default function CustomBarChart() {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="hires" fill="#1976d2" />
      </BarChart>
    </ResponsiveContainer>
  );
}

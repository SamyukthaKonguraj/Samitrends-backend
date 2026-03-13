import React, { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer } from "@/components/ui/chart";
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { Button } from "@/components/ui/button";

const CashierPerformance = () => {
  const [cashiers, setCashiers] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [range, setRange] = useState(1); // Default: today
  const token = localStorage.getItem("token");

  const colors = [
    "#4f46e5", "#f43f5e", "#f59e0b", "#10b981", "#3b82f6",
    "#8b5cf6", "#ec4899", "#14b8a6", "#f97316", "#e11d48"
  ];

  // Helper: format date as dd/mm/yyyy
  const formatDate = (date) =>
    date.toLocaleDateString("en-GB").replace(/\//g, "/");

  // Transform API data for Combo Chart
  const transformData = (rawData, days) => {
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - (days - 1));

    const dates = [];
    for (let i = 0; i < days; i++) {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i);
      dates.push(formatDate(d));
    }

    return dates.map((date) => {
      const entry = { date, total: 0 }; // total for line chart
      rawData.forEach((cashier) => {
        const txn = cashier.transactions.find((t) => t.date === date);
        const count = txn ? txn.transactionCount : 0;
        entry[cashier.cashierName] = count;
        entry.total += count; // cumulative/total transactions per day
      });
      return entry;
    });
  };

  // Fetch cashiers from API
  useEffect(() => {
    const fetchCashiers = async () => {
      try {
        const res = await axios.get(
          "http://localhost:5000/api/transactions/by-cashier",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const data = res.data || [];
        setCashiers(data);
        setChartData(transformData(data, range));
      } catch (err) {
        console.error("Error fetching cashier data:", err);
      }
    };

    if (token) fetchCashiers();
  }, [token, range]);

  return (
    <Card>
      <CardHeader className="flex justify-between items-center">
        <CardTitle>Cashier Performance</CardTitle>
        <div className="space-x-2">
          <Button size="sm" variant={range === 1 ? "default" : "outline"} onClick={() => setRange(1)}>Today</Button>
          <Button size="sm" variant={range === 2 ? "default" : "outline"} onClick={() => setRange(2)}>Yesterday</Button>
          <Button size="sm" variant={range === 3 ? "default" : "outline"} onClick={() => setRange(3)}>Last 3 Days</Button>
          <Button size="sm" variant={range === 7 ? "default" : "outline"} onClick={() => setRange(7)}>Last 7 Days</Button>
        </div>
      </CardHeader>

      <CardContent>
        <ChartContainer>
          <ResponsiveContainer width="100%" height={350}>
            <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />

              {/* Bars: individual cashier transactions */}
              {cashiers.map((c, idx) => (
                <Bar
                  key={c.cashierId}
                  dataKey={c.cashierName}
                  fill={colors[idx % colors.length]}
                  barSize={20}
                />
              ))}

              {/* Line: total transactions */}
              <Line
                type="monotone"
                dataKey="total"
                stroke="#f43f5e"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default CashierPerformance;

import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { Button } from "@/components/ui/button";
import ManagerNavbar from "@/components/ManagerNavbar";
import CashierPerformance from "@/components/CashierPerformance";

const ManagerDashboard = () => {
  const [overview, setOverview] = useState({});
  const [topProducts, setTopProducts] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [cashiers, setCashiers] = useState([]);
  const [time, setTime] = useState(new Date());
  const [salesTrend, setSalesTrend] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [range, setRange] = useState(7); // Default: 7 days
  const [loyalCustomers, setLoyalCustomers] = useState([]);
  const [paymentStats, setPaymentStats] = useState([]);

  const token = localStorage.getItem("token");
  console.log(token);

  // ✅ Fill missing dates helper
  function fillMissingDates(data, days = 7) {
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - (days - 1));

    const salesMap = new Map(data.map((d) => [d.period, d.totalSales]));

    const result = [];
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      const formatted = date.toISOString().split("T")[0]; // yyyy-mm-dd
      result.push({
        period: formatted,
        totalSales: salesMap.get(formatted) || 0,
      });
    }
    return result;
  }

  // ✅ Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          overviewRes,
          topRes,
          lowRes,
          cashiersRes,
          trendRes,
          customersRes,
          loyalRes,           // 🆕 Add loyal customers
          paymentRes,         // 🆕 Add payment methods
        ] = await Promise.all([
          axios.get("http://localhost:5000/api/products/sales-report", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://localhost:5000/api/products/top-selling", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://localhost:5000/api/products/low-stock", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://localhost:5000/api/cashiers", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://localhost:5000/api/products/sales-trend", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://localhost:5000/api/customers", {
            headers: { Authorization: `Bearer ${token}` },
          }),

          // 🆕 New API endpoints
          axios.get("http://localhost:5000/api/transactions/top-loyal-customers", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://localhost:5000/api/transactions/payment-methods", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setOverview(overviewRes.data || {});
        setTopProducts(topRes.data || []);
        setLowStock(lowRes.data || []);
        setCashiers(cashiersRes.data || []);
        setCustomers(customersRes.data || []);

        // 🆕 Set new data
        setLoyalCustomers(loyalRes.data || []);
        setPaymentStats(paymentRes.data || []);

        const trendData = trendRes.data || [];
        const filled = fillMissingDates(trendData, range);
        setSalesTrend(filled);

      } catch (error) {
        console.error("Error fetching dashboard data", error);
      }
    };

    if (token) fetchData();
  }, [token, range]);
  // 🔁 refetch when range changes

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div>
      <ManagerNavbar time={time} />

      <div className="p-6 space-y-6 ml-6 mr-6">
        <h2 className="text-2xl font-semibold tracking-wide mb-4 text-gray-700 text-center">Working Flow</h2>

        {/* Overview Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
          <Card className="bg-indigo-50">
            <CardHeader>
              <CardTitle>Today’s Sales</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center space-y-3">
                {/* Today's Sales */}
                <span className="text-4xl font-bold text-indigo-600">
                  ₹{overview.salesToday?.toLocaleString() || 0}
                </span>

                {/* Comparison with Yesterday */}
                <span className="text-sm text-gray-600">
                  Compared to Yesterday:{" "}
                  {overview.salesYesterday ? (
                    overview.salesToday > overview.salesYesterday ? (
                      <span className="text-green-600 font-semibold">
                        ▲ +{(((overview.salesToday - overview.salesYesterday) / overview.salesYesterday) * 100).toFixed(1)}%
                      </span>
                    ) : (
                      <span className="text-red-600 font-semibold">
                        ▼ -{(((overview.salesYesterday - overview.salesToday) / overview.salesYesterday) * 100).toFixed(1)}%
                      </span>
                    )
                  ) : (
                    "N/A"
                  )}
                </span>

                {/* Monthly and Last Month Revenue (Side by Side Lines) */}
                <div className="w-full mt-3 space-y-2">
                  {/* This Month */}
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <img src="/revenue.png" alt="Revenue" className="w-5 h-5" />
                      <span>This Month</span>
                    </div>
                    <span className="text-xl font-bold text-green-600">
                      ₹{(overview.monthlyRevenue || 0).toLocaleString()}
                    </span>
                  </div>

                  {/* Last Month */}
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <img src="/compare.jpg" alt="Comparison" className="w-5 h-5" />
                      <span>Last Month</span>
                    </div>
                    <span className="text-xl font-semibold text-gray-700">
                      ₹{(overview.lastMonthRevenue || 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>


          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Business Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {/* Total Products */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 flex items-center gap-2">
                    <img
                      src="/products.png" // your product icon path
                      alt="Products"
                      className="w-5 h-5"
                    />
                    Total Products
                  </span>
                  <span className="text-2xl font-semibold flex items-center gap-2">
                    {overview.totalProducts || 0}
                  </span>
                </div>

                {/* Customers */}
                <div className="flex items-center justify-between border-t pt-2">
                  <span className="text-sm text-gray-600 flex items-center gap-2">
                    <img
                      src="/customers.png" // your customer icon path
                      alt="Customers"
                      className="w-5 h-5"
                    />
                    Customers
                  </span>
                  <span className="text-2xl font-semibold flex items-center gap-2">
                    {customers.length || 0}
                  </span>
                </div>

                {/* Cashiers */}
                <div className="flex items-center justify-between border-t pt-2">
                  <span className="text-sm text-gray-600 flex items-center gap-2">
                    <img
                      src="/cashier.jpg" // your cashier icon path
                      alt="Cashiers"
                      className="w-5 h-5"
                    />
                    Cashiers
                  </span>
                  <span className="text-2xl font-semibold flex items-center gap-2">
                    {cashiers.total || cashiers.length || 0}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-green-50  pt-0 pl-0 h-auto overflow-visible">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-green-800">
                Loyalty & Payment Overview
              </CardTitle>
            </CardHeader>

            <CardContent className="flex flex-col space-y-8 mt-2">

              {/* 🧍 Top Loyal Customers */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-green-700"
                  >
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <path d="M16 3.128a4 4 0 0 1 0 7.744" />
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                    <circle cx="9" cy="7" r="4" />
                  </svg>
                  <h3 className="text-sm font-semibold text-gray-700">Top Loyal Customers</h3>
                </div>

                <div className="space-y-2 mt-0">
                  {loyalCustomers.length > 0 ? (
                    loyalCustomers.slice(0, 3).map((c, index) => (
                      <div
                        key={c.id}
                        className="flex justify-between bg-white rounded-xl shadow-sm px-3 py-2 hover:bg-green-100 transition"
                      >
                        <div>
                          <p className="font-medium text-gray-800">
                            {index + 1}. {c.fullName}
                          </p>
                          <p className="text-xs text-gray-500">{c.mobile}</p>
                        </div>
                        <span className="text-green-600 font-bold">{c.points} pts</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">No data available</p>
                  )}
                </div>
              </div>

              {/* 💳 Payment Method Stats */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-green-700"
                  >
                    <rect width="7" height="12" x="2" y="6" rx="1" />
                    <path d="M13 8.32a7.43 7.43 0 0 1 0 7.36" />
                    <path d="M16.46 6.21a11.76 11.76 0 0 1 0 11.58" />
                    <path d="M19.91 4.1a15.91 15.91 0 0 1 .01 15.8" />
                  </svg>
                  <h3 className="text-sm font-semibold text-gray-700">Payment Methods</h3>
                </div>

                <div className="space-y-2">
                  {paymentStats.length > 0 ? (
                    paymentStats.map((p) => (
                      <div
                        key={p.paymentMethod}
                        className="flex justify-between"
                      >
                        <span className="font-medium text-gray-800">{p.paymentMethod}</span>
                        <span className="text-green-600 font-semibold">{p.count}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">No data available</p>
                  )}
                </div>
              </div>

            </CardContent>
          </Card>












          <Card className="p-4 pt-0 pl-0">
            <CardHeader>
              <CardTitle>Low Stock Alert</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mt-5">
                {/* Count and label */}
                <div className="flex flex-col">
                  <span className="text-4xl font-bold text-red-600">
                    {lowStock.length || 0}
                  </span>
                  <span className="text-sm text-gray-600">
                    Products running low
                  </span>
                </div>

                {/* Icon/Image */}
                <div className="w-16 h-16 flex items-center justify-center">
                  <img
                    src="/low-stock.png" // replace with your icon
                    alt="Low Stock"
                    className="w-12 h-12"
                  />
                </div>
              </div>
            </CardContent>
          </Card>



        </div>


        {/* Cashier Performance Chart */}


        <h2 className="text-2xl font-semibold tracking-wide mb-4 text-gray-700 ">Performance Trends</h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Sales Trend Chart */}
          <Card>
            <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="w-full flex justify-center sm:justify-center">
                <CardTitle className="text-lg font-semibold text-center">Sales Trend</CardTitle>
              </div>

              <div className="mt-3 sm:mt-0 flex justify-center sm:justify-end w-full sm:w-auto space-x-2">
                <Button
                  size="sm"
                  variant={range === 7 ? "default" : "outline"}
                  onClick={() => setRange(7)}
                >
                  7 Days
                </Button>
                <Button
                  size="sm"
                  variant={range === 30 ? "default" : "outline"}
                  onClick={() => setRange(30)}
                >
                  30 Days
                </Button>
                <Button
                  size="sm"
                  variant={range === 90 ? "default" : "outline"}
                  onClick={() => setRange(90)}
                >
                  3 Months
                </Button>
              </div>
            </CardHeader>

            <CardContent>
              <ChartContainer>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={salesTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip content={<ChartTooltipContent />} />
                    <Line
                      type="monotone"
                      dataKey="totalSales"
                      stroke="#4f46e5"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Cashier Performance Chart */}
          <CashierPerformance />
        </div>


        <h2 className="text-2xl font-semibold tracking-wide mb-4 text-gray-700 ">List Box of Product</h2>

        {/* Top Selling & Low Stock Side by Side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Top Selling */}
          <Card>
            <CardHeader>
              <CardTitle>Top Selling Products</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[250px]">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Product</th>

                      <th className="text-right p-2">Sold</th>
                      <th className="text-right p-2">Quantity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topProducts.length > 0 ? (
                      topProducts.map((p) => (
                        <tr key={p.productId} className="border-b">
                          <td className="p-2">{p.name}</td>

                          <td className="p-2 text-right">
                            ₹{Number(p.totalRevenue || 0).toFixed(2)}
                          </td>
                          <td className="p-2 text-right">{p.totalQty}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="2" className="text-center p-2 text-gray-500">
                          No data available
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Low Stock */}
          <Card>
            <CardHeader>
              <CardTitle>Low Stock Products</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[250px]">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Product</th>
                      <th className="text-right p-2">Stock</th>
                      <th className="text-right p-2">Threshold</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lowStock.length > 0 ? (
                      lowStock.map((p) => (
                        <tr key={p.productId} className="border-b">
                          <td className="p-2">{p.name}</td>
                          <td className="p-2 text-right">{p.stock}</td>
                          <td className="p-2 text-right">{p.threshold}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="2" className="text-center p-2 text-gray-500">
                          All stocks are healthy
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>

    </div>
  );
};

export default ManagerDashboard;

import { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function SalesReportCard() {
  const [report, setReport] = useState({
    lowStockCount: 0,
    totalProducts: 0,
    salesToday: 0,
    salesYesterday: 0,
    previewCount: 0,
    monthlyRevenue: 0,
    lastMonthRevenue: 0,
  });

  useEffect(() => {
    const fetchReport = async () => {
      try {
        // Get token from localStorage
        const token = localStorage.getItem("token");
        if (!token) {
          console.warn("No auth token found");
          return;
        }

        const res = await axios.get(
          "http://localhost:5000/api/products/sales-report",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setReport(res.data || {});
      } catch (err) {
        console.error("Error fetching sales report:", err);
      }
    };

    fetchReport();
  }, []);

  return (
    <Card className="mb-4 rounded-xl overflow-hidden">
      <CardContent className="grid grid-cols-2 md:grid-cols-4 m-0 p-0 bg-gray-50">
        <div className="flex flex-col items-center p-2">
          <span className="text-xs text-gray-500">Sales Today</span>
          <span className="text-lg font-bold text-indigo-600">₹{report.salesToday}</span>
          <span className="text-xs text-gray-400">Yesterday: ₹{report.salesYesterday}</span>
        </div>

        <div className="flex flex-col items-center p-2">
          <span className="text-xs text-gray-500">Monthly Revenue</span>
          <span className="text-lg font-bold text-indigo-600">₹{report.monthlyRevenue}</span>
          <span className="text-xs text-gray-400">Last Month: ₹{report.lastMonthRevenue}</span>
        </div>

        <div className="flex flex-col items-center p-2">
          <span className="text-xs text-gray-500">Total Products</span>
          <span className="text-lg font-bold text-indigo-600">{report.totalProducts}</span>
        </div>

        <div className="flex flex-col items-center p-2">
          <span className="text-xs text-gray-500">Low Stock</span>
          <span className="text-lg font-bold text-indigo-600">{report.lowStockCount}</span>
        </div>
      </CardContent>
    </Card>

  );
}

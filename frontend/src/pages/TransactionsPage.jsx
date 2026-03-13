import React, { useEffect, useState, useMemo } from "react";
import CashierNavbar from "@/components/CashierNavbar";
import ManagerNavbar from "@/components/ManagerNavbar";
import { jwtDecode } from "jwt-decode";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import FooterAll from '../components/FootorAll';



const TransactionsPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [cashiers, setCashiers] = useState([]);

  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [userRole, setUserRole] = useState(null);
  const [time, setTime] = useState(new Date());
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUserRole(decoded.role);
      } catch (err) {
        console.error("Invalid token", err);
      }
    }
  }, [token]);

  // Clock
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [transRes, prodRes, custRes, cashRes] = await Promise.all([
          fetch("http://localhost:5000/api/transactions", { headers: { Authorization: `Bearer ${token}` } }),
          fetch("http://localhost:5000/api/products", { headers: { Authorization: `Bearer ${token}` } }),
          fetch("http://localhost:5000/api/customers", { headers: { Authorization: `Bearer ${token}` } }),
          userRole === "manager"
            ? fetch("http://localhost:5000/api/cashiers", { headers: { Authorization: `Bearer ${token}` } })
            : Promise.resolve({ json: async () => [] }),
        ]);

        const transData = await transRes.json();
        const prodData = await prodRes.json();
        const custData = await custRes.json();
        const cashData = userRole === "manager" ? await cashRes.json() : [];

    setTransactions(Array.isArray(transData) ? transData : []);

        
        setProducts(prodData);
        setCustomers(custData);
        setCashiers(Array.isArray(cashData) ? cashData : cashData.cashiers || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, [token, userRole]);

  // Helper functions
  const getProductName = (id) => products.find((p) => p.id === id)?.name || "Unknown";
  const getCustomerName = (id) => customers.find((c) => c.id === id)?.name || "Guest";
  const getCashierName = (id) => {
    if (!Array.isArray(cashiers)) return `Cashier ${id}`;
    return cashiers.find((c) => c.id === id)?.username || `Cashier ${id}`;
  };

  const fetchTransactionDetails = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/api/transactions/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setSelectedTransaction(data);
    } catch (err) {
      console.error(err);
    }
  };

  // Filter + sort
  const filteredTransactions = useMemo(() => {
    let filtered = transactions.filter(
      (t) =>
        getCustomerName(t.customerId).toLowerCase().includes(search.toLowerCase()) ||
        t.TransactionItems?.some((item) => getProductName(item.productId).toLowerCase().includes(search.toLowerCase())) ||
        (userRole === "manager" && getCashierName(t.cashierId).toLowerCase().includes(search.toLowerCase()))
    );

    // Date Range Filter
    if (dateFrom) {
      filtered = filtered.filter((t) => new Date(t.createdAt) >= new Date(dateFrom));
    }
    if (dateTo) {
      filtered = filtered.filter((t) => new Date(t.createdAt) <= new Date(dateTo));
    }

    // Sorting
    filtered.sort((a, b) => {
      let aVal, bVal;
      switch (sortKey) {
        case "createdAt":
          aVal = new Date(a.createdAt);
          bVal = new Date(b.createdAt);
          break;
        case "totalAmount":
          aVal = a.totalAmount;
          bVal = b.totalAmount;
          break;
        default:
          return 0;
      }
      if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
      if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [transactions, search, sortKey, sortOrder, dateFrom, dateTo, products, customers]);


  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <div className="flex-1">
        {userRole === "manager" ? <ManagerNavbar time={time} /> : <CashierNavbar time={time} />}

        <div className="max-w-10xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">Transaction History</h2>

          <div className="flex flex-col md:flex-row md:items-end gap-4 mb-6 w-full">
            {/* Search */}
            <div className="flex flex-col w-full md:w-2/3">
              <label className="mb-1 font-medium text-gray-700">Search</label>
              <input
                type="text"
                placeholder="Customer, Product, or Cashier..."
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* Date Range */}
            <div className="flex w-full md:w-1/3 gap-2">
              <div className="flex flex-col w-1/2">
                <span className="text-sm text-gray-500 mb-1">From</span>
                <input
                  type="date"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                />
              </div>
              <div className="flex flex-col w-1/2">
                <span className="text-sm text-gray-500 mb-1">To</span>
                <input
                  type="date"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                />
              </div>
            </div>
          </div>






          {/* Table */}
          <div className="overflow-x-auto rounded-lg shadow-lg bg-white">
            <table className="w-full text-left border-collapse">
              <thead className="bg-blue-700 text-white">
                <tr>
                  <th
                    className="px-6 py-3 text-sm font-medium uppercase cursor-pointer select-none"
                    onClick={() => {
                      if (sortKey === "createdAt") setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                      else {
                        setSortKey("createdAt");
                        setSortOrder("asc");
                      }
                    }}
                  >
                    Date {sortKey === "createdAt" ? (sortOrder === "asc" ? "↑" : "↓") : ""}
                  </th>
                  {userRole === "manager" && <th className="px-6 py-3 text-sm font-medium uppercase">Cashier</th>}
                  {userRole === "manager" && <th className="px-6 py-3 text-sm font-medium uppercase">Customer</th>}
                  <th className="px-6 py-3 text-sm font-medium uppercase">Products</th>
                  <th className="px-6 py-3 text-sm font-medium uppercase">Qty</th>
                  {userRole === "manager" && <th className="px-6 py-3 text-sm font-medium uppercase">Price</th>}
                  {userRole === "manager" && <th className="px-6 py-3 text-sm font-medium uppercase">Coupon Code</th>}
                  {userRole === "manager" && <th className="px-6 py-3 text-sm font-medium uppercase">Coupon Discount</th>}
                  {userRole === "manager" && <th className="px-6 py-3 text-sm font-medium uppercase">Loyalty Discount</th>}
                  <th
                    className="px-6 py-3 text-sm font-medium uppercase cursor-pointer select-none"
                    onClick={() => {
                      if (sortKey === "totalAmount") setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                      else {
                        setSortKey("totalAmount");
                        setSortOrder("asc");
                      }
                    }}
                  >
                    Total {sortKey === "totalAmount" ? (sortOrder === "asc" ? "↑" : "↓") : ""}
                  </th>
                  <th className="px-6 py-3 text-sm font-medium uppercase">Payment</th>
                  {userRole === "manager" && <th className="px-6 py-3 text-sm font-medium uppercase">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredTransactions.length > 0 ? (
                  filteredTransactions.map((t) => (
                    <tr key={t.id} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-6 py-4 text-sm text-gray-600">{new Date(t.createdAt).toLocaleString()}</td>
                      {userRole === "manager" && <td className="px-6 py-4 font-medium text-gray-800">{getCashierName(t.cashierId)}</td>}
                      {userRole === "manager" && <td className="px-6 py-4 font-medium text-gray-800">{getCustomerName(t.customerId)}</td>}
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {t.TransactionItems?.map((item) => getProductName(item.productId)).join(", ") || "No items"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">{t.TransactionItems?.map((item) => item.quantity).join(", ") || "-"}</td>
                      {userRole === "manager" && <td className="px-6 py-4 text-sm text-gray-700">₹{t.TransactionItems?.map((item) => item.unitPrice).join(", ") || "-"}</td>}
                      {userRole === "manager" && <td className="px-6 py-4 text-sm text-gray-700">{t.couponCode || "—"}</td>}
                      {userRole === "manager" && <td className="px-6 py-4 text-sm text-gray-700">{t.couponDiscount ? `₹${t.couponDiscount.toFixed(2)}` : "—"}</td>}
                      {userRole === "manager" && <td className="px-6 py-4 text-sm text-gray-700">{t.loyaltyDiscount ? `₹${t.loyaltyDiscount.toFixed(2)}` : "—"}</td>}
                      <td className="px-6 py-4 font-semibold text-gray-800">₹{t.totalAmount.toFixed(2)}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${t.paymentMethod === "cash" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                          {t.paymentMethod.toUpperCase()}
                        </span>
                      </td>
                      {userRole === "manager" && (
                        <td className="px-6 py-4">
                          <button
                            onClick={() => fetchTransactionDetails(t.id)}
                            className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="lucide lucide-view text-white"
                            >
                              <path d="M21 17v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2" />
                              <path d="M21 7V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v2" />
                              <circle cx="12" cy="12" r="1" />
                              <path d="M18.944 12.33a1 1 0 0 0 0-.66 7.5 7.5 0 0 0-13.888 0 1 1 0 0 0 0 .66 7.5 7.5 0 0 0 13.888 0" />
                            </svg>
                            View
                          </button>
                        </td>

                      )}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={userRole === "manager" ? 12 : 11} className="text-center py-6 text-gray-500">
                      No transactions found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Transaction Details Modal */}
          {selectedTransaction && (
            <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50 p-4">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl p-6 relative animate-slideIn">
                <button className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 font-bold text-xl" onClick={() => setSelectedTransaction(null)}>×</button>
                <h2 className="text-2xl font-bold mb-6 border-b pb-2 text-gray-800">Transaction Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700 mb-6">
                  <div><p className="font-semibold">Cashier:</p><p>{getCashierName(selectedTransaction.cashierId)}</p></div>
                  <div><p className="font-semibold">Customer:</p><p>{getCustomerName(selectedTransaction.customerId)}</p></div>
                  <div><p className="font-semibold">Payment Method:</p><p>{selectedTransaction.paymentMethod}</p></div>
                  <div><p className="font-semibold">Date:</p><p>{new Date(selectedTransaction.createdAt).toLocaleString()}</p></div>
                  <div><p className="font-semibold">Total Amount:</p><p className="text-green-600 font-bold text-lg">₹{selectedTransaction.totalAmount.toFixed(2)}</p></div>
                  <div><p className="font-semibold">Coupon:</p><p>{selectedTransaction.couponCode || "None"}</p></div>
                  <div><p className="font-semibold">Coupon Discount:</p><p>₹{selectedTransaction.couponDiscount?.toFixed(2) || "0.00"}</p></div>
                  <div><p className="font-semibold">Loyalty Discount:</p><p>₹{selectedTransaction.loyaltyDiscount?.toFixed(2) || "0.00"}</p></div>
                </div>

                <div className="overflow-x-auto">
                  <h3 className="text-lg font-semibold mb-2 text-gray-800">Products</h3>
                  {selectedTransaction.TransactionItems?.length > 0 ? (
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="p-2 border-b text-gray-600">Product</th>
                          <th className="p-2 border-b text-gray-600">Qty</th>
                          <th className="p-2 border-b text-gray-600">Unit Price</th>
                          <th className="p-2 border-b text-gray-600">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedTransaction.TransactionItems.map((item) => (
                          <tr key={item.id} className="hover:bg-gray-50">
                            <td className="p-2 border-b">{getProductName(item.productId)}</td>
                            <td className="p-2 border-b">{item.quantity}</td>
                            <td className="p-2 border-b">₹{item.unitPrice.toFixed(2)}</td>
                            <td className="p-2 border-b font-semibold">₹{selectedTransaction.totalAmount.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : <p className="text-gray-500">No items in this transaction.</p>}
                </div>

                <div className="mt-6 flex justify-end">
                  <Button variant="outline" onClick={() => setSelectedTransaction(null)}>Close</Button>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>
      <FooterAll />
    </div>


  );
};

export default TransactionsPage;

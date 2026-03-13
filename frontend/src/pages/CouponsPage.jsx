import React, { useEffect, useState, useMemo } from "react";
import CashierNavbar from "@/components/CashierNavbar";
import ManagerNavbar from "@/components/ManagerNavbar";
import { jwtDecode } from "jwt-decode";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import FooterAll from '../components/FootorAll';

const CouponsPage = () => {
  const [coupons, setCoupons] = useState([]);
  const [cashiers, setCashiers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [userRole, setUserRole] = useState(null);
  const [time, setTime] = useState(new Date());

  const [openDialog, setOpenDialog] = useState(false);
  const [newCoupon, setNewCoupon] = useState({ code: "", discount: "", expiryDate: "" });
  const [editingCoupon, setEditingCoupon] = useState(null);

  const token = localStorage.getItem("token");

  // Decode JWT
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

  // Fetch coupons & cashiers
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const resCoupons = await fetch("http://localhost:5000/api/coupons", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const dataCoupons = await resCoupons.json();

        const validatedCoupons = await Promise.all(
          dataCoupons.map(async (c) => {
            const validateRes = await fetch(`http://localhost:5000/api/coupons/validate/${c.code}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            const validateData = await validateRes.json();
            const now = new Date();
            const expiryDate = new Date(c.expiryDate);
            let status = "Inactive";
            if (validateData.valid && expiryDate >= now) status = "Active";
            else if (expiryDate < now) status = "Expired";
            return { ...c, status };
          })
        );
        setCoupons(validatedCoupons);

        if (userRole === "manager") {
          const resCashiers = await fetch("http://localhost:5000/api/cashiers", {
            headers: { Authorization: `Bearer ${token}` },
          });
          const dataCashiers = await resCashiers.json();
          setCashiers(dataCashiers);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token, userRole]);

  const getCashierName = (id) => cashiers.find((c) => c.id === id)?.username || `Cashier ${id}`;

  const refreshCoupons = async () => {
    const res = await fetch("http://localhost:5000/api/coupons", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setCoupons(data);
  };

  const handleAddCoupon = async () => {
    if (!newCoupon.code || !newCoupon.discount || !newCoupon.expiryDate) {
      return alert("Please fill all fields");
    }
    try {
      const res = await fetch("http://localhost:5000/api/coupons", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(newCoupon),
      });
      if (res.ok) {
        setNewCoupon({ code: "", discount: "", expiryDate: "" });
        setOpenDialog(false);
        await refreshCoupons();
      } else {
        alert("Failed to create coupon");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateCoupon = async () => {
    if (!editingCoupon) return;
    try {
      const res = await fetch(`http://localhost:5000/api/coupons/${editingCoupon.id}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(editingCoupon),
      });
      if (res.ok) {
        setEditingCoupon(null);
        setOpenDialog(false);
        await refreshCoupons();
      } else {
        alert("Failed to update coupon");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredCoupons = useMemo(() => {
    let filtered = coupons.filter(
      (c) =>
        c.code.toLowerCase().includes(search.toLowerCase()) ||
        c.status.toLowerCase().includes(search.toLowerCase())
    );

    filtered.sort((a, b) => {
      let aVal, bVal;
      switch (sortKey) {
        case "discount":
          aVal = parseFloat(a.discount);
          bVal = parseFloat(b.discount);
          break;
        case "expiryDate":
          aVal = new Date(a.expiryDate);
          bVal = new Date(b.expiryDate);
          break;
        case "status":
          aVal = a.status.toLowerCase();
          bVal = b.status.toLowerCase();
          break;
        case "code":
        default:
          aVal = a.code.toLowerCase();
          bVal = b.code.toLowerCase();
      }
      if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
      if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [coupons, search, sortKey, sortOrder]);

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {/* Navbar */}
      {userRole === "manager" ? <ManagerNavbar time={time} /> : <CashierNavbar time={time} />}

      {/* Main Content */}
      <main className="flex-grow max-w-full px-4 sm:px-6 lg:px-8 py-6">


        {/* Search & Sort */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <h2 className="text-2xl font-bold text-gray-800 w-full sm:w-auto mb-2 sm:mb-0">
            Coupons List
          </h2>

          {/* Search Input */}
          <div className="relative w-full sm:w-96">
            {/* Search Icon */}
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
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
                className="text-gray-400"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>

            {/* Input Field */}
            <input
              type="text"
              placeholder="Search by code or status..."
              className="w-full sm:w-96 pl-10 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>


          {/* Sort Buttons */}
          <div className="flex flex-wrap gap-2">
            {["code", "discount", "expiryDate", "status"].map((key) => (
              <button
                key={key}
                className={`px-3 py-2 rounded-lg border transition-colors ${sortKey === key
                  ? "bg-blue-700 text-white border-blue-700"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                  }`}
                onClick={() => {
                  if (sortKey === key) setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                  else {
                    setSortKey(key);
                    setSortOrder("asc");
                  }
                }}
              >
                {key.charAt(0).toUpperCase() + key.slice(1)}
                {sortKey === key ? (sortOrder === "asc" ? " ↑" : " ↓") : ""}
              </button>
            ))}
          </div>

          {/* Create Coupon Button (Manager Only) */}
          {userRole === "manager" && (
            <Button
              onClick={() => {
                setEditingCoupon(null);
                setOpenDialog(true);
              }}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow-md"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-banknote-arrow-up-icon lucide-banknote-arrow-up"><path d="M12 18H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5" /><path d="M18 12h.01" /><path d="M19 22v-6" /><path d="m22 19-3-3-3 3" /><path d="M6 12h.01" /><circle cx="12" cy="12" r="2" /></svg> Create Coupon
            </Button>
          )}
        </div>


        {/* Coupons Table */}
        <div className="overflow-x-auto rounded-lg shadow-lg bg-white">
          <table className="w-full text-left border-collapse">
            <thead className="bg-blue-700 text-white">
              <tr>
                <th className="px-6 py-3 text-sm font-medium uppercase tracking-wider">Code</th>
                <th className="px-6 py-3 text-sm font-medium uppercase tracking-wider">Discount</th>
                {userRole === "manager" && (
                  <th className="px-6 py-3 text-sm font-medium uppercase tracking-wider">Created Date</th>
                )}
                <th className="px-6 py-3 text-sm font-medium uppercase tracking-wider">Expiry Date</th>
                <th className="px-6 py-3 text-sm font-medium uppercase tracking-wider">Status</th>
                {userRole === "manager" && (
                  <>
                    <th className="px-6 py-3 text-sm font-medium uppercase tracking-wider">Actions</th>
                    <th className="px-6 py-3 text-sm font-medium uppercase tracking-wider">Updated Time</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={userRole === "manager" ? 7 : 4} className="text-center py-6 text-gray-500">
                    Loading coupons...
                  </td>
                </tr>
              ) : filteredCoupons.length > 0 ? (
                filteredCoupons.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-6 py-4 font-medium text-gray-800">{c.code}</td>
                    <td className="px-6 py-4 font-medium text-gray-800">{c.discount}% OFF</td>
                    {userRole === "manager" && (
                      <td className="px-6 py-4 text-gray-600">{new Date(c.createdAt).toLocaleDateString()}</td>
                    )}
                    <td className="px-6 py-4 text-gray-600">{new Date(c.expiryDate).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${c.status === "Active"
                          ? "bg-green-100 text-green-800"
                          : c.status === "Expired"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                          }`}
                      >
                        {c.status}
                      </span>
                    </td>
                    {userRole === "manager" && (
                      <>
                        <td className="px-6 py-4 flex gap-2">
                          <Button
                            onClick={() => {
                              setEditingCoupon(c);
                              setOpenDialog(true);
                            }}
                            className="bg-yellow-500 hover:bg-yellow-600 text-white"
                          >
                            Edit
                          </Button>
                        </td>
                        <td className="px-6 py-4 text-gray-600">{new Date(c.updatedAt).toLocaleDateString()}</td>
                      </>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={userRole === "manager" ? 7 : 4} className="text-center py-6 text-gray-500">
                    No coupons found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>

      {/* Footer */}
      <FooterAll />
    </div>
  );
};

export default CouponsPage;

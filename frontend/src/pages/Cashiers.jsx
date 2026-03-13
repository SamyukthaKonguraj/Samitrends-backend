import React, { useEffect, useState } from "react";
import ManagerNavbar from "@/components/ManagerNavbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import FooterAll from "../components/FootorAll";

const Cashiers = () => {
  const [cashiers, setCashiers] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("All"); // NEW
  const [time, setTime] = useState(new Date());
  const [dialog, setDialog] = useState({
    open: false,
    action: null,
    cashier: null,
    note: "",
    updateData: {},
  });
  const [sortKey, setSortKey] = useState("username");

  const token = localStorage.getItem("token");

  // Clock
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch cashiers
  const fetchCashiers = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/cashiers", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setCashiers(Array.isArray(data) ? data : data.cashiers || []);
    } catch (err) {
      console.error(err);
      setCashiers([]);
    }
  };

  useEffect(() => {
    fetchCashiers();
  }, []);

  // Approve / Reject / Delete / Update
  const handleApproveReject = async (id, action, note = "") => {
    try {
      const res = await fetch(`http://localhost:5000/api/cashiers/${id}/${action}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ note }),
      });
      if (res.ok) fetchCashiers();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/api/cashiers/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) fetchCashiers();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdate = async (id, data) => {
    try {
      const res = await fetch(`http://localhost:5000/api/cashiers/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (res.ok) fetchCashiers();
    } catch (err) {
      console.error(err);
    }
  };

  // Separate lists
  const approvedCashiers = (cashiers || []).filter((c) => c.status === "approved");
  const pendingCashiers = (cashiers || []).filter((c) => c.status === "pending");
  const rejectedCashiers = (cashiers || []).filter((c) => c.status === "rejected");

  // Unique Branch List (auto-generated)
  const branches = ["All", ...new Set(cashiers.map((c) => c.location).filter(Boolean))];

  // Search + sort + branch filter
  const filterSort = (list) => {
    let filtered = list.filter(
      (c) =>
        ((c.username || "").toLowerCase().includes(search.toLowerCase()) ||
          (c.location || "").toLowerCase().includes(search.toLowerCase())) &&
        (selectedBranch === "All" || c.location === selectedBranch)
    );

    return filtered.sort((a, b) =>
      sortKey === "username"
        ? String(a.username || "").localeCompare(String(b.username || ""))
        : String(a.location || "").localeCompare(String(b.location || ""))
    );
  };

  // Confirm dialog actions
  const confirmAction = () => {
    const { action, cashier, note, updateData } = dialog;
    if (!cashier) return;

    if (action === "delete") handleDelete(cashier.id);
    else if (action === "approve" || action === "reject")
      handleApproveReject(cashier.id, action, note || "");
    else if (action === "update") handleUpdate(cashier.id, updateData);

    setDialog({ open: false, action: null, cashier: null, note: "", updateData: {} });
  };

  // Render card view
  const renderCards = (list, title, color) => {
    const filteredList = filterSort(list);
    if (filteredList.length === 0) return null;

    return (
      <div className="m-6">
        <h3 className={`text-xl font-semibold mb-4 ${color}`}>{title}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredList.map((c) => (
            <Card key={c.id} className="shadow-md border rounded-2xl">
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center mt-5">
                  <span className="font-semibold text-gray-800">{c.username}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">{c.location || "-"}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-semibold ${c.status === "approved"
                        ? "bg-green-100 text-green-700"
                        : c.status === "rejected"
                          ? "bg-red-100 text-red-700"
                          : "bg-yellow-100 text-yellow-700"
                        }`}
                    >
                      {c.status === "approved"
                        ? "Active"
                        : c.status.charAt(0).toUpperCase() + c.status.slice(1)}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between text-sm text-gray-700">
                  <span>
                    <b>
                      {c.fullName
                        ? c.fullName.charAt(0).toUpperCase() + c.fullName.slice(1)
                        : "-"}
                    </b>
                  </span>
                  <span className="flex items-center gap-1 text-gray-700">
                    <b className="flex items-center gap-1">
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
                        className="lucide lucide-phone text-gray-400"
                      >
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                      </svg>
                      :
                    </b>
                    {c.mobile || "-"}
                  </span>

                </div>

                <div className="flex justify-between text-sm text-gray-700">
                  <span className="flex items-center gap-1">
                    <b className="flex items-center gap-1">
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
                        className="lucide lucide-mail text-gray-800"
                      >
                        <path d="m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7" />
                        <rect x="2" y="4" width="20" height="16" rx="2" />
                      </svg>
                      :
                    </b>
                    {c.email || "-"}
                  </span>
                </div>


                <div className="flex justify-between text-sm text-gray-700">
                  <span>
                    <b>Approved By:</b> {c.approvedBy || "-"}
                  </span>
                  <span>
                    <b>Date:</b>{" "}
                    {c.approvalDate ? new Date(c.approvalDate).toLocaleDateString() : "-"}
                  </span>
                </div>

                <div className="flex justify-between text-sm text-gray-700">
                  <span>
                    <b>Created:</b>{" "}
                    {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : "-"}
                  </span>
                  <span>
                    <b>Updated:</b>{" "}
                    {c.updatedAt ? new Date(c.updatedAt).toLocaleDateString() : "-"}
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 mt-2 flex-wrap">
                  {(c.status === "pending" || c.status === "rejected") && (
                    <Button
                      className="bg-green-600 hover:bg-green-700 text-white"
                      onClick={() => setDialog({ open: true, action: "approve", cashier: c })}
                    ><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-signature-icon lucide-signature"><path d="m21 17-2.156-1.868A.5.5 0 0 0 18 15.5v.5a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1c0-2.545-3.991-3.97-8.5-4a1 1 0 0 0 0 5c4.153 0 4.745-11.295 5.708-13.5a2.5 2.5 0 1 1 3.31 3.284" /><path d="M3 21h18" /></svg>
                      Approve
                    </Button>
                  )}
                  {c.status === "pending" && (
                    <Button
                      className="bg-red-600 hover:bg-red-700 text-white"
                      onClick={() => setDialog({ open: true, action: "reject", cashier: c })}
                    ><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-clock-alert-icon lucide-clock-alert"><path d="M12 6v6l4 2" /><path d="M20 12v5" /><path d="M20 21h.01" /><path d="M21.25 8.2A10 10 0 1 0 16 21.16" /></svg>
                      Reject
                    </Button>
                  )}
                  {c.status === "approved" && (
                    <Button
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                      onClick={() =>
                        setDialog({
                          open: true,
                          action: "update",
                          cashier: c,
                          updateData: { ...c },
                        })
                      }
                    ><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-square-pen h-4 w-4"><path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z"></path></svg>
                      Update
                    </Button>
                  )}
                  <Button
                    className="bg-gray-600 hover:bg-gray-700 text-white"
                    onClick={() => setDialog({ open: true, action: "delete", cashier: c })}
                  ><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trash2 h-4 w-4"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path><line x1="10" x2="10" y1="11" y2="17"></line><line x1="14" x2="14" y1="11" y2="17"></line></svg>
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <ManagerNavbar time={time} />

      <main className="flex-1 p-6 overflow-y-auto">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 ">Cashier Group</h2>

        {/* Search + Branch Filter */}
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
          <input
            type="text"
            placeholder="Search by username or branch..."
            className="w-2/3 border border-gray-300 px-3 py-2 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {/* Branch Filter Buttons */}

        </div>
        <div className="flex flex-wrap gap-2 mt-4">
          {branches.map((branch) => (
            <Button
              key={branch}
              variant={selectedBranch === branch ? "default" : "outline"}
              className={`text-sm ${selectedBranch === branch
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "border-gray-400 text-gray-700 hover:bg-gray-100"
                }`}
              onClick={() => setSelectedBranch(branch)}
            >
              {branch}
            </Button>
          ))}
        </div>

        {/* Render Cashiers by Status */}
        {renderCards(pendingCashiers, "Pending Cashiers", "text-yellow-600")}
        {renderCards(approvedCashiers, "Active Cashiers", "text-green-600")}
        {renderCards(rejectedCashiers, "Rejected Cashiers", "text-red-600")}
      </main>
      <FooterAll />

      {/* Dialog */}
      <Dialog open={dialog.open} onOpenChange={(open) => setDialog({ ...dialog, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {dialog.action === "update"
                ? "Update Cashier Details"
                : "Confirm Action"}
            </DialogTitle>
          </DialogHeader>

          {/* Update Form */}
          {dialog.action === "update" ? (
            <>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-600">
                  Full Name :
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg p-3 text-sm"
                  value={dialog.updateData.fullName || ""}
                  onChange={(e) =>
                    setDialog((prev) => ({
                      ...prev,
                      updateData: { ...prev.updateData, fullName: e.target.value },
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-600">
                  Mobile Number :
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg p-3 text-sm"
                  value={dialog.updateData.mobile || ""}
                  onChange={(e) =>
                    setDialog((prev) => ({
                      ...prev,
                      updateData: { ...prev.updateData, mobile: e.target.value },
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-600">
                  Branch :
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg p-3 text-sm"
                  value={dialog.updateData.location || ""}
                  onChange={(e) =>
                    setDialog((prev) => ({
                      ...prev,
                      updateData: { ...prev.updateData, location: e.target.value },
                    }))
                  }
                />
              </div>
            </>
          ) : (
            <p className="my-2">
              Are you sure you want to{" "}
              <b className="capitalize">{dialog.action}</b> cashier{" "}
              <b>{dialog.cashier?.username}</b>?
            </p>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() =>
                setDialog({ open: false, action: null, cashier: null, note: "", updateData: {} })
              }
            >
              Cancel
            </Button>
            <Button
              className={`${dialog.action === "delete"
                ? "bg-gray-600 hover:bg-gray-700"
                : dialog.action === "approve"
                  ? "bg-green-600 hover:bg-green-700"
                  : dialog.action === "reject"
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-blue-600 hover:bg-blue-700"
                } text-white`}
              onClick={confirmAction}
            >
              {dialog.action?.charAt(0).toUpperCase() + dialog.action?.slice(1)}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>

  );
};

export default Cashiers;

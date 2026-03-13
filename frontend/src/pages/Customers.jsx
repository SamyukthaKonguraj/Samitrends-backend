import React, { useEffect, useState, useMemo } from "react";
import ManagerNavbar from "@/components/ManagerNavbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";


import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import FooterAll from "../components/FootorAll";

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const [newCustomer, setNewCustomer] = useState({ name: "", mobile: "" });
  const [time, setTime] = useState(new Date());
  const [sortOrder, setSortOrder] = useState("asc"); // toggle sorting
  const [sortField, setSortField] = useState("points"); // "points" or "name"
  const [editPoints, setEditPoints] = useState({});
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const token = localStorage.getItem("token");

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchCustomers = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/customers", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
setCustomers(Array.isArray(data) ? data : data.customers || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleAddCustomer = async () => {
    if (!newCustomer.name || !newCustomer.mobile)
      return alert("Please enter name and mobile");
    try {
      const res = await fetch("http://localhost:5000/api/customers", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...newCustomer, points: 0 }),
      });
      if (res.ok) {
        setNewCustomer({ name: "", mobile: "" });
        fetchCustomers();
      } else {
        alert("Failed to add customer");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdatePoints = async (id) => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/customers/${id}/points`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ points: editPoints[id] }),
        }
      );
      if (res.ok) {
        setEditPoints((prev) => ({ ...prev, [id]: "" }));
        fetchCustomers();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // filter + sort customers
  const filteredCustomers = useMemo(() => {
    let filtered = customers.filter(
      (c) =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.mobile.includes(search)
    );

    filtered.sort((a, b) => {
      let valA =
        sortField === "points" ? a.points : a.name.toLowerCase();
      let valB =
        sortField === "points" ? b.points : b.name.toLowerCase();

      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [customers, search, sortOrder, sortField]);

  // paginated slice
  const paginatedCustomers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return filteredCustomers.slice(start, end);
  }, [filteredCustomers, currentPage]);

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <ManagerNavbar time={time} />

      <main className="flex-1 p-6 overflow-y-auto">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Customers</h2>
        {/* Top bar */}
        <div className="flex flex-wrap items-center justify-between mb-6 bg-white shadow-sm p-4 rounded-lg sticky top-0 z-10 gap-3">
          <div className="relative w-full md:w-2/3">
            {/* Icon */}
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
                <circle cx="10" cy="7" r="4" />
                <path d="M10.3 15H7a4 4 0 0 0-4 4v2" />
                <circle cx="17" cy="17" r="3" />
                <path d="m21 21-1.9-1.9" />
              </svg>
            </div>

            {/* Input */}
            <Input
              placeholder="Search by name or mobile..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10" // padding-left to make space for the icon
            />
          </div>


          <div className="flex gap-2">
            {/* Sort field selector */}


            {/* Sort order toggle */}
            <Button
              onClick={() =>
                setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))
              }
              className="bg-blue-600 hover:bg-blue-700 text-white"
            ><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-down-az-icon lucide-arrow-down-a-z"><path d="m3 16 4 4 4-4" /><path d="M7 20V4" /><path d="M20 8h-5" /><path d="M15 10V6.5a2.5 2.5 0 0 1 5 0V10" /><path d="M15 14h5l-5 6h5" /></svg>
              {sortOrder === "asc" ? "Ascending" : "Descending"}
            </Button>

            {/* Add Customer Dialog */}
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-green-600 hover:bg-green-700 text-white">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-plus h-4 w-4 mr-2"><path d="M5 12h14"></path><path d="M12 5v14"></path></svg> Add Customer
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Add Customer</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-2">
                  <Input
                    placeholder="Name"
                    value={newCustomer.name}
                    onChange={(e) =>
                      setNewCustomer({ ...newCustomer, name: e.target.value })
                    }
                  />
                  <Input
                    placeholder="Mobile"
                    value={newCustomer.mobile}
                    onChange={(e) =>
                      setNewCustomer({ ...newCustomer, mobile: e.target.value })
                    }
                  />
                </div>
                <DialogFooter>
                  <Button
                    onClick={async () => {
                      await handleAddCustomer();
                      setIsAddDialogOpen(false);
                    }}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    Add
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Card Grid */}
        {paginatedCustomers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {paginatedCustomers.map((c, index) => (
              <div
                key={c.id}
                className="bg-white p-5 rounded-xl shadow-md hover:shadow-lg transition"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-800">
                    {c.name}
                  </h3>
                  <span className="text-sm text-gray-500">
                    #{(currentPage - 1) * itemsPerPage + index + 1}
                  </span>
                </div>
                <div className="flex items-center justify-between mb-3">
                  {/* Phone Number */}
                  <p className="flex items-center text-gray-600 mb-0 gap-1">
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
                    {c.mobile || "N/A"}
                  </p>

                  {/* Loyalty Points */}
                  <p className="text-green-700 font-bold">
                    {c.points || 0}{" "}
                    <span className="font-medium">Loyalty Points</span>
                  </p>
                </div>


                {/* Update Points Dialog */}
                <Dialog
                  open={isUpdateDialogOpen[c.id] || false}
                  onOpenChange={(open) =>
                    setIsUpdateDialogOpen((prev) => ({ ...prev, [c.id]: open }))
                  }
                >
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full mt-4"
                    ><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-square-pen h-4 w-4"><path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z"></path></svg>
                      Update Points
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                      <DialogTitle>Update Points</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-2">
                      <Input
                        type="number"
                        value={editPoints[c.id] ?? c.points}
                        onChange={(e) =>
                          setEditPoints((prev) => ({
                            ...prev,
                            [c.id]: Number(e.target.value),
                          }))
                        }
                      />
                    </div>
                    <DialogFooter>
                      <Button
                        onClick={async () => {
                          await handleUpdatePoints(c.id);
                          setIsUpdateDialogOpen((prev) => ({
                            ...prev,
                            [c.id]: false,
                          }));
                        }}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white"
                      ><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-square-pen h-4 w-4"><path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z"></path></svg>
                        Update
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 text-gray-500 italic">
            No customers found
          </div>
        )}

        {/* Pagination Controls */}
        {filteredCustomers.length > itemsPerPage && (
          <div className="flex justify-center mt-6">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={() =>
                      setCurrentPage((p) => Math.max(1, p - 1))
                    }
                  />
                </PaginationItem>

                {Array.from(
                  { length: Math.ceil(filteredCustomers.length / itemsPerPage) },
                  (_, i) => (
                    <PaginationItem key={i}>
                      <PaginationLink
                        href="#"
                        isActive={currentPage === i + 1}
                        onClick={() => setCurrentPage(i + 1)}
                      >
                        {i + 1}
                      </PaginationLink>
                    </PaginationItem>
                  )
                )}

                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={() =>
                      setCurrentPage((p) =>
                        Math.min(
                          Math.ceil(filteredCustomers.length / itemsPerPage),
                          p + 1
                        )
                      )
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}

      </main>
      <FooterAll />
    </div>
  );
};

export default Customers;

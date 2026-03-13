import React, { useEffect, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const CashierNavbar = ({ time }) => {
  const navigate = useNavigate();
  const [cashier, setCashier] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setLoading(false);
      return;
    }

    fetch("http://localhost:5000/api/cashiers/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch cashier");
        return res.json();
      })
      .then((data) => {
        setCashier(data);
      })
      .catch((err) => {
        console.error(err);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = async () => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        await fetch("http://localhost:5000/api/auth/logout", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (err) {
        console.error("Logout failed:", err);
      }
    }
    localStorage.removeItem("token");
    window.location.href = "/";
  };


  return (
    <header className="bg-blue-700 text-white p-4 flex justify-between items-center shadow-lg">
      {/* Sidebar */}
      <Sheet>
        <SheetTrigger asChild>
          <h1 className="text-xl font-bold cursor-pointer ml-12">
            SAMY TRENDS - Dashboard
          </h1>
        </SheetTrigger>
        <SheetContent
          side="left"
          className="w-80 sm:w-65 flex flex-col justify-between"
        >
          <div>
            <SheetHeader>
              <SheetTitle className="text-xl font-bold">SAMY TRENDS</SheetTitle>
            </SheetHeader>
            <nav className="mt-8 space-y-3">
              <Button
                variant="secondary"
                className="w-full justify-start text-sm"
                onClick={() => navigate("/cashier")}
              ><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-scan-barcode h-5 w-5"><path d="M3 7V5a2 2 0 0 1 2-2h2"></path><path d="M17 3h2a2 2 0 0 1 2 2v2"></path><path d="M21 17v2a2 2 0 0 1-2 2h-2"></path><path d="M7 21H5a2 2 0 0 1-2-2v-2"></path><path d="M8 7v10"></path><path d="M12 7v10"></path><path d="M17 7v10"></path></svg>
                Home
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start text-sm "
                onClick={() => navigate("/transactions")}
              ><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-user-cog h-5 w-5"><circle cx="18" cy="15" r="3"></circle><circle cx="9" cy="7" r="4"></circle><path d="M10 15H6a4 4 0 0 0-4 4v2"></path><path d="m21.7 16.4-.9-.3"></path><path d="m15.2 13.9-.9-.3"></path><path d="m16.6 18.7.3-.9"></path><path d="m19.1 12.2.3-.9"></path><path d="m19.6 18.7-.4-1"></path><path d="m16.8 12.3-.4-1"></path><path d="m14.3 16.6 1-.4"></path><path d="m20.7 13.8 1-.4"></path></svg>
                Transactions
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start text-sm"
                onClick={() => navigate("/coupons")}
              ><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-layout-dashboard h-5 w-5"><rect width="7" height="9" x="3" y="3" rx="1"></rect><rect width="7" height="5" x="14" y="3" rx="1"></rect><rect width="7" height="9" x="14" y="12" rx="1"></rect><rect width="7" height="5" x="3" y="16" rx="1"></rect></svg>
                Coupons
              </Button>
            </nav>
          </div>

          {/* User info + Logout */}
          <div className="border-t pt-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-lg">
                {cashier?.fullName?.charAt(0).toUpperCase()}
              </div>
              <div className="flex flex-col leading-tight">
                <span className="font-medium">{cashier?.fullName || "Guest"}</span>
                <span className="text-xs text-gray-400">{cashier?.username}</span>
              </div>
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleLogout}

            ><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-log-out h-4 w-4 mr-2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" x2="9" y1="12" y2="12"></line></svg>
              Logout
            </Button>
          </div>
        </SheetContent>
      </Sheet>


      {/* Right side (status + clock) */}
      <div className="text-sm flex items-center gap-3 mr-7">
        {loading ? (
          "Loading cashier..."
        ) : cashier ? (
          <>
            
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
              {cashier.username.charAt(0).toUpperCase()}
            </div>
            <div className="flex flex-col leading-tight">
              <span className="font-semibold">{cashier.fullName}</span>
              <span className="text-xs text-gray-200">
                {time &&
                  `${time.toLocaleString("en-IN", {
                    hour12: true,
                  })} (${time.toLocaleDateString("en-US", { weekday: "long" })})`}
              </span>

            </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  localStorage.removeItem("token");
                  window.location.href = "/";
                }}
              ><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-log-out h-4 w-4 mr-2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" x2="9" y1="12" y2="12"></line></svg>
                Logout
              </Button>
            <div className="ml-1 flex items-center gap-1 px-2 py-1 rounded-full">
              <span className="text-ms px-2 py-1 font-semibold">
                {cashier.status === "approved" ? "Active" : cashier.status}
              </span>
              <span
                className={`w-3 h-3 rounded-full ${cashier.status === "approved" ? "bg-red-600" : "bg-lime-500"
                  } animate-pulse`}
              ></span>
            </div>

          </>
        ) : (
          "Cashier not found"
        )}
      </div>
    </header>
  );
};

export default CashierNavbar;

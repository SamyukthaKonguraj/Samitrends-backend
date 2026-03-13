import React from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const ManagerNavbar = ({ manager: propManager, loading, time }) => {
  const navigate = useNavigate();

  // Decode JWT if propManager is not passed
  let manager = propManager;
  if (!manager) {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        manager = {
          username: decoded.username,
          fullname: decoded.fullname,
          role: decoded.role,
          status: decoded.status || "approved",
          id: decoded.id,
        };
      } catch (err) {
        console.error("Invalid token", err);
      }
    }
  }

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
            SAMY TRENDS Dashboard
          </h1>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 flex flex-col justify-between">
          <div>
            <SheetHeader>
              <SheetTitle className="font-sans font-medium flex items-center gap-2 text-black">

                SAMY TRENDS
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-store"
                >
                  <path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7" />
                  <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                  <path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4" />
                  <path d="M2 7h20" />
                  <path d="M22 7v3a2 2 0 0 1-2 2a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 12a2 2 0 0 1-2-2V7" />
                </svg>
              </SheetTitle>
            </SheetHeader>

            <nav className="mt-4 space-y-2">

              <Button
                variant="ghost"
                className="w-full justify-start "
                onClick={() => navigate("/manager")}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chart-column h-5 w-5"><path d="M3 3v16a2 2 0 0 0 2 2h16"></path><path d="M18 17V9"></path><path d="M13 17V5"></path><path d="M8 17v-3"></path></svg>
                Home
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => navigate("/products")}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-package h-5 w-5"><path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z"></path><path d="M12 22V12"></path><path d="m3.3 7 7.703 4.734a2 2 0 0 0 1.994 0L20.7 7"></path><path d="m7.5 4.27 9 5.15"></path></svg>
                Inventory
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => navigate("/customers")}
              ><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-users h-5 w-5"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                Customers
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => navigate("/cashiers")}
              ><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-users h-5 w-5"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                Cashiers
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start flex items-center gap-2"
                onClick={() => navigate("/transactions")}
              >
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
                  className="lucide lucide-warehouse"
                >
                  <path d="M22 8.35V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8.35A2 2 0 0 1 3.26 6.5l8-3.2a2 2 0 0 1 1.48 0l8 3.2A2 2 0 0 1 22 8.35Z"></path>
                  <path d="M6 18h12"></path>
                  <path d="M6 14h12"></path>
                  <rect width="12" height="12" x="6" y="10"></rect>
                </svg>
                Transactions
              </Button>


              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => navigate("/coupons")}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-layout-dashboard h-5 w-5"><rect width="7" height="9" x="3" y="3" rx="1"></rect><rect width="7" height="5" x="14" y="3" rx="1"></rect><rect width="7" height="9" x="14" y="12" rx="1"></rect><rect width="7" height="5" x="3" y="16" rx="1"></rect></svg>
                Coupons
              </Button>
            </nav>
          </div>

          {/* User info + Logout */}
          <div className="border-t pt-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center text-white font-bold">
                {manager?.role?.charAt(0).toUpperCase()}
              </div>
              <div className="flex flex-col leading-tight">
                <span className="font-medium">{manager?.username?.charAt(0).toUpperCase() + manager?.username.slice(1) || "Guest"}</span>
                <span className="text-xs text-gray-400">
                  {manager?.role?.charAt(0).toUpperCase() + manager?.role?.slice(1)}
                </span>
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

      {/* Right side (status + timestamp) */}
      <div className="text-sm flex items-center gap-3 mr-4">
        {manager ? (
          <>


            <div className="w-10 h-10 rounded-full bg-green-500 flex items-center ml-3 justify-center text-white font-bold">
              {manager.role.charAt(0).toUpperCase()}
            </div>
            <div className="flex flex-col leading-tight mr-2">
              <span className="font-semibold text-1xl">{manager.username.charAt(0).toUpperCase() + manager?.username?.slice(1)}</span>
              <span className="text-sm text-gray-200">{manager.role.charAt(0).toUpperCase() + manager?.role?.slice(1)}</span>
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

            {time && (
              <div className="text-sm font-medium">
                {/* Short Format with seconds, 24-hour */}
                <div>
                  {time.toLocaleString("en-GB", {
                    hour12: false,
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>


                {/* Long Format: Thursday, October 9, 2025 at 15:34:05 */}
                <div className="text-sm text-gray-200 mt-0">
                  {new Intl.DateTimeFormat("en-US", {

                    day: "numeric",
                    month: "long",
                    weekday: "long",

                    hour12: false, // 24-hour format
                  }).format(time)}
                </div>
              </div>
            )}




          </>
        ) : loading ? (
          "Loading..."
        ) : (
          "Manager not found"
        )}
      </div>
    </header>
  );
};

export default ManagerNavbar;

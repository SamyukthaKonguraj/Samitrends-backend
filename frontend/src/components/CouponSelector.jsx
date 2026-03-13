import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function CouponSelector({ onApply }) {
  const [open, setOpen] = useState(false);
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(false);

  // fetch coupons when dialog opens
  useEffect(() => {
    if (open) {
      setLoading(true);

      const token = localStorage.getItem("token"); // get from localStorage

      fetch("http://localhost:5000/api/coupons", {
        headers: {
          Authorization: `Bearer ${token}`, // attach token
          "Content-Type": "application/json",
        },
      })
        .then((res) => {
          if (!res.ok) throw new Error("Unauthorized");
          return res.json();
        })
        .then((data) => {
          // filter only valid coupons
          const validCoupons = data.filter(
            (c) => new Date(c.expiryDate) > new Date()
          );
          setCoupons(validCoupons);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [open]);

  const applyCoupon = (coupon) => {
    onApply(coupon); // pass to parent (transaction/cart)
    setOpen(false);
  };

  return (
    <div className="flex items-center gap-2">
      {/* Trigger Button */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="w-full">Select Coupon</Button>
        </DialogTrigger>

        {/* Dialog Content */}
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Select a Coupon</DialogTitle>
          </DialogHeader>

          {loading ? (
            <p>Loading coupons...</p>
          ) : coupons.length > 0 ? (
            <ul className="max-h-64 overflow-y-auto space-y-2">
              {coupons.map((c) => (
                <li
                  key={c.id}
                  className="p-3 border rounded cursor-pointer hover:bg-gray-100"
                  onClick={() => applyCoupon(c)}
                >
                  <div className="flex justify-between items-center font-semibold">
                    <span>{c.code}</span>
                    <span className="text-sm text-gray-600">
                      {c.discount}% off
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No valid coupons available</p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

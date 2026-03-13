import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardTitle,
} from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import toast, { Toaster } from "react-hot-toast";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import CouponSelector from "./CouponSelector";
import { useNavigate } from "react-router-dom";
import CashierNavbar from "./CashierNavbar";
import { Footer } from "react-day-picker";

const CashierDashboard = () => {
  const navigate = useNavigate();
  const [time, setTime] = useState(new Date());
  const [cashier, setCashier] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState([]);
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [qty, setQty] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [open, setOpen] = useState(false);

  // Customer states
  const [customers, setCustomers] = useState([]);
  const [showCustomerSearch, setShowCustomerSearch] = useState(false);
  const [customerSearchTerm, setCustomerSearchTerm] = useState("");
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [newCustomer, setNewCustomer] = useState({ name: "", mobile: "" });

  // Coupon
  const [appliedCoupon, setAppliedCoupon] = useState(null);

  // Payment method
  const [paymentMethod, setPaymentMethod] = useState("cash");

  // Transactions
  const [transactions, setTransactions] = useState([]);

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:5000/api/products", {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        });
        const data = await res.json();
        setProducts(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchProducts();
  }, []);

  // Fetch cashier
  useEffect(() => {
    const fetchCashier = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:5000/api/cashiers/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setCashier(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCashier();
  }, []);

  // Fetch customers
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:5000/api/customers", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setCustomers(data);
        setFilteredCustomers(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchCustomers();
  }, []);

  // Filter products
  const filteredProducts = products.filter(
    (p) =>
      (p.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (p.barcode?.toLowerCase() || "").includes(searchTerm.toLowerCase())
  );

  // Filter customers dynamically
  useEffect(() => {
    setFilteredCustomers(
      customers.filter(
        (c) =>
          c.name.toLowerCase().includes(customerSearchTerm.toLowerCase()) ||
          c.mobile.includes(customerSearchTerm)
      )
    );
  }, [customerSearchTerm, customers]);

  // Cart operations
  const handleAddClick = (product) => {
    setSelectedProduct(product);
    setQty(1);
    setOpen(true);
  };

  const handleConfirm = () => {
    if (!selectedProduct) return;

    const exists = cart.find(item => item.id === selectedProduct.id);
    if (exists) {
      setCart(cart.map(item =>
        item.id === selectedProduct.id ? { ...item, qty } : item
      ));
    } else {
      setCart([...cart, { ...selectedProduct, qty }]);
    }
    setOpen(false);

  };

  const removeFromCart = (id) => setCart(cart.filter((item) => item.id !== id));
  const updateQty = (id, newQty) => {
    if (newQty <= 0) {
      removeFromCart(id);
    } else {
      setCart(cart.map(item =>
        item.id === id ? { ...item, qty: newQty } : item
      ));
    }
  };

  // Subtotal
  const subtotal = cart.reduce((sum, i) => sum + i.price * i.qty, 0);

  // Coupon discount (no rounding here)
  const discountAmount = appliedCoupon ? (subtotal * appliedCoupon.discount) / 100 : 0;

  // Loyalty discount (use exact fractional value)
  const loyaltyDiscount = selectedCustomer?.pointsUsed
    ? (selectedCustomer.pointsUsed / 100) * 10
    : 0;

  // Total: round only at final step to 2 decimals
  const total = Math.round((subtotal - discountAmount - loyaltyDiscount) * 100) / 100;



  // Checkout
  const checkout = async () => {
    if (cart.length === 0) return alert("Cart is empty");

    try {
      const token = localStorage.getItem("token");
      const payload = {
        items: cart.map((i) => ({ productId: i.id, qty: i.qty, unitPrice: i.price })),
        paymentMethod,
        customerId: selectedCustomer?.id || null,
        couponCode: appliedCoupon?.code || null,
        loyaltyPointsUsed: selectedCustomer?.points || 0,
      };

      const res = await fetch("http://localhost:5000/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Transaction failed");

      /// Refresh transaction list
      await fetchTransactions();

      // Print the bill
      window.print();

      // Clear cart & reset states
      setCart([]);
      setAppliedCoupon(null);
      setSelectedCustomer(null);
      toast.success("Payment completed successfully!");


    } catch (err) {
      console.error(err);
      alert(err.message || "Checkout failed");
    }
  };


  // Customer operations
  const selectCustomer = (customer) => {
    setSelectedCustomer(customer);
    setShowCustomerSearch(false);
  };

  const addNewCustomer = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(newCustomer),
      });
      const created = await res.json();
      setCustomers([...customers, created]);
      setSelectedCustomer(created);
      setShowCustomerSearch(false);
      setNewCustomer({ name: "", mobile: "" });

    } catch (err) {
      console.error(err);
      alert("Error adding customer");
    }
  };

  // Inside CashierDashboard component



  // Fetch latest 3 transactions
  const fetchTransactions = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/transactions", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();
      // Sort by newest first and take latest 3
      const sorted = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setTransactions(sorted.slice(0, 3));
    } catch (err) {
      console.error("Failed to fetch transactions", err);
    }
  };

  // Call it once on mount
  useEffect(() => {
    fetchTransactions();
  }, []);


  // Clock
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-gray-100 font-sans min-h-screen">
      {/* Navbar */}
      <CashierNavbar cashier={cashier} loading={loading} time={time} />

      <main className="flex-1 flex gap-6 overflow-hidden p-6">
        {/* Products */}
        <div className="flex-1 bg-white rounded-lg shadow p-4 flex flex-col">
          <h2 className="text-lg font-semibold mb-3">Products</h2>
          <Input placeholder="Search products..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="mb-3" />

          <ScrollArea className="flex-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {filteredProducts.length > 0 ? filteredProducts.map((product) => (
                <Card key={product.id} className="p-4 border rounded-lg flex flex-col justify-between hover:shadow-lg transition">
                  <div className="mb-2">
                    <CardTitle className="text-md font-bold">{product.name}</CardTitle>
                    <span className="text-[10px] w-40 block truncate">{product.barcode}</span>
                    <CardContent className="text-sm text-gray-600">
                      <p>Price: ₹{product.price}</p>
                      <p>Stock: {product.stock}</p>
                      {product.stock <= product.threshold && <p className="text-red-600 font-semibold">Low stock!</p>}
                    </CardContent>
                  </div>
                  <Button size="sm" onClick={() => handleAddClick(product)}>Add to Cart</Button>
                </Card>
              )) : <p className="text-gray-500 col-span-full">No results found.</p>}
            </div>
          </ScrollArea>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="max-w-xs">
              <DialogHeader><DialogTitle>Add {selectedProduct?.name}</DialogTitle></DialogHeader>
              <div className="flex flex-col gap-3 mt-2 items-center">
                <div className="flex items-center gap-4 px-3 py-1">
                  <Button variant="outline" onClick={() => setQty((prev) => (prev > 1 ? prev - 1 : 1))}>-</Button>
                  <span className="w-12 text-center text-lg font-semibold">{qty}</span>
                  <Button variant="outline" onClick={() => setQty((prev) => prev < (selectedProduct?.stock || 1) ? prev + 1 : prev)}>+</Button>
                </div>
                <Button className="w-full mt-2" onClick={handleConfirm}>Add {qty} to Cart</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Right: Customer + Billing + Transactions */}
        <div className="w-96 flex flex-col gap-4">
          {/* Customer */}
          <Card className="p-4 flex flex-col gap-2">
            <h2 className="text-lg font-semibold">Customer</h2>

            {!showCustomerSearch ? (
              <Button onClick={() => setShowCustomerSearch(true)}>
                {selectedCustomer ? selectedCustomer.name.charAt(0).toUpperCase() + selectedCustomer.name.slice(1) : "Select Customer"}
              </Button>
            ) : (
              <div>
                <Input
                  placeholder="Search by name or mobile"
                  value={customerSearchTerm}
                  onChange={(e) => setCustomerSearchTerm(e.target.value)}
                  className="mb-2"
                />
                {filteredCustomers.length > 0 ? (
                  <ul className="max-h-48 overflow-y-auto border rounded p-1">
                    {filteredCustomers.map((c) => (
                      <li
                        key={c.id}
                        className="p-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => selectCustomer(c)}
                      >
                        {c.name} ({c.mobile})
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500">No customer found</p>
                )}
                <div className="mt-2 flex flex-col gap-2">
                  <Input placeholder="New customer name" value={newCustomer.name} onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })} />
                  <Input placeholder="New customer mobile" value={newCustomer.mobile} onChange={(e) => setNewCustomer({ ...newCustomer, mobile: e.target.value })} />
                  <Button onClick={addNewCustomer}>Add Customer</Button>
                </div>
              </div>
            )}

            {selectedCustomer && !showCustomerSearch && (
              <div className="mt-2 p-2 rounded">
                <p className={`font-semibold ${selectedCustomer.points > 0 ? "text-green-600" : "text-red-800"}`}>
                  Loyalty Points: {selectedCustomer.points} | {selectedCustomer.mobile}
                </p>
              </div>
            )}
          </Card>

          {/* Billing */}
          <Card className="p-4 flex flex-col gap-2 flex-1">
            <h2 className="text-lg font-semibold">Billing</h2>

            <ScrollArea className="flex-1 mb-2">
              {cart.length > 0 ? (
                cart.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-center border-b py-2"
                  >
                    <button
                      className="px-3 py-1 border rounded bg-gray-100 hover:bg-gray-200"
                      onClick={() => {
                        setSelectedProduct(item);
                        setQty(item.qty);
                        setOpen(true);
                      }}
                    >
                      Qty: {item.qty}
                    </button>
                    <span>{item.name}</span>
                    <span>₹{item.price * item.qty}</span>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 py-10 select-none">
                  🛒 No items in the cart
                </div>
              )}
            </ScrollArea>


            <div>
              <CouponSelector onApply={(coupon) => setAppliedCoupon(coupon)} />
              {appliedCoupon && (
                <div>
                  <p className="mt-1 p-2 font-semibold text-green-600 rounded flex justify-between items-center">
                    <span>Applied: {appliedCoupon.code}</span>
                    <span>{appliedCoupon.discount}% OFF</span>
                  </p>
                </div>
              )}
            </div>

            <Separator className="my-2" />
            <div className="flex justify-between font-semibold">
              <span>Subtotal:</span>
              <span>₹{subtotal}</span>
            </div>

            {appliedCoupon && (
              <div className="flex justify-between font-semibold text-green-600">
                <span>Coupon Discount:</span>
                <span>-₹{discountAmount}</span>
              </div>
            )}

            {selectedCustomer && loyaltyDiscount > 0 && (
              <div className="flex justify-between font-semibold text-green-600">
                <span>Loyalty Discount:</span>
                <span>-₹{loyaltyDiscount}</span>
              </div>
            )}

            <div className="flex justify-between font-bold text-lg">
              <span>Total:</span>
              <span>₹{total}</span>
            </div>

            <div className="flex flex-col gap-2 mt-2">
              <label className="font-semibold text-sm">Payment Method:</label>
              <div className="flex gap-2">
                {["cash", "upi", "debit", "credit"].map((method) => (
                  <Button key={method} variant={paymentMethod === method ? "default" : "outline"} onClick={() => setPaymentMethod(method)} className="capitalize">
                    {method.replace(/^\w/, (c) => c.toUpperCase())}
                  </Button>
                ))}
              </div>
            </div>


            <Button onClick={checkout} className="mt-2 w-full">
              Payment Done
            </Button>
            <Toaster position="top-right" reverseOrder={false} />
          </Card>

          {/* Transactions */}
          <Card className="p-4 flex-1 overflow-y-auto">
            <h2 className="text-lg font-semibold mb-2">Transactions</h2>
            <ScrollArea className="h-48">
              {transactions.length > 0 ? (
                transactions.map((t) => (
                  <div key={t.id} className="flex justify-between p-2 border-b">
                    <span>{new Date(t.createdAt).toLocaleTimeString()}</span>
                    <span>₹{t.totalAmount}</span>

                    <Badge variant="success">
                      {t.paymentMethod?.toUpperCase() || "N/A"}
                    </Badge>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No transactions found</p>
              )}
            </ScrollArea>
          </Card>
          {/* Hidden printable receipt */}
          <div id="receipt" className="hidden print:block p-6 text-sm">
            <h2 className="text-center text-lg font-bold mb-2">🧾 POS Receipt</h2>
            <p>Date: {new Date().toLocaleString()}</p>
            <p>Cashier: {cashier?.fullName || "Admin"}</p>

            <hr className="my-2" />

            {cart.map((item, i) => (
              <div key={i} className="flex justify-between">
                <span>{item.name} x {item.qty}</span>
                <span>₹{(item.qty * item.price).toFixed(2)}</span>
              </div>
            ))}

            <hr className="my-2" />
            <p className="font-semibold text-right">
              Total: ₹{cart.reduce((sum, i) => sum + i.qty * i.price, 0).toFixed(2)}
            </p>

            {appliedCoupon && (
              <p className="text-right text-green-600">
                Coupon Applied: {appliedCoupon.code} (-₹{appliedCoupon.discount})
              </p>
            )}
            {selectedCustomer && (
              <p className="text-right text-blue-600">
                Customer: {selectedCustomer.fullName}
              </p>
            )}

            <p className="mt-4 text-center text-xs text-gray-600">
              Thank you for shopping with us!
            </p>
          </div>




        </div>
      </main>

    </div>
  );
};

export default CashierDashboard;

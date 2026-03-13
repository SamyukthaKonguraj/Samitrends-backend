import React, { useEffect, useState, useMemo } from "react";
import ManagerNavbar from "@/components/ManagerNavbar";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import SalesReportCard from "@/components/SalesReportCard";

// Pagination components
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationLink,
} from "@/components/ui/pagination";
import FooterAll from "../components/FootorAll";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [newProduct, setNewProduct] = useState({
    name: "",
    barcode: "",
    price: "",
    stock: "",
    threshold: "",
  });
  const [editingProduct, setEditingProduct] = useState(null);
  const [time, setTime] = useState(new Date());
  const [importFile, setImportFile] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  const token = localStorage.getItem("token");

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/products", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleAddProduct = async () => {
    try {
      const payload = { ...newProduct, barcode: newProduct.barcode.toUpperCase() };
      const res = await fetch("http://localhost:5000/api/products", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setNewProduct({ name: "", barcode: "", price: "", stock: "", threshold: "" });
        fetchProducts();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateProduct = async (id) => {
    try {
      const payload = { ...editingProduct, barcode: editingProduct.barcode.toUpperCase() };
      const res = await fetch(`http://localhost:5000/api/products/${id}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setEditingProduct(null);
        fetchProducts();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteProduct = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/api/products/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) fetchProducts();
    } catch (err) {
      console.error(err);
    }
  };

  const handleImportExcel = async () => {
    if (!importFile) return;
    const formData = new FormData();
    formData.append("file", importFile);
    try {
      const res = await fetch("http://localhost:5000/import/products", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setImportFile(null);
        fetchProducts();
      } else {
        console.error(data.error);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(products);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Products");
    const buffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([buffer], { type: "application/octet-stream" });
    saveAs(blob, "products.xlsx");
  };

  // Filter and sort
  const filteredProducts = useMemo(() => {
    let filtered = products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));
    filtered.sort((a, b) => {
      const aLow = a.stock <= a.threshold;
      const bLow = b.stock <= b.threshold;
      if (aLow && !bLow) return -1;
      if (!aLow && bLow) return 1;

      let aVal = a[sortKey];
      let bVal = b[sortKey];

      if (sortKey === "name" || sortKey === "barcode") {
        aVal = String(aVal).toLowerCase();
        bVal = String(bVal).toLowerCase();
      } else {
        aVal = Number(aVal);
        bVal = Number(bVal);
      }

      if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
      if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
    return filtered;
  }, [products, search, sortKey, sortOrder]);

  // Paginated products
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(start, start + itemsPerPage);
  }, [filteredProducts, currentPage]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <ManagerNavbar time={time} />
      <main className="flex-1 p-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Products in Stock House</h2>

        {/* Actions */}
        <div className="mb-3 flex gap-3 flex-wrap">
          <div className="relative w-2/3 mb-6">
            {/* SVG Icon */}
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

            {/* Input */}
            <Input
              placeholder="Search by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 rounded-lg border-gray-300 shadow-sm"
            />
          </div>


          {/* Add Product */}
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-white-600 hover:bg-white-700 text-black rounded-lg shadow-md"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-plus h-4 w-4 mr-2"><path d="M5 12h14"></path><path d="M12 5v14"></path></svg>Add Product</Button>
            </DialogTrigger>
            <DialogContent className="rounded-xl shadow-xl bg-white p-6 w-full max-w-lg">
              <DialogHeader>
                <DialogTitle className="text-lg font-semibold text-gray-800">Add Product</DialogTitle>
              </DialogHeader>
              <div className="flex flex-col gap-4 mt-3">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <Label>Product Name</Label>
                    <Input
                      value={newProduct.name}
                      onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <Label>Barcode</Label>
                    <Input
                      value={newProduct.barcode}
                      onChange={(e) => setNewProduct({ ...newProduct, barcode: e.target.value.toUpperCase() })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="flex flex-col gap-1">
                    <Label>Price</Label>
                    <Input type="number" value={newProduct.price} onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })} />
                  </div>
                  <div className="flex flex-col gap-1">
                    <Label>Stock</Label>
                    <Input type="number" value={newProduct.stock} onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })} />
                  </div>
                  <div className="flex flex-col gap-1">
                    <Label>Threshold</Label>
                    <Input type="number" value={newProduct.threshold} onChange={(e) => setNewProduct({ ...newProduct, threshold: e.target.value })} />
                  </div>
                </div>
              </div>
              <DialogFooter className="mt-4">
                <Button onClick={handleAddProduct} className="w-full bg-green-600 hover:bg-green-700 text-white">Save</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Import Product */}
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-white-600 hover:bg-white-700 text-black border rounded-lg shadow-md"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-download-icon lucide-download"><path d="M12 15V3" /><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><path d="m7 10 5 5 5-5" /></svg>
                Import Excel</Button>
            </DialogTrigger>
            <DialogContent className="rounded-xl w-full max-w-md">
              <DialogHeader>
                <DialogTitle className="text-lg font-semibold"> Import Excel</DialogTitle>
              </DialogHeader>
              <Input type="file" accept=".xlsx,.xls" onChange={(e) => setImportFile(e.target.files[0])} />
              <DialogFooter>
                <Button onClick={handleImportExcel} className="w-full bg-purple-600 hover:bg-purple-700 text-white">Upload</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Export Product */}
          <Button onClick={exportToExcel} className="bg-white-600 hover:bg-white-700 border text-black rounded-lg shadow-md"><svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-upload h-4 w-4 mr-2"
          >
            <g transform="scale(-1,1) translate(-24,0)">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="17 8 12 3 7 8"></polyline>
              <line x1="12" x2="12" y1="3" y2="15"></line>
            </g>
          </svg>
            Export Excel</Button>
        </div>

        <SalesReportCard />

        <hr />

        {/* Products Cards */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {paginatedProducts.length > 0 ? (
            paginatedProducts.map((p) => (
              <div key={p.id} className="border rounded-lg p-4 shadow hover:shadow-lg transition">
                <h3 className="flex justify-between items-center font-semibold text-lg mb-2">
                  <span className="truncate">{p.name ? p.name.charAt(0).toUpperCase() + p.name.slice(1) : " "}</span>
                  <span className="text-green-600 text-sm">₹{p.price}</span>
                </h3>
                <p className="flex justify-between items-center text-sm text-gray-500 mb-2">
                  <span className="font-medium truncate">{p.barcode || " "}</span>
                  <span className={`flex justify-center items-center text-xs font-medium 
                    ${p.stock <= p.threshold ? "bg-red-400 text-white" : "border border-gray-200 bg-white text-gray-800"} 
                    w-20 h-6 rounded`}>
                    {p.stock <= p.threshold ? "Low Stock" : "In Stock"}
                  </span>
                </p>
                <div className="flex justify-between text-sm text-gray-600">
                  <span className={`font-medium ${p.stock <= p.threshold ? "text-red-600" : ""}`}>
                    Stock: {p.stock}
                  </span>
                  <span className={`font-medium ${p.stock <= p.threshold ? "text-red-600" : ""}`}>
                    Threshold: {p.threshold}
                  </span>
                </div>

                {/* Edit / Delete Buttons */}
                <div className="flex gap-2 mt-2">
                  {/* Update Dialog */}
                  <Dialog open={editingProduct?.id === p.id} onOpenChange={(open) => !open && setEditingProduct(null)}>
                    <DialogTrigger asChild>
                      <Button onClick={() => setEditingProduct(p)} className="bg-white-500 hover:bg-yellow-600 text-black rounded-md flex-1"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-square-pen h-4 w-4"><path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z"></path></svg>Update</Button>
                    </DialogTrigger>
                    <DialogContent className="rounded-xl w-full max-w-lg">
                      <DialogHeader>
                        <DialogTitle>Update Product</DialogTitle>
                      </DialogHeader>
                      {editingProduct && (
                        <div className="flex flex-col gap-4 mt-2">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1">
                              <Label>Product Name</Label>
                              <Input value={editingProduct.name} onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })} />
                            </div>
                            <div className="flex flex-col gap-1">
                              <Label>Barcode</Label>
                              <Input value={editingProduct.barcode} onChange={(e) => setEditingProduct({ ...editingProduct, barcode: e.target.value.toUpperCase() })} />
                            </div>
                          </div>
                          <div className="grid grid-cols-3 gap-4">
                            <div className="flex flex-col gap-1">
                              <Label>Price</Label>
                              <Input type="number" value={editingProduct.price} onChange={(e) => setEditingProduct({ ...editingProduct, price: e.target.value })} />
                            </div>
                            <div className="flex flex-col gap-1">
                              <Label>Stock</Label>
                              <Input type="number" value={editingProduct.stock} onChange={(e) => setEditingProduct({ ...editingProduct, stock: e.target.value })} />
                            </div>
                            <div className="flex flex-col gap-1">
                              <Label>Threshold</Label>
                              <Input type="number" value={editingProduct.threshold} onChange={(e) => setEditingProduct({ ...editingProduct, threshold: e.target.value })} />
                            </div>
                          </div>
                        </div>
                      )}
                      <DialogFooter>
                        <Button onClick={() => handleUpdateProduct(editingProduct.id)} className="w-full bg-yellow-500 hover:bg-yellow-600 text-white">Update</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  {/* Delete Dialog */}
                  <AlertDialog open={deleteTarget?.id === p.id} onOpenChange={(open) => !open && setDeleteTarget(null)}>
                    <AlertDialogTrigger asChild>
                      <Button onClick={() => setDeleteTarget(p)} className="bg-black hover:bg-red-800 text-white rounded-md flex-1"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trash2 h-4 w-4"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path><line x1="10" x2="10" y1="11" y2="17"></line><line x1="14" x2="14" y1="11" y2="17"></line></svg>Delete</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="rounded-xl shadow-lg">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-lg font-semibold text-red-600">Confirm Deletion</AlertDialogTitle>
                        <AlertDialogDescription className="text-gray-600">
                          Are you sure you want to delete <span className="font-bold">{deleteTarget?.name}</span>? This cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="rounded-md border-gray-300 hover:bg-gray-100">Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDeleteProduct(deleteTarget.id)} className="bg-red-600 hover:bg-red-700 text-white rounded-md">Yes, Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))
          ) : (
            <p className="col-span-5 text-center text-gray-500">No products found</p>
          )}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-6">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious href="#" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} />
                </PaginationItem>

                {Array.from({ length: totalPages }, (_, i) => (
                  <PaginationItem key={i}>
                    <PaginationLink
                      href="#"
                      isActive={currentPage === i + 1}
                      onClick={() => setCurrentPage(i + 1)}
                    >
                      {i + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}

                <PaginationItem>
                  <PaginationNext href="#" onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} />
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

export default Products;

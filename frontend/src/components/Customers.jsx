import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion } from 'framer-motion'
// Skeleton loading card
const CardSkeleton = () => {
  const shimmerVariants = {
    animate: {
      backgroundPosition: ["-200% 0%", "200% 0%"],
      transition: {
        repeat: Infinity,
        repeatType: "loop",
        duration: 1.5,
        ease: "linear",
      },
    },
  };

  return (
    <motion.div
      className="rounded-xl shadow-md p-6 h-[60px] w-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%]"
      variants={shimmerVariants}
      animate="animate"
    />
  );
};

const PAGE_SIZE = 10;

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Fallback mock data
  const fallbackCustomers = [
    {
      _id: "1",
      name: "Alice",
      email: "alice@example.com",
      phone: "123-456-7890",
      joinedAt: "2023-01-01",
      totalSpend: 100,
      visitCount: 5,
      lastActive: "2023-05-01",
    },
    {
      _id: "2",
      name: "Bob",
      email: "bob@example.com",
      phone: "234-567-8901",
      joinedAt: "2023-02-15",
      totalSpend: 250,
      visitCount: 8,
      lastActive: "2023-05-02",
    },
  ];

  const fallbackOrders = [
    { customerId: "1" },
    { customerId: "1" },
    { customerId: "2" },
  ];

  const isInitialFetch = useRef(true);

  // Fetch customers and orders
  const fetchData = async () => {
    try {
      if (isInitialFetch.current) setLoading(true);
      const [customerRes, orderRes] = await Promise.all([
        fetch(`${import.meta.env.VITE_BACKEND_URL}/api/customers/fetch`),
        fetch(`${import.meta.env.VITE_BACKEND_URL}/api/orders/fetch`),
      ]);

      const customerData = customerRes.ok ? await customerRes.json() : { customers: fallbackCustomers };
      const orderData = orderRes.ok ? await orderRes.json() : { orders: fallbackOrders };

      setCustomers(customerData?.customers || fallbackCustomers);
      setOrders(orderData?.orders || fallbackOrders);
    } catch (error) {
      console.error("Fetch error:", error);
      setCustomers(fallbackCustomers);
      setOrders(fallbackOrders);
    } finally {
      if (isInitialFetch.current) {
        setLoading(false);
        isInitialFetch.current = false;
      }
    }
  };

  useEffect(() => {
    fetchData();
    const intervalId = setInterval(fetchData, 10000); // refetch every 10s
    return () => clearInterval(intervalId); // cleanup interval
  }, []);

  // Memoized orders count per customer
  const customersWithOrders = useMemo(() => {
    const orderCountMap = orders.reduce((acc, order) => {
      const id = order.customerId;
      acc[id] = (acc[id] || 0) + 1;
      return acc;
    }, {});
    return customers.map((cust) => ({
      ...cust,
      totalOrders: orderCountMap[cust._id] || 0,
    }));
  }, [customers, orders]);

  const filteredCustomers = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return customersWithOrders.filter(
      (c) =>
        c.name.toLowerCase().includes(term) ||
        c.email.toLowerCase().includes(term)
    );
  }, [searchTerm, customersWithOrders]);

  const paginatedCustomers = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredCustomers.slice(start, start + PAGE_SIZE);
  }, [currentPage, filteredCustomers]);

  const totalPages = Math.ceil(filteredCustomers.length / PAGE_SIZE);

  const handlePrev = () => setCurrentPage((p) => Math.max(p - 1, 1));
  const handleNext = () => setCurrentPage((p) => Math.min(p + 1, totalPages));
  const handlePageClick = (page) => setCurrentPage(page);

  const getPageNumbers = (totalPages, currentPage) => {
    const delta = 1;
    const range = [];
    const rangeWithDots = [];

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push("...");
    }

    rangeWithDots.unshift(1);
    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push("...");
    }

    if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  return (
    <div className="px-6 py-8 min-h-screen">
      <h1 className="text-3xl font-extrabold mb-6 text-gray-900">Customers</h1>

      {/* Search */}
      <input
        type="text"
        placeholder="Search by name or email..."
        className="mb-4 w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3795BD]"
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          setCurrentPage(1);
        }}
      />

      {/* Table or Skeleton */}
      {loading ? (
        [...Array(PAGE_SIZE)].map((_, i) => <CardSkeleton key={i} />)
      ) : filteredCustomers.length === 0 ? (
        <p className="text-gray-500">No customers found.</p>
      ) : (
        <div className="overflow-x-auto bg-white rounded-xl shadow-sm">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-[#3795BD] text-[#FFFFFF] font-semibold">
              <tr>
                {[
                  "Name",
                  "Email",
                  "Phone",
                  "Joined At",
                  "Total Spend",
                  "Visit Count",
                  "Last Active",
                  "Total Orders",
                ].map((head) => (
                  <th
                    key={head}
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                  >
                    {head}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedCustomers.map((cust) => (
                <tr key={cust._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{cust.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{cust.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{cust.phone || "-"}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {cust.joinedAt ? new Date(cust.joinedAt).toLocaleString() : "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${cust.totalSpend?.toFixed(2) || "0.00"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{cust.visitCount ?? "-"}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {cust.lastActive ? new Date(cust.lastActive).toLocaleString() : "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{cust.totalOrders}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {!loading && filteredCustomers.length > 0 && (
        <div className="flex justify-center items-center gap-3 mt-6">
          <button
            onClick={handlePrev}
            disabled={currentPage === 1}
            className={`px-3 py-1 rounded-md ${currentPage === 1
              ? "bg-gray-300 cursor-not-allowed"
              : "bg-[#3795BD] text-white hover:bg-[#2b7ca3]"
              }`}
          >
            Prev
          </button>
          {[...getPageNumbers(totalPages, currentPage)].map((page, idx) => (
            <button
              key={idx}
              onClick={() => typeof page === "number" && handlePageClick(page)}
              disabled={page === "..."}
              className={`px-3 py-1 rounded-md ${page === currentPage
                ? "bg-[#10375C] text-white"
                : page === "..."
                  ? "cursor-default"
                  : "bg-gray-200 hover:bg-gray-300"
                }`}
            >
              {page}
            </button>
          ))}

          <button
            onClick={handleNext}
            disabled={currentPage === totalPages}
            className={`px-3 py-1 rounded-md ${currentPage === totalPages
              ? "bg-gray-300 cursor-not-allowed"
              : "bg-[#3795BD] text-white hover:bg-[#2b7ca3]"
              }`}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default Customers;

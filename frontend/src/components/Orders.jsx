import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion } from "framer-motion";

// Skeleton loading card (same as your Customers skeleton)
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

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);

    // Fallback mock data
    const fallbackCustomers = [
        { _id: "1", name: "Alice" },
        { _id: "2", name: "Bob" },
    ];

    const fallbackOrders = [
        {
            _id: "o1",
            orderId: "ORD-1001",
            customerId: "1",
            amount: 150,
            items: ["item1", "item2"],
            createdAt: "2023-05-01T10:00:00Z",
        },
        {
            _id: "o2",
            orderId: "ORD-1002",
            customerId: "1",
            amount: 80,
            items: ["item3"],
            createdAt: "2023-05-02T11:00:00Z",
        },
        {
            _id: "o3",
            orderId: "ORD-1003",
            customerId: "2",
            amount: 120,
            items: ["item4", "item5"],
            createdAt: "2023-05-03T12:00:00Z",
        },
    ];

    const isInitialFetch = useRef(true);

    // Fetch orders and customers
    const fetchData = async () => {
        try {
            if (isInitialFetch.current) setLoading(true);
            const [ordersRes, customersRes] = await Promise.all([
                fetch(`${import.meta.env.VITE_BACKEND_URL}/api/orders/fetch`),
                fetch(`${import.meta.env.VITE_BACKEND_URL}/api/customers/fetch`), // Assuming this endpoint exists
            ]);

            const ordersData = ordersRes.ok ? await ordersRes.json() : { orders: fallbackOrders };
            const customersData = customersRes.ok ? await customersRes.json() : { customers: fallbackCustomers };

            setOrders(ordersData?.orders || fallbackOrders);
            setCustomers(customersData?.customers || fallbackCustomers);
        } catch (error) {
            console.error("Fetch error:", error);
            setOrders(fallbackOrders);
            setCustomers(fallbackCustomers);
        } finally {
            if (isInitialFetch.current) {
                setLoading(false);
                isInitialFetch.current = false;
            }
        }
    };

    useEffect(() => {
        fetchData();
        const intervalId = setInterval(fetchData, 10000); // refetch every 10 seconds
        return () => clearInterval(intervalId);
    }, []);

    // Create a map of customerId -> customer object for fast lookup
    const customerMap = useMemo(() => {
        const map = {};
        for (const c of customers) {
            map[c._id] = c;
        }
        return map;
    }, [customers]);

    // Filter orders by orderId or customer name
    const filteredOrders = useMemo(() => {
        const term = searchTerm.toLowerCase();
        return orders.filter((order) => {
            const orderIdMatch = order.orderId?.toLowerCase().includes(term);
            const customerName = customerMap[order.customerId]?.name || "";
            const customerNameMatch = customerName.toLowerCase().includes(term);
            return orderIdMatch || customerNameMatch;
        });
    }, [searchTerm, orders, customerMap]);

    // Pagination slice
    const paginatedOrders = useMemo(() => {
        const start = (currentPage - 1) * PAGE_SIZE;
        return filteredOrders.slice(start, start + PAGE_SIZE);
    }, [filteredOrders, currentPage]);

    const totalPages = Math.max(1, Math.ceil(filteredOrders.length / PAGE_SIZE));

    const handlePrev = () => setCurrentPage((p) => Math.max(p - 1, 1));
    const handleNext = () => setCurrentPage((p) => Math.min(p + 1, totalPages));
    const handlePageClick = (page) => setCurrentPage(page);

    // Pagination UI helper
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
            rangeWithDots.push(1);
            rangeWithDots.push("...");
        } else {
            for (let i = 1; i < Math.max(2, currentPage - delta); i++) {
                rangeWithDots.push(i);
            }
        }

        rangeWithDots.push(...range);

        if (currentPage + delta < totalPages - 1) {
            rangeWithDots.push("...");
            rangeWithDots.push(totalPages);
        } else {
            for (let i = Math.min(totalPages - 1, currentPage + delta + 1); i <= totalPages; i++) {
                rangeWithDots.push(i);
            }
        }

        // If only one page, just return [1]
        if (totalPages === 1) return [1];

        return rangeWithDots;
    };

    return (
        <div className="px-6 py-8 min-h-screen">
            <h1 className="text-3xl font-extrabold mb-6 text-gray-900">Orders</h1>

            {/* Search */}
            <input
                type="text"
                placeholder="Search by Order ID or Customer name..."
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
            ) : filteredOrders.length === 0 ? (
                <p className="text-gray-500">No orders found.</p>
            ) : (
                <div className="overflow-x-auto bg-white rounded-xl shadow-sm">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-[#3795BD] text-[#FFFFFF] font-semibold">
                            <tr>
                                {["Order ID", "Customer", "Amount", "Items", "Created At"].map((head) => (
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
                            {paginatedOrders.map((order) => (
                                <tr key={order._id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {order.orderId || "-"}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {order.customerId?.name || "-"}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        &#8377;{order.amount?.toFixed(2) || "0.00"}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {order.items && order.items.length > 0 ? order.items.join(", ") : "-"}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {order.createdAt ? new Date(order.createdAt).toLocaleString() : "-"}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Pagination */}
            {!loading && filteredOrders.length > 0 && (
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

export default Orders;

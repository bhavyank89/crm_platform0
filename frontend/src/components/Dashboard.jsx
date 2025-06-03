import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

// Skeleton animation variants
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

const CardSkeleton = () => (
    <motion.div
        className="rounded-xl shadow-md p-6 h-[240px] bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%]"
        variants={shimmerVariants}
        animate="animate"
    />
);

const StatsCard = ({ title, value, change, positive }) => (
    <motion.div className="bg-white rounded-xl shadow-sm p-6 flex flex-col justify-center transition-all duration-200 h-32">
        <div className="text-sm text-gray-500 font-medium uppercase mb-2">{title}</div>
        <div className="text-3xl font-extrabold text-gray-900 mb-2">{value ?? "-"}</div>
        {change !== undefined && change !== null && (
            <div className={`text-sm font-semibold ${positive ? "text-green-600" : "text-red-600"}`}>
                {change > 0 ? `+${change}%` : `${change}%`} this month
            </div>
        )}
    </motion.div>
);

const AvatarWithFallback = ({ name }) => {
    let displayName = typeof name === "string" ? name : "";

    if (typeof name === "object" && name !== null) {
        displayName = name.name || name.fullName || name.username || name.email || JSON.stringify(name);
    }

    const initial = displayName?.charAt(0)?.toUpperCase() || "U";

    return (
        <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#10375C] flex items-center justify-center text-white text-xs font-bold">
                {initial}
            </div>
            <span className="truncate max-w-[150px]">{displayName}</span>
        </div>
    );
};

const ItemRenderer = ({ item, isCustomer }) => {
    if (isCustomer) {
        return <AvatarWithFallback name={item} />;
    }

    if (typeof item === "string") {
        return <span>{item}</span>;
    }

    // Fallback for orders, logs, or segments (if objects)
    return (
        <span className="block truncate text-sm text-gray-800">
            {item?.orderId || item?.segmentName || item?.message || item?.name || JSON.stringify(item)}
        </span>
    );
};

const InfoCard = ({ title, items, isCustomer = false, onViewAll }) => {
    const displayItems = items?.slice(0, 8);

    return (
        <motion.div className="bg-white rounded-xl shadow-sm p-6 flex flex-col transition-all duration-200 h-[300px]">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
                <button
                    onClick={onViewAll}
                    className="ml-4 text-sm px-3 py-2 rounded-lg bg-[#3795BD] text-white font-semibold cursor-pointer transition-all hover:bg-[#2b7ca3]"
                >
                    View All
                </button>
            </div>
            <div className="flex-grow overflow-y-auto scrollbar-hide space-y-2 text-gray-700">
                {displayItems?.length > 0 ? (
                    displayItems.map((item, idx) => (
                        <div className="p-3 bg-gray-50 rounded-xl" key={idx}>
                            <ItemRenderer item={item} isCustomer={isCustomer} />
                        </div>
                    ))
                ) : (
                    <p className="text-gray-500">No items found.</p>
                )}
            </div>
        </motion.div>
    );
};

const Dashboard = () => {
    const [loading, setLoading] = useState(true);
    const [customers, setCustomers] = useState([]);
    const [orders, setOrders] = useState([]);
    const [segments, setSegments] = useState([]);
    const [logs, setLogs] = useState([]);
    const [user, setUser] = useState({});

    const mockData = {
        customers: [{ name: "Alice" }, { name: "Bob" }, { name: "Charlie" }],
        orders: [{ orderId: "Order #101" }, { orderId: "Order #102" }],
        segments: [{ segmentName: "VIP" }, { segmentName: "New Users" }],
        logs: [{ message: "Campaign A sent to 300 users" }, { message: "Opened rate 45%" }],
    };

    const navigate = useNavigate();

    const fetchWithFallback = async (url, fallback) => {
        try {
            const res = await fetch(url);
            const data = await res.json();

            if (Array.isArray(data)) return data;
            if (data?.customers) return data.customers;
            if (data?.orders) return data.orders;
            if (data?.segments) return data.segments;
            if (data?.logs) return data.logs;

            return fallback;
        } catch {
            return fallback;
        }
    };

    const fetchData = async () => {
        try {
            const [fetchedCustomers, fetchedOrders, fetchedSegments, fetchedLogs] = await Promise.all([
                fetchWithFallback("http://localhost:5000/api/customers/fetch", mockData.customers),
                fetchWithFallback("http://localhost:5000/api/orders/fetch", mockData.orders),
                fetchWithFallback("http://localhost:5000/api/segments/fetch", mockData.segments),
                fetchWithFallback("http://localhost:5000/api/communicationLog/fetch", mockData.logs),
            ]);

            setCustomers(fetchedCustomers);
            setOrders(fetchedOrders);
            setSegments(fetchedSegments);
            setLogs(fetchedLogs);
        } catch (error) {
            setCustomers(mockData.customers);
            setOrders(mockData.orders);
            setSegments(mockData.segments);
            setLogs(mockData.logs);
            console.log("error fetching data", error);
        } finally {
            setTimeout(() => setLoading(false), 1000);
        }
    };

    useEffect(() => {
        fetchData();
    });

    useEffect(() => {
        const fetchUser = async () => {
            const token = localStorage.getItem("token");
            if (!token) return;

            try {
                const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/user/fetch`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ token }),
                });

                const result = await res.json();
                if (res.ok && result.user) setUser(result.user);
            } catch (error) {
                console.error("Error fetching user:", error);
            }
        };

        fetchUser();
    }, []);

    const handleViewAll = (section) => {
        if (section === "All Customers") navigate('/customers');
        if (section === "All Orders") navigate('/orders');
        if (section === "All Segments") navigate('/segments');
        if (section === "Communication Log") navigate('/communicationLogs');
    };

    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: (i = 1) => ({
            opacity: 1,
            y: 0,
            transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" },
        }),
    };

    return (
        <div className="px-6 py-8 min-h-screen w-full">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-5">
                <h1 className="text-3xl font-extrabold text-gray-900">
                    Welcome {user?.name ? user.name.charAt(0).toUpperCase() + user.name.slice(1) : "User"} 👋
                </h1>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                {loading ? (
                    <>
                        <CardSkeleton />
                        <CardSkeleton />
                        <CardSkeleton />
                    </>
                ) : (
                    [
                        { title: "Customers", value: customers.length },
                        { title: "Orders", value: orders.length },
                        { title: "Segments", value: segments.length },
                    ].map(({ title, value }, i) => (
                        <motion.div key={title} custom={i} initial="hidden" animate="visible" variants={containerVariants}>
                            <StatsCard title={title} value={value} />
                        </motion.div>
                    ))
                )}
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {loading ? (
                    <>
                        <CardSkeleton />
                        <CardSkeleton />
                        <CardSkeleton />
                        <CardSkeleton />
                    </>
                ) : (
                    [
                        { title: "All Customers", items: customers, isCustomer: true },
                        { title: "All Orders", items: orders },
                        { title: "All Segments", items: segments },
                        { title: "Communication Log", items: logs },
                    ].map(({ title, items, isCustomer }, i) => (
                        <motion.div key={title} custom={i} initial="hidden" animate="visible" variants={containerVariants}>
                            <InfoCard title={title} items={items} isCustomer={isCustomer} onViewAll={() => handleViewAll(title)} />
                        </motion.div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Dashboard;

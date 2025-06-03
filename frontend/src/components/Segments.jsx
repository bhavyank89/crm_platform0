import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import { Toaster } from "react-hot-toast";
import SegmentModal from "./SegmentModal";

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

const Segments = () => {
    const [segments, setSegments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [showModal, setShowModal] = useState(false);

    const fallbackSegments = [
        {
            _id: "s1",
            name: "Segment Alpha",
            rules: [{}, {}],
            createdAt: "2023-01-01T10:00:00Z",
            customerIds: ["c1", "c2", "c3"],
        },
        {
            _id: "s2",
            name: "Segment Beta",
            rules: [{}],
            createdAt: "2023-02-15T11:30:00Z",
            customerIds: ["c4"],
        },
    ];

    const isInitialFetch = useRef(true);

    const fetchData = async () => {
        try {
            if (isInitialFetch.current) setLoading(true);
            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/segments/fetch`);
            if (res.ok) {
                const data = await res.json();
                setSegments(data || fallbackSegments);
            } else {
                setSegments(fallbackSegments);
            }
        } catch (error) {
            console.error("Fetch error:", error);
            setSegments(fallbackSegments);
        } finally {
            if (isInitialFetch.current) {
                setLoading(false);
                isInitialFetch.current = false;
            }
        }
    };

    useEffect(() => {
        fetchData();
        const intervalId = setInterval(fetchData, 10000);
        return () => clearInterval(intervalId);
    });

    const filteredSegments = useMemo(() => {
        const term = searchTerm.toLowerCase();
        return segments.filter((segment) => segment.name.toLowerCase().includes(term));
    }, [searchTerm, segments]);

    const paginatedSegments = useMemo(() => {
        const start = (currentPage - 1) * PAGE_SIZE;
        return filteredSegments.slice(start, start + PAGE_SIZE);
    }, [filteredSegments, currentPage]);

    const totalPages = Math.max(1, Math.ceil(filteredSegments.length / PAGE_SIZE));

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

        if (totalPages === 1) return [1];
        return rangeWithDots;
    };

    return (
        <div className="px-6 py-8 min-h-screen">
            <Toaster position="top-right" />
            <h1 className="text-3xl font-extrabold mb-6 text-gray-900">Segments</h1>

            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
                <input
                    type="text"
                    placeholder="Search by segment name..."
                    className="mb-4 w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3795BD]"
                    value={searchTerm}
                    onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setCurrentPage(1);
                    }}
                />
                <button
                    onClick={() => setShowModal(true)}
                    className="px-4 py-2 mb-4 rounded-lg transition-all duration-300 cursor-pointer bg-[#3795BD] text-[#FFFFFF] font-semibold hover:bg-[#2e7ca0] hover:shadow-lg hover:shadow-[#3795BD]/50"
                >
                    Create New Segment
                </button>
            </div>

            <SegmentModal isOpen={showModal} onClose={() => setShowModal(false)} />

            {loading ? (
                [...Array(PAGE_SIZE)].map((_, i) => <CardSkeleton key={i} />)
            ) : filteredSegments.length === 0 ? (
                <p className="text-gray-500">No segments found.</p>
            ) : (
                <div className="overflow-x-auto bg-white rounded-xl shadow-sm">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-[#3795BD] text-[#FFFFFF] font-semibold">
                            <tr>
                                {["Name", "Rule", "Customers Count", "created By", "Created At"].map((head) => (
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
                            {paginatedSegments.map((segment) => (
                                <tr key={segment._id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {segment.name || "-"}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {segment.rules?.length || 0}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {segment.customerIds?.length || 0}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {segment.createdBy?.name || "-"}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {segment.createdAt ? new Date(segment.createdAt).toLocaleString() : "-"}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {!loading && filteredSegments.length > 0 && (
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
                    {getPageNumbers(totalPages, currentPage).map((page, idx) => (
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

export default Segments;

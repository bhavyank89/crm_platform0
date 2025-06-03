import React, { useEffect, useMemo, useState, useRef } from "react";
import { motion } from "framer-motion";

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

const CommunicationLog = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const fallbackLogs = [
    {
      _id: "1",
      campaignId: { name: "Welcome Campaign" },
      segmentId: { name: "New Users" },
      customerId: { name: "Alice", email: "alice@example.com" },
      message: "Hello Alice!",
      status: "SENT",
      sentAt: "2023-05-01T12:00:00Z",
    },
  ];

  const isInitialFetch = useRef(true);

  const fetchLogs = async () => {
    try {
      if (isInitialFetch.current) setLoading(true);

      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/communicationLog/fetch`);
      const data = res.ok ? await res.json() : { logs: fallbackLogs };
      setLogs(data?.logs || fallbackLogs);
    } catch (err) {
      console.error("Fetch error:", err);
      setLogs(fallbackLogs);
    } finally {
      if (isInitialFetch.current) {
        setLoading(false);
        isInitialFetch.current = false;
      }
    }
  };


  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 10000); // refresh every 10s
    return () => clearInterval(interval);
  }, []);

  const filteredLogs = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return logs.filter((log) => {
      const campaign = log.campaignId?.name?.toLowerCase() || "";
      const segment = log.segmentId?.name?.toLowerCase() || "";
      const customer = log.customerId?.name?.toLowerCase() || "";
      const email = log.customerId?.email?.toLowerCase() || "";
      const msg = log.message?.toLowerCase() || "";
      return (
        campaign.includes(term) ||
        segment.includes(term) ||
        customer.includes(term) ||
        email.includes(term) ||
        msg.includes(term)
      );
    });
  }, [logs, searchTerm]);

  const paginatedLogs = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredLogs.slice(start, start + PAGE_SIZE);
  }, [filteredLogs, currentPage]);

  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / PAGE_SIZE));

  const handlePrev = () => setCurrentPage((p) => Math.max(p - 1, 1));
  const handleNext = () => setCurrentPage((p) => Math.min(p + 1, totalPages));
  const handlePageClick = (page) => setCurrentPage(page);

  const getPageNumbers = (total, current) => {
    const delta = 1;
    const range = [];
    const rangeWithDots = [];

    for (
      let i = Math.max(2, current - delta);
      i <= Math.min(total - 1, current + delta);
      i++
    ) {
      range.push(i);
    }

    if (current - delta > 2) {
      rangeWithDots.push(1, "...");
    } else {
      for (let i = 1; i < Math.max(2, current - delta); i++) rangeWithDots.push(i);
    }

    rangeWithDots.push(...range);

    if (current + delta < total - 1) {
      rangeWithDots.push("...", total);
    } else {
      for (let i = Math.min(total - 1, current + delta + 1); i <= total; i++)
        rangeWithDots.push(i);
    }

    return total === 1 ? [1] : rangeWithDots;
  };

  return (
    <div className="px-6 py-8 min-h-screen">
      <h1 className="text-3xl font-extrabold mb-6 text-gray-900">Communication Logs</h1>

      <input
        type="text"
        placeholder="Search by campaign, segment, customer, or message..."
        className="mb-4 w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3795BD]"
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          setCurrentPage(1);
        }}
      />

      {loading ? (
        [...Array(PAGE_SIZE)].map((_, i) => <CardSkeleton key={i} />)
      ) : filteredLogs.length === 0 ? (
        <p className="text-gray-500">No communication logs found.</p>
      ) : (
        <div className="overflow-x-auto bg-white rounded-xl shadow-sm">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-[#3795BD] text-white">
              <tr>
                {["Campaign", "Segment", "Customer", "Email", "Message", "Status", "Sent At"].map((head) => (
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
              {paginatedLogs.map((log) => (
                <tr key={log._id}>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{log.campaignId?.name || "-"}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{log.segmentId?.name || "-"}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{log.customerId?.name || "-"}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{log.customerId?.email || "-"}</td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate" title={log.message}>
                    {log.message || "-"}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{log.status}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {log.sentAt ? new Date(log.sentAt).toLocaleString() : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && filteredLogs.length > 0 && (
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
          {getPageNumbers(totalPages, currentPage).map((page, i) => (
            <button
              key={i}
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

export default CommunicationLog;

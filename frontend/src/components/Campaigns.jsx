import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import { Toaster } from "react-hot-toast";
import CampaignModal from "./CampaignModal";

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

const Campaigns = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);

  const fallbackCampaigns = [
    {
      _id: "1",
      name: "Welcome Campaign",
      messageTemplate: "Hi {{name}}, welcome aboard!",
      segmentId: { _id: "seg1", name: "New Users" },
      createdBy: { _id: "user1", name: "Admin" },
      createdAt: "2023-06-01T00:00:00.000Z",
    },
    {
      _id: "2",
      name: "Feedback Request",
      messageTemplate: "Hi {{name}}, we’d love your feedback.",
      segmentId: { _id: "seg2", name: "Active Users" },
      createdBy: { _id: "user2", name: "Manager" },
      createdAt: "2023-06-15T00:00:00.000Z",
    },
  ];

  const isInitialFetch = useRef(true);

  const fetchData = async () => {
    try {
      if (isInitialFetch.current) setLoading(true);
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/campaign/history`);
      const data = res.ok ? await res.json() : { campaigns: fallbackCampaigns };
      setCampaigns(data || fallbackCampaigns);
    } catch (error) {
      console.error("Fetch error:", error);
      setCampaigns(fallbackCampaigns);
    } finally {
      if (isInitialFetch.current) {
        setLoading(false);
        isInitialFetch.current = false;
      }
    }
  };

  useEffect(() => {
    fetchData();
    const intervalId = setInterval(fetchData, 10000); // Refresh every 10s
    return () => clearInterval(intervalId);
  });

  const filteredCampaigns = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return campaigns.filter((c) => {
      const segmentName = c.segmentId?.name?.toLowerCase() || "";
      const createdBy = c.createdBy?.name?.toLowerCase() || "";
      return (
        c.name.toLowerCase().includes(term) ||
        c.messageTemplate.toLowerCase().includes(term) ||
        segmentName.includes(term) ||
        createdBy.includes(term)
      );
    });
  }, [searchTerm, campaigns]);

  const paginatedCampaigns = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredCampaigns.slice(start, start + PAGE_SIZE);
  }, [currentPage, filteredCampaigns]);

  const totalPages = Math.ceil(filteredCampaigns.length / PAGE_SIZE);
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
      <Toaster position="top-right" />
      <h1 className="text-3xl font-extrabold mb-6 text-gray-900">Campaigns</h1>

      {/* Search + Button */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <input
          type="text"
          placeholder="Search by name, segment, or creator..."
          className="mb-4 w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3795BD]"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
        />
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 mb-4 rounded-lg transition-all duration-300 cursor-pointer bg-[#3795BD] text-[#FFFFFF] font-semibold
               hover:bg-[#2e7ca0] hover:shadow-lg hover:shadow-[#3795BD]/50"
        >
          Create New Campaign
        </button>
      </div>

      <CampaignModal isOpen={showModal} onClose={() => setShowModal(false)} />

      {/* Table or Skeleton */}
      {loading ? (
        [...Array(PAGE_SIZE)].map((_, i) => <CardSkeleton key={i} />)
      ) : filteredCampaigns.length === 0 ? (
        <p className="text-gray-500">No campaigns found.</p>
      ) : (
        <div className="overflow-x-auto bg-white rounded-xl shadow-sm">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-[#3795BD] text-[#FFFFFF] font-semibold">
              <tr>
                {["Campaign Name", "Message Template", "Segment Name", "Created By", "Created At"].map((head) => (
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
              {paginatedCampaigns.map((c) => (
                <tr key={c._id}>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{c.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-500 relative group max-w-xs truncate" title={c.messageTemplete}>
                    <span className="truncate">{c.messageTemplate}</span>

                    {/* Tooltip */}
                    <div className="absolute z-10 hidden group-hover:block w-64 bg-black text-white text-xs rounded-md px-3 py-2 bottom-full left-1/2 -translate-x-1/2 mb-2 shadow-lg">
                      {c.messageTemplate}
                    </div>
                  </td>

                  <td className="px-6 py-4 text-sm text-gray-500">{c.segmentName
                    || "-"}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{c.createdBy?.name || "-"}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(c.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {!loading && filteredCampaigns.length > 0 && (
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

export default Campaigns;

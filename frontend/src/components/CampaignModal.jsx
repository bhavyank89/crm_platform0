import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

const CampaignModal = ({ isOpen, onClose }) => {
    const [name, setName] = useState("");
    const [messageTemplate, setMessageTemplate] = useState("");
    const [segmentId, setSegmentId] = useState("");
    const [segmentName, setSegmentName] = useState("");
    const [segments, setSegments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [fetchingSegments, setFetchingSegments] = useState(true);
    const [generating, setGenerating] = useState(false);

    useEffect(() => {
        const fetchSegments = async () => {
            try {
                setFetchingSegments(true);
                const res = await fetch("http://localhost:5000/api/segments/fetch");
                const data = await res.json();
                setSegments(data || []);
            } catch (err) {
                toast.error("Failed to load segments");
                console.error("Segment fetch error:", err.message);
            } finally {
                setFetchingSegments(false);
            }
        };

        if (isOpen) fetchSegments();
    }, [isOpen]);

    const [user, setUser] = useState(null);

    useEffect(() => {
        const fetchUser = async () => {
            const token = localStorage.getItem("token");

            if (!token) {
                console.error("No token found in localStorage");
                return;
            }

            try {
                const userData = await fetch("http://localhost:5000/api/user/fetch", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ token }),
                });

                const response = await userData.json();

                if (userData.ok && response.user) {
                    setUser(response.user);
                } else {
                    console.error("Failed to fetch user:", response.error || "Unknown error");
                }
            } catch (error) {
                console.error("Error fetching user:", error);
            }
        };

        fetchUser();
    }, []);

    const handleCreate = async () => {
        if (!name || !messageTemplate || !segmentId) {
            toast.error("All fields are required.");
            return;
        }

        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            const createdBy = user._id;

            const res = await fetch("http://localhost:5000/api/campaign/create", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    name,
                    messageTemplate,
                    segmentId,
                    createdBy,
                }),
            });

            if (!res.ok) throw new Error("Failed to create campaign");

            toast.success("Campaign created successfully!");
            closeModal();
        } catch (err) {
            toast.error("Failed to create campaign.");
            console.error("Campaign creation error:", err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateAI = async () => {
        if (!name || !segmentName) {
            toast.error("Campaign name and segment are required to generate a message.");
            return;
        }

        try {
            setGenerating(true);
            const res = await fetch("http://localhost:5000/api/campaign/messageTemplete", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    title: name,
                    segment: segmentName,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed to generate message.");
            }

            setMessageTemplate(data.messageTemplate);
            toast.success("Generated message from AI.");
        } catch (err) {
            console.error("AI generation error:", err);
            toast.error("Could not generate message from AI.");
        } finally {
            setGenerating(false);
        }
    };

    const closeModal = () => {
        setName("");
        setMessageTemplate("");
        setSegmentId("");
        setSegmentName("");
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="fixed inset-0 z-50 bg-black/10 backdrop-blur-md flex items-center justify-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        className="w-full max-w-lg rounded-2xl bg-white/80 backdrop-blur-xl shadow-2xl p-6 border border-white/40 relative"
                    >
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">
                            Create New Campaign
                        </h2>

                        <input
                            type="text"
                            placeholder="Campaign name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full mb-4 px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#3795BD]"
                        />

                        <select
                            value={segmentName}
                            onChange={(e) => {
                                const selected = segments.find(s => s.name === e.target.value);
                                setSegmentName(selected?.name || "");
                                setSegmentId(selected?._id || "");
                            }}
                            className="w-full mb-4 px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#3795BD]"
                        >
                            <option value="">Select Segment</option>
                            {fetchingSegments ? (
                                <option disabled>Loading...</option>
                            ) : (
                                segments.map((segment) => (
                                    <option key={segment._id} value={segment.name}>
                                        {segment.name}
                                    </option>
                                ))
                            )}
                        </select>


                        <div className="flex items-center justify-between mb-3">
                            <button
                                onClick={handleGenerateAI}
                                disabled={generating}
                                className="text-sm text-[#3795BD] hover:underline disabled:opacity-50"
                            >
                                {generating ? "Generating..." : "Generate from AI"}
                            </button>

                            {messageTemplate && (
                                <button
                                    onClick={() => toast.success("You're using the AI message.")}
                                    className="text-xs px-3 py-1 rounded-full bg-gradient-to-r from-blue-400 via-cyan-500 to-emerald-400 text-white font-semibold shadow hover:opacity-90 transition"
                                >
                                    Continue with AI Message
                                </button>
                            )}
                        </div>

                        <textarea
                            rows={4}
                            placeholder="Message Template"
                            value={messageTemplate}
                            onChange={(e) => setMessageTemplate(e.target.value)}
                            className="w-full mb-4 px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#3795BD]"
                        />

                        <div className="flex justify-end gap-3 mt-2">
                            <button
                                onClick={handleCreate}
                                disabled={loading}
                                className="bg-[#3795BD] hover:bg-[#2e7ca0] text-white px-4 py-2 rounded-lg font-semibold shadow transition duration-200 flex items-center gap-2 disabled:opacity-70"
                            >
                                {loading && (
                                    <svg
                                        className="animate-spin h-4 w-4 text-white"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        />
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8v8z"
                                        />
                                    </svg>
                                )}
                                Create
                            </button>

                            <button
                                onClick={closeModal}
                                className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg font-semibold transition duration-200"
                            >
                                Cancel
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default CampaignModal;

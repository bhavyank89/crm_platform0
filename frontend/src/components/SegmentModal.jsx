import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

const SegmentModal = ({ isOpen, onClose }) => {
    const [name, setName] = useState("");
    const [rules, setRules] = useState("");
    const [previewResult, setPreviewResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [previewLoading, setPreviewLoading] = useState(false); // New state

    const [user, setUser] = useState(null);

    useEffect(() => {
        const fetchUser = async () => {
            const token = localStorage.getItem("token");

            if (!token) {
                console.error("No token found in localStorage");
                return;
            }

            try {
                const userData = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/user/fetch`, {
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

    const handlePreview = async () => {
        try {
            setPreviewLoading(true);
            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/segments/preview`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ rules: rules }),
            });

            const data = await res.json();
            setPreviewResult(data.matched);
        } catch (error) {
            toast.error("Invalid rules format or server error.");
            console.log("error : ", error.message);
        } finally {
            setPreviewLoading(false);
        }
    };

    const handleCreate = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            const createdBy = user._id;

            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/segments/save`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ name, rules: rules, createdBy }),
            });

            if (!res.ok) throw new Error("Failed to create segment.");

            toast.success("Segment created successfully!");
            setName("");
            setRules("");
            setPreviewResult(null);
            onClose();
        } catch (error) {
            toast.error("Failed to create segment.");
            console.log("error : ", error.message);
        } finally {
            setLoading(false);
        }
    };

    const closeModal = () => {
        setName("");
        setRules("");
        setPreviewResult(null);
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
                            Create New Segment
                        </h2>

                        <input
                            type="text"
                            placeholder="Segment name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full mb-4 px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#3795BD]"
                        />

                        <textarea
                            rows={6}
                            placeholder={`Rules (JSON format)\nEx: [{"field":"age","operator":">","value":30}]`}
                            value={rules}
                            onChange={(e) => setRules(e.target.value)}
                            className="w-full mb-4 px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#3795BD]"
                        />

                        {previewResult && (
                            <div className="mb-4 bg-white/90 p-4 rounded-lg border border-gray-200 shadow-inner text-gray-800 max-h-40 overflow-y-auto">
                                <pre className="text-sm whitespace-pre-wrap break-all">
                                    matched with {previewResult} data...
                                </pre>
                            </div>
                        )}

                        <div className="flex justify-end gap-3 mt-2">
                            <button
                                onClick={handlePreview}
                                disabled={previewLoading}
                                className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg font-semibold shadow transition duration-200 flex items-center gap-2 disabled:opacity-70"
                            >
                                {previewLoading && (
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
                                Preview
                            </button>

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

export default SegmentModal;

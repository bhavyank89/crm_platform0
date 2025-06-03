import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
    Home,
    Users,
    PackageIcon,
    EarthIcon,
    ScrollText,
    TableOfContentsIcon,
    ChevronLeft,
    ChevronRight,
    LogOut
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const navItems = [
    { label: 'Dashboard', icon: <Home size={18} />, to: '/' },
    { label: 'Customers', icon: <Users size={18} />, to: '/customers' },
    { label: 'Campaigns', icon: <EarthIcon size={18} />, to: '/campaigns' },
    { label: 'Orders', icon: <PackageIcon size={18} />, to: '/orders' },
    { label: 'Segments', icon: <ScrollText size={18} />, to: '/segments' },
    { label: 'Communication Logs', icon: <TableOfContentsIcon size={18} />, to: '/communicationLogs' },
];

function Navbar({ collapsed, setCollapsed, user, setUser }) {
    const [userData, setUserData] = useState(null);
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("token");
        setUser(null);
        toast.success("Logged out successfully");
        navigate("/home");
    };

    const getInitials = (name) => {
        if (!name || typeof name !== 'string') return "U";
        return name.split(' ').map(n => n[0].toUpperCase()).join('').slice(0, 2);
    };

    useEffect(() => {
        const fetchUser = async () => {
            const token = localStorage.getItem("token");

            if (!token) {
                console.error("No token found in localStorage");
                return;
            }

            try {
                const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/user/fetch`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ token }),
                });

                const data = await response.json();

                if (response.ok && data.user) {
                    setUserData(data.user);
                } else {
                    console.error("Failed to fetch user:", data.error || "Unknown error");
                    toast.error("Failed to fetch user data");
                }
            } catch (error) {
                console.error("Error fetching user:", error);
                toast.error("Error fetching user data");
            }
        };

        fetchUser();
    }, []); // no dependencies necessary, fetch on mount only

    return (
        <aside
            className={`${collapsed ? 'w-20' : 'w-64'} h-full border-r px-4 py-8 flex flex-col justify-between transition-all duration-300`}
        >
            <div>
                {/* Collapse toggle */}
                <div className="flex justify-between items-center mb-8 px-2">
                    {!collapsed && (
                        <div
                            onClick={() => navigate('/')}
                            role="button"
                            tabIndex={0}
                            onKeyPress={e => (e.key === 'Enter' || e.key === ' ') && navigate('/')}
                            className="text-2xl font-bold flex items-center gap-2 cursor-pointer select-none"
                        >
                            <span className="w-6 h-6">
                                <img src="logo.png" alt="CRM Platform Logo" />
                            </span>
                            <span className="text-sm text-black">CRM_platform</span>
                        </div>
                    )}
                    <button
                        className="cursor-pointer p-1 rounded hover:bg-gray-200 transition-colors"
                        onClick={() => setCollapsed(prev => !prev)}
                        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                    >
                        {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                    </button>
                </div>

                {/* Navigation */}
                <nav className="space-y-2">
                    {navItems.map(({ label, icon, to }) => (
                        <NavLink
                            key={label}
                            to={to}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 cursor-pointer ${isActive
                                    ? 'bg-[#3795BD] text-[#FFFFFF] font-semibold'
                                    : 'text-[#173B45] hover:bg-gray-300'
                                }`
                            }
                        >
                            {icon}
                            {!collapsed && <span className="whitespace-nowrap">{label}</span>}
                        </NavLink>
                    ))}
                </nav>
            </div>

            {/* User Info */}
            <div
                className="flex items-center gap-3 mt-6 mb-2 p-2 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer select-none"
                title={userData?.name || "User"}
            >
                <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-semibold text-lg">
                    {getInitials(userData?.name)}
                </div>
                {!collapsed && (
                    <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm leading-none">{userData?.name || "Unknown User"}</div>
                        <div className="text-xs text-gray-500 truncate">{userData?.email || "No Email"}</div>
                    </div>
                )}
                {!collapsed && (
                    <button
                        onClick={handleLogout}
                        className="text-gray-500 hover:text-red-500 transition-colors"
                        title="Logout"
                        aria-label="Logout"
                    >
                        <LogOut size={18} />
                    </button>
                )}
            </div>
        </aside>
    );
}

export default Navbar;

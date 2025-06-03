import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Menu,
    X,
    Users,
    MessageSquare,
    Settings,
    Bot,
    Filter,
    Zap,
} from "lucide-react";
import { motion } from "framer-motion";

const App = () => {
    const [navOpen, setNavOpen] = useState(false);
    const toggleNav = () => setNavOpen(!navOpen);
    const navigate = useNavigate();

    const features = [
        {
            title: "Customer Segmentation",
            description: "Easily group your customers by behavior, preferences, and more.",
            icon: <Users className="w-6 h-6 text-indigo-600" />,
        },
        {
            title: "Automated Campaigns",
            description: "Send personalized messages automatically based on triggers.",
            icon: <MessageSquare className="w-6 h-6 text-indigo-600" />,
        },
        {
            title: "Integration Ready",
            description: "Connect with your existing tools using our secure REST APIs.",
            icon: <Settings className="w-6 h-6 text-indigo-600" />,
        },
        {
            title: "AI Insights",
            description: "Get performance summaries and messaging suggestions from AI.",
            icon: <Bot className="w-6 h-6 text-indigo-600" />,
        },
        {
            title: "Rule-Based Targeting",
            description: "Use natural language to define custom rules for audience targeting.",
            icon: <Filter className="w-6 h-6 text-indigo-600" />,
        },
        {
            title: "Real-Time Delivery Logs",
            description: "Track every message delivery and response in real-time.",
            icon: <Zap className="w-6 h-6 text-indigo-600" />,
        },
    ];

    return (
        <div className="font-sans mt-0 mr-0 h-screen">
            {/* Header */}
            <motion.header
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.4 }}
                className="bg-white shadow-md sticky top-0 z-50"
            >
                <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
                    <div onClick={() => { navigate('/home') }} className="flex items-center gap-2 cursor-pointer">
                        <img src="logo.png" alt="Xeno CRM logo" className="h-8 w-auto" />
                        <h1 className="text-xl font-bold">CRM_platform</h1>
                    </div>
                    <nav className="hidden md:flex gap-6 text-sm items-center">
                        <div className="ml-4 flex gap-2">
                            <button className="relative inline-flex items-center justify-center px-6 py-2 overflow-hidden text-white font-semibold rounded-full group cursor-pointer">
                                <span className="absolute w-full h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 animate-gradient-x rounded-full blur-sm opacity-70 group-hover:opacity-100 transition duration-300"></span>
                                <a href="https://github.com/bhavyank89/crm_platform"
                                    target="_blank" className="relative z-10">Get Code</a>
                            </button>

                            <button onClick={() => { navigate('/login') }} className="text-indigo-600 border cursor-pointer border-indigo-600 px-4 py-1 rounded hover:bg-indigo-100">
                                Login
                            </button>
                            <button onClick={() => { navigate('/signup') }} className="bg-indigo-600 text-white cursor-pointer px-4 py-1 rounded hover:bg-indigo-700">
                                Sign Up
                            </button>
                        </div>
                    </nav>
                    <button className="md:hidden" onClick={toggleNav}>
                        {navOpen ? <X /> : <Menu />}
                    </button>
                </div>

                {/* Mobile nav */}
                {navOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="md:hidden px-4 pb-4"
                    >
                        <div className="flex flex-col gap-4 text-sm">
                            <div className="flex gap-2 pt-2">
                                <button className="relative inline-flex items-center justify-center px-6 py-2 overflow-hidden text-white font-semibold rounded-full group cursor-pointer">
                                    <span className="absolute w-full h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 animate-gradient-x rounded-full blur-sm opacity-70 group-hover:opacity-100 transition duration-300"></span>
                                    <a href="https://github.com/bhavyank89/crm_platform"
                                        target="_blank" className="relative z-10">Get Code</a>
                                </button>
                                <button onClick={() => { navigate('/login') }} className="text-indigo-600 cursor-pointer border border-indigo-600 px-4 py-1 rounded hover:bg-indigo-100">
                                    Login
                                </button>
                                <button onClick={() => { navigate('/signup') }} className="bg-indigo-600 text-white cursor-pointer px-4 py-1 rounded hover:bg-indigo-700">
                                    Sign Up
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </motion.header>

            {/* Hero Section */}
            <motion.section
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="py-20 bg-gray-50 px-4 text-center"
            >
                <div className="max-w-6xl mx-auto flex flex-col-reverse md:flex-row items-center justify-between gap-10">
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="text-center md:text-left max-w-xl"
                    >
                        <h2 className="text-4xl md:text-5xl font-bold mb-4">Drive Customer Engagement</h2>
                        <p className="text-lg text-gray-600 mb-6">
                            Segment, personalize, and automate messaging with Xeno CRM.
                        </p>
                        <button onClick={() => { navigate('/login') }} className="bg-indigo-600 text-white cursor-pointer px-6 py-2 rounded-xl hover:bg-indigo-700 transition">
                            Kick Start 🎉
                        </button>
                    </motion.div>
                    <motion.img
                        src="dashboard.png"
                        alt="CRM Hero"
                        className="w-full max-w-md mx-auto"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 }}
                    />
                </div>
            </motion.section>

            {/* Features */}
            <motion.section
                id="features"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="py-16 bg-white px-4"
            >
                <div className="max-w-6xl mx-auto text-center">
                    <h3 className="text-3xl font-bold mb-10">Powerful Features</h3>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {features.map((feature, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                viewport={{ once: true }}
                                className="bg-gray-50 p-6 rounded-2xl shadow hover:shadow-md transition"
                            >
                                <div className="mb-4">{feature.icon}</div>
                                <h4 className="font-semibold text-lg mb-2">{feature.title}</h4>
                                <p className="text-gray-600 text-sm">{feature.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </motion.section>

            {/* Footer */}
            <motion.footer
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="bg-gray-100 text-center text-sm text-gray-500 py-6"
            >
                <p className="mb-2">
                    &copy; {new Date().getFullYear()} CRM_platform. All rights reserved.
                </p>
                <div className="flex justify-center gap-4 text-gray-600">
                    <a
                        href="https://github.com/bhavyank89"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-black transition"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path d="M12 .5C5.7.5.5 5.7.5 12c0 5.1 3.3 9.4 7.9 10.9.6.1.8-.3.8-.6v-2.2c-3.2.7-3.9-1.4-3.9-1.4-.5-1.3-1.2-1.6-1.2-1.6-1-.7.1-.7.1-.7 1.1.1 1.6 1.1 1.6 1.1 1 .1 1.6-.7 1.9-1 .1-.7.4-1.1.7-1.3-2.6-.3-5.4-1.3-5.4-5.7 0-1.3.5-2.3 1.2-3.2 0-.3-.5-1.3.1-2.6 0 0 1-.3 3.3 1.2a11.2 11.2 0 0 1 6 0c2.3-1.5 3.3-1.2 3.3-1.2.6 1.3.1 2.3.1 2.6.8.9 1.2 1.9 1.2 3.2 0 4.4-2.8 5.4-5.4 5.7.4.3.8 1 .8 2v3c0 .3.2.7.8.6 4.6-1.5 7.9-5.8 7.9-10.9C23.5 5.7 18.3.5 12 .5z" />
                        </svg>
                    </a>
                    <a
                        href="https://www.instagram.com/bha_v76/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-pink-600 transition"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path d="M7 2C4.2 2 2 4.2 2 7v10c0 2.8 2.2 5 5 5h10c2.8 0 5-2.2 5-5V7c0-2.8-2.2-5-5-5H7zm10 2c1.7 0 3 1.3 3 3v10c0 1.7-1.3 3-3 3H7c-1.7 0-3-1.3-3-3V7c0-1.7 1.3-3 3-3h10zM12 7a5 5 0 1 0 .001 10.001A5 5 0 0 0 12 7zm0 2a3 3 0 1 1-.001 6.001A3 3 0 0 1 12 9zm4.8-2.2a1.2 1.2 0 1 0 0 2.4 1.2 1.2 0 0 0 0-2.4z" />
                        </svg>
                    </a>
                    <a
                        href="https://x.com/bhavyank89"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-blue-500 transition"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path d="M22.162 2H18.52l-4.354 6.073L9.837 2H2l7.604 10.792L2 22h3.641l4.823-6.729L14.163 22H22l-7.856-11.118L22.162 2z" />
                        </svg>
                    </a>
                    <a
                        href="https://www.linkedin.com/in/bhavyank89/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-blue-700 transition"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M19 0h-14C2.2 0 1 1.2 1 2.6v18.8C1 22.8 2.2 24 3.6 24h14.8c1.4 0 2.6-1.2 2.6-2.6V2.6C21.6 1.2 20.4 0 19 0zM7.2 20.2H4.4V9h2.8v11.2zm-1.4-12.7c-.9 0-1.5-.7-1.5-1.5S4.9 4.5 5.8 4.5s1.5.7 1.5 1.5-.6 1.5-1.5 1.5zm14.2 12.7h-2.8v-5.3c0-1.3-.5-2.1-1.5-2.1-.8 0-1.3.6-1.5 1.1-.1.2-.1.5-.1.8v5.5h-2.8V9h2.7v1.5c.4-.7 1.2-1.7 2.9-1.7 2.1 0 3.7 1.4 3.7 4.4v6z" />
                        </svg>
                    </a>
                </div>
            </motion.footer>

        </div>
    );
};

export default App;

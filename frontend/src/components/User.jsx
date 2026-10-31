import { useEffect, useState } from "react";
import axios from 'axios';
import { UserPlus, Trash2, Shield, User as UserIcon } from "lucide-react";
import AdminBackLink from "./AdminBackLink";
import { getAuthHeaders, getAuthToken } from "../lib/auth.js";

const User = () => {
    const [user, setUser] = useState({
        name: "",
        email: "",
        password: "",
        role: "user",
    });
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [feedback, setFeedback] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUser((prevUser) => ({
            ...prevUser,
            [name]: value,
        }));
    };

    const showFeedback = (msg, isError = false) => {
        setFeedback({ msg, isError });
        setTimeout(() => setFeedback(null), 4000);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const { name, email, password, role } = user;

        if (!name || !email || !password || !role) {
            showFeedback("Please fill all required credentials", true);
            return;
        }

        try {
            setLoading(true);
            const token = getAuthToken();
            if (!token) {
                showFeedback("Authentication failed. Please sign in again.", true);
                return;
            }

            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/admin/add-user`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...getAuthHeaders(),
                },
                body: JSON.stringify({ name, email, password, role }),
                credentials: "include"
            });

            const data = await response.json();

            if (response.ok) {
                showFeedback("Client account created successfully!");
                setUsers((prev) => [...prev, data.user]);
                setUser({ name: "", email: "", password: "", role: "user" });
            } else {
                showFeedback(data.message || "Failed to create client account", true);
            }
        } catch (error) {
            console.error("Error adding user:", error);
            showFeedback("Network error creating user", true);
        } finally {
            setLoading(false);
        }
    };

    const fetchUsers = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/user/get-users`, {
                headers: getAuthHeaders(),
                credentials: "include"
            });
            const data = await response.json();
            setUsers(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    };

    const deleteUser = async (userId) => {
        if (!window.confirm("Are you sure you want to delete this client account?")) return;
        try {
            await axios.post(`${import.meta.env.VITE_BACKEND_URL}/admin/delete-user/${userId}`, {}, {
                headers: getAuthHeaders(),
                withCredentials: true
            });
            setUsers((prev) => prev.filter((u) => u._id !== userId));
            showFeedback("Account deleted successfully.");
        } catch (error) {
            showFeedback(error.response?.data?.message || 'Failed to delete user', true);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleRoleChange = async (userId, newRole) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/user/update-role`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    ...getAuthHeaders(),
                },
                credentials: "include",
                body: JSON.stringify({ userId, role: newRole }),
            });

            if (response.ok) {
                setUsers((prevUsers) =>
                    prevUsers.map((u) => (u._id === userId ? { ...u, role: newRole } : u))
                );
                showFeedback(`Account role updated to ${newRole}`);
            } else {
                const data = await response.json();
                showFeedback(data.message || "Failed to update role", true);
            }
        } catch (error) {
            console.error("Error updating role:", error);
            showFeedback("Error updating role", true);
        }
    };

    return (
        <div className="min-h-screen bg-[#FBF9F5] text-stone-900 px-4 sm:px-8 py-8">
            <div className="max-w-6xl mx-auto space-y-6">
                <AdminBackLink />

                {/* Header */}
                <div className="pb-4 border-b border-stone-200">
                    <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#9B5A2B] mb-1">
                        <span>Client Management</span>
                    </div>
                    <h1 className="font-serif text-3xl font-medium tracking-tight text-stone-900">
                        Patron & Admin Accounts
                    </h1>
                    <p className="text-xs text-stone-500 font-light mt-0.5">
                        Manage registered client profiles, atelier permissions, and role delegations.
                    </p>
                </div>

                {feedback && (
                    <div
                        className={`p-4 rounded-2xl text-xs font-medium ${
                            feedback.isError
                                ? "bg-rose-50 text-rose-800 border border-rose-200"
                                : "bg-emerald-50 text-emerald-800 border border-emerald-200"
                        }`}
                    >
                        {feedback.msg}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Add Client Form */}
                    <div className="bg-white rounded-3xl p-6 sm:p-7 border border-stone-200 shadow-sm space-y-5">
                        <div className="flex items-center gap-3 pb-3 border-b border-stone-100">
                            <div className="w-10 h-10 rounded-xl bg-amber-50 text-[#9B5A2B] flex items-center justify-center">
                                <UserPlus className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-serif text-base font-semibold text-stone-900">
                                    Create New Account
                                </h3>
                                <p className="text-xs text-stone-500 font-light">Patron or staff member</p>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                            <div>
                                <label className="font-mono uppercase text-[10px] text-stone-500 block mb-1">
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={user.name}
                                    onChange={handleChange}
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-none focus:border-[#9B5A2B] text-xs"
                                    placeholder="e.g. Eleanor Vance"
                                    required
                                />
                            </div>

                            <div>
                                <label className="font-mono uppercase text-[10px] text-stone-500 block mb-1">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={user.email}
                                    onChange={handleChange}
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-none focus:border-[#9B5A2B] text-xs"
                                    placeholder="client@atelier.com"
                                    required
                                />
                            </div>

                            <div>
                                <label className="font-mono uppercase text-[10px] text-stone-500 block mb-1">
                                    Password
                                </label>
                                <input
                                    type="password"
                                    name="password"
                                    value={user.password}
                                    onChange={handleChange}
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-none focus:border-[#9B5A2B] text-xs"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>

                            <div>
                                <label className="font-mono uppercase text-[10px] text-stone-500 block mb-1">
                                    Access Role
                                </label>
                                <select
                                    name="role"
                                    value={user.role}
                                    onChange={handleChange}
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-none focus:border-[#9B5A2B] text-xs"
                                >
                                    <option value="user">Patron / Client (User)</option>
                                    <option value="admin">Atelier Manager (Admin)</option>
                                </select>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3 bg-[#0D0C0B] text-[#FBF9F5] rounded-xl font-medium tracking-wide hover:bg-stone-800 transition shadow"
                            >
                                {loading ? "Creating Account..." : "Create Account"}
                            </button>
                        </form>
                    </div>

                    {/* Users Directory */}
                    <div className="lg:col-span-2 bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
                        <div className="p-5 sm:p-6 border-b border-stone-100 flex items-center justify-between">
                            <div>
                                <h3 className="font-serif text-lg font-semibold text-stone-900">
                                    Registered Patrons & Staff
                                </h3>
                                <p className="text-xs text-stone-500 font-light">
                                    Total {users.length} accounts in directory
                                </p>
                            </div>
                        </div>

                        <div className="divide-y divide-stone-100 max-h-[600px] overflow-y-auto">
                            {users.map((item) => (
                                <div
                                    key={item._id}
                                    className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-stone-50/60 transition"
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="w-10 h-10 rounded-xl bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-600 flex-shrink-0">
                                            {item.role === 'admin' ? (
                                                <Shield className="w-4 h-4 text-[#9B5A2B]" />
                                            ) : (
                                                <UserIcon className="w-4 h-4" />
                                            )}
                                        </div>
                                        <div className="min-w-0">
                                            <h4 className="font-serif text-sm font-semibold text-stone-900 truncate">
                                                {item.name || "Client"}
                                            </h4>
                                            <p className="text-xs text-stone-500 font-light truncate">
                                                {item.email}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 justify-between sm:justify-end">
                                        <select
                                            value={item.role}
                                            onChange={(e) => handleRoleChange(item._id, e.target.value)}
                                            className="px-2.5 py-1 rounded-lg border border-stone-200 bg-white text-xs font-mono font-medium text-stone-800"
                                        >
                                            <option value="user">USER</option>
                                            <option value="admin">ADMIN</option>
                                        </select>

                                        <button
                                            onClick={() => deleteUser(item._id)}
                                            className="p-1.5 text-stone-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
                                            title="Delete account"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default User;

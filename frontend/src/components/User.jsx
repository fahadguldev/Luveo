
import { useEffect, useState } from "react";
import axios from 'axios';
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

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUser((prevUser) => ({
            ...prevUser,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const { name, email, password, role } = user;

        if (!name || !email || !password || !role) {
            alert("Please fill all the required fields");
            return;
        }

        try {
            const token = getAuthToken();
            if (!token) {
                console.error("🚨 No token found in localStorage!");
                alert("Authentication failed. Please log in again.");
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
                alert("User added successfully!");
                setUsers(prev => [...prev, data.user]);
                setUser({ name: "", email: "", password: "", role: "user" });
            } else {
                alert(data.message || "Failed to add user");
            }
        } catch (error) {
            console.error("Error:", error);
            alert("Error adding user");
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
        if (!window.confirm("Are you sure you want to delete this user?")) return;
        try {
            await axios.post(`${import.meta.env.VITE_BACKEND_URL}/admin/delete-user/${userId}`, {}, {
                headers: getAuthHeaders(),
                withCredentials: true
            });
            setUsers(prev => prev.filter(u => u._id !== userId));
            alert("User deleted successfully!");
        } catch (error) {
            console.error('Delete user error:', error.response?.data || error.message);
            alert(error.response?.data?.message || 'Failed to delete user');
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleRoleChange = async (userId, newRole) => {
        if (!window.confirm("Are you sure you want to update this user's role?")) return;
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
                alert("Role updated successfully!");
            } else {
                const data = await response.json();
                alert(data.message || "Failed to update role");
            }
        } catch (error) {
            console.error("Error updating role:", error);
            alert("Error updating role");
        }
    };

    return (
        <>
            <div className="px-4 pt-6">
                <AdminBackLink />
            </div>
            <div className="max-w-lg mx-auto mt-12 p-8 bg-white rounded-lg shadow-lg">
                <h2 className="text-3xl font-bold text-center mb-6">Add User</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-6">
                        <label className="block text-lg font-medium text-gray-700">Name</label>
                        <input type="text" name="name" value={user.name} onChange={handleChange} className="mt-2 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500" required />
                    </div>
                    <div className="mb-6">
                        <label className="block text-lg font-medium text-gray-700">Email</label>
                        <input type="email" name="email" value={user.email} onChange={handleChange} className="mt-2 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500" required />
                    </div>
                    <div className="mb-6">
                        <label className="block text-lg font-medium text-gray-700">Password</label>
                        <input type="password" name="password" value={user.password} onChange={handleChange} className="mt-2 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500" required />
                    </div>
                    <div className="mb-6">
                        <label className="block text-lg font-medium text-gray-700">Cart</label>
                        <input type="text" name="cart" value={user.cart} onChange={handleChange} className="mt-2 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div className="mb-6">
                        <label className="block text-lg font-medium text-gray-700">Role</label>
                        <select name="role" value={user.role} onChange={handleChange} className="mt-2 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500">
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>
                    <div className="text-center">
                        <button type="submit" className="px-6 py-3 bg-blue-500 text-white rounded-md shadow-md hover:bg-blue-600 transition">
                            Add User
                        </button>
                    </div>
                </form>
            </div>
            <div className="p-4">
                <h2 className="text-2xl font-bold mb-4">User List</h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white shadow-md rounded-lg">
                        <thead>
                            <tr className="bg-blue-500 text-white">
                                <th className="py-2 px-4">Name</th>
                                <th className="py-2 px-4">Email</th>
                                <th className="py-2 px-4">Cart</th>
                                <th className="py-2 px-4">Orders</th>
                                <th className="py-2 px-4">Role</th>
                                <th className="py-2 px-4">btns</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => (
                                <tr key={user._id} className="border-b text-center">
                                    <td className="py-2 px-4">{user.name}</td>
                                    <td className="py-2 px-4">{user.email}</td>
                                    <td className="py-2 px-4 text-black">
                                        {user.cart && user.cart.length > 0
                                            ? user.cart.map((item) => item.name).join(", ")
                                            : "NA"}
                                    </td>
                                    <td className="py-2 px-4 text-black">
                                        {user.orderHistory && user.orderHistory.length > 0
                                            ? user.orderHistory
                                                .flatMap((item) => item.orderedProducts.map((product) => product.productName))
                                                .join(", ")
                                            : "NA"}
                                    </td>

                                    <td className="py-2 px-4 capitalize">
                                        <select
                                            value={user.role}
                                            onChange={(e) => handleRoleChange(user._id, e.target.value)}
                                            className="border border-gray-300 rounded-md p-2 shadow-sm"
                                        >
                                            <option value="user">User</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                    </td>
                                    <td className="flex gap-2 py-2 px-4 capitalize">
                                        <button
                                            className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-1 px-4 rounded shadow-sm transition duration-200"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => deleteUser(user._id)}
                                            className="bg-red-600 hover:bg-red-700 text-white font-semibold py-1 px-4 rounded shadow-sm transition duration-200"
                                        >
                                            Delete
                                        </button>
                                    </td>

                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
};

export default User;

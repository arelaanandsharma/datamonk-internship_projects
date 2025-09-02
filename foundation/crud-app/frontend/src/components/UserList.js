import React, { useEffect, useState } from "react";

const API = "http://localhost:5000/api/users";



function UserList() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ name: "", email: "" });
  const [editId, setEditId] = useState(null);

  // Fetch all users
  const fetchUsers = async () => {
    try {
      const res = await fetch(API);
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error("❌ Error fetching users:", err);
    }
  };

  // Add new user
  const addUser = async () => {
    await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setForm({ name: "", email: "" });
    fetchUsers();
  };

  // Update user
  const updateUser = async (id) => {
    await fetch(`${API}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setForm({ name: "", email: "" });
    setEditId(null);
    fetchUsers();
  };

  // Delete user
  const deleteUser = async (id) => {
    await fetch(`${API}/${id}`, { method: "DELETE" });
    fetchUsers();
  };

  // Load data initially
  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h2>User Management</h2>

      <input
        type="text"
        placeholder="Name"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
      />
      <input
        type="email"
        placeholder="Email"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
      />
      {editId ? (
        <button onClick={() => updateUser(editId)}>Update</button>
      ) : (
        <button onClick={addUser}>Add</button>
      )}

      <ul>
         {Array.isArray(users) && users.length > 0 ? (
    users.map((u) => (
      <li key={u.id}>
        {u.name} ({u.email})
        <button onClick={() => { setForm({ name: u.name, email: u.email }); setEditId(u.id); }}>Edit</button>
        <button onClick={() => deleteUser(u.id)}>Delete</button>
      </li>
    ))
  ) : (
    <p>No users found</p>
  )}
      </ul>
    </div>
  );
}

export default UserList;

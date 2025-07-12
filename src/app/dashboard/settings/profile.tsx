"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";

export default function ProfileSettings() {
    const { data: session } = useSession();
    const [editMode, setEditMode] = useState(false);
    const [name, setName] = useState(session?.user?.name || "");
    const [bio, setBio] = useState("");
    const [email, setEmail] = useState(session?.user?.email || "");
    const [phone, setPhone] = useState(""); // get from backend

    // display role
    const role = session?.user?.roles?.join(", ") || session?.user?.role || "User";


    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-semibold">Profile</h2>
            <div>
                <label className="block text-sm font-medium">Name</label>
                {editMode ? (
                    <input
                        className="mt-1 block w-full border rounded px-3 py-2"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                ) : (
                    <div className="mt-1">{name}</div>
                )}
            </div>
            <div>
                <label className="block text-sm font-medium">Bio</label>
                {editMode ? (
                    <textarea
                        className="mt-1 block w-full border rounded px-3 py-2"
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                    />
                ) : (
                    <div className="mt-1">{bio || <span className="text-gray-400">No bio</span>}</div>
                )}
            </div>
            <div>
                <label className="block text-sm font-medium">Role</label>
                <div className="mt-1">{role}</div>
            </div>
            <div>
                <label className="block text-sm font-medium">Email</label>
                {editMode ? (
                    <input
                        className="mt-1 block w-full border rounded px-3 py-2"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        type="email"
                    />
                ) : (
                    <div className="mt-1">{email}</div>
                )}
            </div>
            <div>
                <label className="block text-sm font-medium">Phone</label>
                {editMode ? (
                    <input
                        className="mt-1 block w-full border rounded px-3 py-2"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        type="tel"
                    />
                ) : (
                    <div className="mt-1">{phone || <span className="text-gray-400">No phone</span>}</div>
                )}
            </div>
            <div>
                {editMode ? (
                    <>
                        <button className="inline-block rounded-lg bg-indigo-600 px-4 py-1.5 text-base font-semibold leading-7 text-white shadow-sm hover:bg-indigo-500 transition-colors duration-200"
                            onClick={() => setEditMode(false)}>
                            Save
                        </button>
                        <button className="inline-block rounded-lg bg-indigo-600 px-4 py-1.5 text-base font-semibold leading-7 text-white shadow-sm hover:bg-indigo-500 transition-colors duration-200"
                            onClick={() => setEditMode(false)}>
                            Cancel
                        </button>
                    </>
                ) : (
                    <button className="inline-block rounded-lg bg-indigo-600 px-4 py-1.5 text-base font-semibold leading-7 text-white shadow-sm hover:bg-indigo-500 transition-colors duration-200"
                        onClick={() => setEditMode(true)}>
                        Edit
                    </button>
                )}
            </div>
        </div>
    );
} 
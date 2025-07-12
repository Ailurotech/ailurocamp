"use client";

import { useState } from "react";
import dynamic from "next/dynamic";

const tabs = [
    { name: "General", key: "general" },
    { name: "Profile", key: "profile" },
    { name: "Account", key: "account" },
    { name: "Preference", key: "preference" },
];

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState("general");
    //ProfileSettings
    const ProfileSettings = dynamic(() => import("./profile"), { ssr: false });

    return (
        <div className="max-w-3xl mx-auto py-8 px-4">
            <h1 className="text-4xl font-bold mb-6">Settings</h1>
            <div className="flex space-x-8 border-b mb-8">
                {tabs.map((tab) => (
                    <button
                        key={tab.key}
                        className={`pb-2 text-lg font-medium border-b-2 transition-colors duration-200 ${activeTab === tab.key
                            ? "border-gray-900 text-gray-900"
                            : "border-transparent text-gray-500 hover:text-gray-700"
                            }`}
                        onClick={() => setActiveTab(tab.key)}
                    >
                        {tab.name}
                    </button>
                ))}
            </div>
            <div>
                {activeTab === "general" && <div>General settings</div>}
                {activeTab === "profile" && <ProfileSettings />}
                {activeTab === "account" && <div>Account settings</div>}
                {activeTab === "preference" && <div>Preference settings</div>}
            </div>
        </div>
    );
} 
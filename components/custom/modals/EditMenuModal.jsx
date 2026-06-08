"use client";

import { useState } from "react";

import BottomSheet from "../ui/BottomSheet";

import styles from "./editMenu.module.css";

import MenuContentTab from "./menu-tabs/MenuContentTab";
import MenuStyleTab from "./menu-tabs/MenuStyleTab";
import MenuAdvancedTab from "./menu-tabs/MenuAdvancedTab";

const tabs = ["content", "style", "advanced"];

export default function EditMenuModal({ isOpen, onClose, element, onSave }) {
  const [activeTab, setActiveTab] = useState("content");

  const update = (data) => {
    onSave({
      ...element,
      ...data,
    });
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose}>
      <div className={styles.container}>
        {/* HEADER */}
        <div className={styles.header}>
          <h2>Edit Menu</h2>

          <button onClick={onClose}>Done</button>
        </div>

        {/* TABS */}
        <div className={styles.tabs}>
          {tabs.map((tab) => (
            <button
              key={tab}
              className={activeTab === tab ? styles.activeTab : ""}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* BODY */}
        <div className={styles.body}>
          {activeTab === "content" && (
            <MenuContentTab element={element} update={update} />
          )}

          {activeTab === "style" && (
            <MenuStyleTab element={element} update={update} />
          )}

          {activeTab === "advanced" && (
            <MenuAdvancedTab element={element} update={update} />
          )}
        </div>
      </div>
    </BottomSheet>
  );
}

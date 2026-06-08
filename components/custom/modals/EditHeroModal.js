"use client";

import { useState } from "react";

import BottomSheet from "../ui/BottomSheet";

import styles from "./editHero.module.css";

import HeroContentTab from "./hero-tabs/HeroContentTab";
import HeroStyleTab from "./hero-tabs/HeroStyleTab";
import HeroLayoutTab from "./hero-tabs/HeroLayoutTab";
import HeroAdvancedTab from "./hero-tabs/HeroAdvancedTab";

const tabs = ["content", "style", "layout", "advanced"];

export default function EditHeroModal({ isOpen, onClose, element, onSave }) {
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
          <h2>Edit Hero Section</h2>

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
            <HeroContentTab element={element} update={update} />
          )}

          {activeTab === "style" && (
            <HeroStyleTab element={element} update={update} />
          )}

          {activeTab === "layout" && (
            <HeroLayoutTab element={element} update={update} />
          )}

          {activeTab === "advanced" && (
            <HeroAdvancedTab element={element} update={update} />
          )}
        </div>
      </div>
    </BottomSheet>
  );
}

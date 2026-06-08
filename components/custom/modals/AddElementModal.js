// modals/AddElementModal.js
import BottomSheet from "../ui/BottomSheet";
import styles from "./addElement.module.css";
import { useState } from "react";

import {
  Type,
  Image as ImageIcon,
  MousePointerClick,
  FormInput,
  Video,
  Minus,
  ArrowUpDown,
  LayoutGrid,
  Timer,
  Menu,
  MessageSquare,
  LayoutPanelTop,
  ShoppingBag,
} from "lucide-react";

const elements = [
  { type: "text", label: "Text", icon: Type, available: true },
  { type: "image", label: "Image", icon: ImageIcon, available: true },
  { type: "button", label: "Button", icon: MousePointerClick, available: true },
  { type: "video", label: "Video", icon: Video, available: true },
  { type: "divider", label: "Divider", icon: Minus, available: true },
  { type: "spacer", label: "Spacer", icon: ArrowUpDown, available: true },
  { type: "menu", label: "Menu", icon: Menu, available: true },
  {
    type: "hero",
    label: "Hero",
    icon: LayoutPanelTop,
    available: true,
  },
  {
    type: "store-products",
    label: "Products",
    icon: ShoppingBag,
    available: true,
  },
  // 🚫 Coming soon
  { type: "form", label: "Form", icon: FormInput, available: false },
  { type: "cards", label: "Cards", icon: LayoutGrid, available: false },
  { type: "countdown", label: "Countdown", icon: Timer, available: false },

  {
    type: "testimonials",
    label: "Testimonials",
    icon: MessageSquare,
    available: false,
  },
];

export default function AddElementModal({ isOpen, onClose, onSelect }) {
  const [query, setQuery] = useState("");
  const filteredElements = elements.filter((el) =>
    el.label.toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <BottomSheet isOpen={isOpen} onClose={onClose}>
      <div className={styles.container}>
        <h3 className={styles.title}>Add Element</h3>

        <input
          className={styles.search}
          placeholder="Search elements..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        <div className={styles.grid}>
          {filteredElements.map((el) => {
            const Icon = el.icon;

            return (
              <div
                key={el.type}
                className={`${styles.card} ${!el.available ? styles.disabled : ""}`}
                onClick={() => el.available && onSelect(el.type)}
              >
                {!el.available && (
                  <span className={styles.badge}>Coming soon</span>
                )}

                <div className={styles.iconWrap}>
                  <Icon size={18} />
                </div>

                <p className={styles.label}>{el.label}</p>
              </div>
            );
          })}
        </div>
      </div>
    </BottomSheet>
  );
}

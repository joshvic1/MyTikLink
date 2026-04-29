import BottomSheet from "../ui/BottomSheet";
import styles from "./addElement.module.css";
import {
  Type,
  Image as ImageIcon,
  MousePointerClick,
  FormInput,
  Video,
  Minus,
  ArrowUpDown,
} from "lucide-react";

const elements = [
  { type: "text", label: "Text", icon: Type },
  { type: "image", label: "Image", icon: ImageIcon },
  { type: "button", label: "Button", icon: MousePointerClick },
  { type: "form", label: "Form", icon: FormInput },
  { type: "video", label: "Video", icon: Video },
  { type: "divider", label: "Divider", icon: Minus },
  { type: "spacer", label: "Spacer", icon: ArrowUpDown },
];

export default function AddElementModal({ isOpen, onClose, onSelect }) {
  return (
    <BottomSheet isOpen={isOpen} onClose={onClose}>
      <h3 className={styles.title}>Add Element</h3>

      <input className={styles.search} placeholder="Search elements..." />

      <div className={styles.grid}>
        {elements.map((el) => {
          const Icon = el.icon;

          return (
            <div
              key={el.type}
              className={styles.card}
              onClick={() => onSelect(el.type)}
            >
              <div className={styles.icon}>
                <Icon size={20} />
              </div>
              <p>{el.label}</p>
            </div>
          );
        })}
      </div>
    </BottomSheet>
  );
}

import { Plus, Sparkles } from "lucide-react";

import styles from "./firstProductPrompt.module.css";

export default function FirstProductPrompt({ productCount = 0, onCreate }) {
  if (productCount > 0) return null;

  return (
    <div className={styles.card}>
      <div className={styles.icon}>
        <Sparkles size={16} />
      </div>

      <div className={styles.text}>
        <h3>Create your first product</h3>
        <p>Add an item to your store and start accepting orders.</p>
      </div>

      <button type="button" className={styles.button} onClick={onCreate}>
        <Plus size={15} />
        Add
      </button>
    </div>
  );
}

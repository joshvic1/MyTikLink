import React from "react";
import styles from "./styles/loader.module.css";

export default function Loader() {
  return (
    <div>
      {" "}
      <div className={styles.loadingScreen}>
        <div className={styles.dotLoader}>
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </div>
  );
}

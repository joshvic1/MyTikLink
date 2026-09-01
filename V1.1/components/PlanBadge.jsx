import { BadgeCheck } from "lucide-react";
import styles from "../styles/v11.module.css";

export function PlanBadge({ plan }) { const value = String(plan || "free").toLowerCase(); const type = value.includes("pro") ? "pro" : value.includes("standard") ? "standard" : "free"; return <span className={`${styles.workspacePlanBadge} ${styles[`workspacePlan_${type}`]}`}>{type.toUpperCase()}{type !== "free" && <BadgeCheck/>}</span>; }

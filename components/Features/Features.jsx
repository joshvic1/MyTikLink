import styles from "./Features.module.css";
import {
  LuLayoutDashboard,
  LuUsers,
  LuChartBar,
  LuLink,
  LuMessageCircle,
  LuZap,
} from "react-icons/lu";

const features = [
  {
    icon: <LuLayoutDashboard />,
    title: "Create pages in minutes",
    desc: "Launch clean landing pages fast without any technical setup.",
  },
  {
    icon: <LuUsers />,
    title: "Capture real leads",
    desc: "Collect serious customer details before WhatsApp.",
  },
  {
    icon: <LuChartBar />,
    title: "Track performance",
    desc: "See what ads are bringing real customers.",
  },
  {
    icon: <LuLink />,
    title: "Works with TikTok & Meta ads",
    desc: "Send traffic to a page that actually converts.",
  },
  {
    icon: <LuMessageCircle />,
    title: "Built for WhatsApp selling",
    desc: "Close deals faster with ready-to-buy customers.",
  },
  {
    icon: <LuZap />,
    title: "No technical setup",
    desc: "No coding. No stress. Just results.",
  },
];

export default function Features() {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        {/* Label */}
        <p className={styles.label}>OUR FEATURES</p>

        {/* Heading */}
        <h2 className={styles.heading}>
          Everything You Need To{" "}
          <span className={styles.highlight}>Convert Traffic</span>
        </h2>

        {/* Grid */}
        <div className={styles.grid}>
          {features.map((item, index) => (
            <div
              className={styles.card}
              key={index}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className={styles.iconWrapper}>{item.icon}</div>

              <h3 className={styles.title}>{item.title}</h3>
              <p className={styles.desc}>{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

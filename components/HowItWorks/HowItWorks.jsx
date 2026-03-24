import styles from "./HowItWorks.module.css";

const steps = [
  {
    title: "Create your page",
    desc: "Set up your landing page in minutes with no technical stress.",
  },
  {
    title: "Run ads to your page",
    desc: "Send TikTok or Facebook traffic to a page designed to convert.",
  },
  {
    title: "Collect customer details",
    desc: "Capture real leads before they even reach your WhatsApp.",
  },
  {
    title: "Redirect to WhatsApp",
    desc: "Serious buyers land directly in your WhatsApp ready to chat.",
  },
];

export default function HowItWorks() {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        {/* Heading */}
        <h2 className={styles.heading}>How MyTikLink Works</h2>

        {/* Steps */}
        <div className={styles.steps}>
          {steps.map((step, index) => (
            <div className={styles.card} key={index}>
              <div className={styles.number}>{index + 1}</div>
              <h3 className={styles.title}>{step.title}</h3>
              <p className={styles.desc}>{step.desc}</p>
            </div>
          ))}
        </div>

        {/* Bottom Line */}
        <div className={styles.highlightBox}>
          👉 You get serious buyers, not random clicks
        </div>
      </div>
    </section>
  );
}

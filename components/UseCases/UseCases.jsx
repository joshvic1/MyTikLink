import styles from "./UseCases.module.css";

const users = [
  {
    title: "Business Owners",
    desc: "Sell your products faster by turning ad clicks into real WhatsApp conversations.",
  },
  {
    title: "Marketers",
    desc: "Run ads for clients and deliver better results with proper lead capture.",
  },
  {
    title: "Coaches",
    desc: "Get serious people into your WhatsApp before selling your program or service.",
  },
  {
    title: "WhatsApp Sellers",
    desc: "Stop chasing customers. Let them come ready to buy.",
  },
];

export default function UseCases() {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        {/* Heading */}
        <h2 className={styles.heading}>
          Built For People Who{" "}
          <span className={styles.highlight}>Want Results</span>
        </h2>

        {/* Grid */}
        <div className={styles.grid}>
          {users.map((user, index) => (
            <div className={styles.card} key={index}>
              <div className={styles.icon}>👤</div>
              <h3 className={styles.title}>{user.title}</h3>
              <p className={styles.desc}>{user.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

import styles from "./Testimonials.module.css";

const testimonials = [
  {
    name: "E-commerce Seller",
    text: "I stopped sending people directly to WhatsApp. Now I get only serious buyers messaging me.",
  },
  {
    name: "Digital Marketer",
    text: "My ad results improved instantly. Better leads and less wasted budget.",
  },
  {
    name: "WhatsApp Vendor",
    text: "Before, people would just view and leave. Now they come ready to buy.",
  },
];

export default function Testimonials() {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        {/* Heading */}
        <h2 className={styles.heading}>
          People Are Already{" "}
          <span className={styles.highlight}>Getting Results</span>
        </h2>

        {/* Grid */}
        <div className={styles.grid}>
          {testimonials.map((item, index) => (
            <div className={styles.card} key={index}>
              <p className={styles.text}>“{item.text}”</p>
              <p className={styles.name}>— {item.name}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

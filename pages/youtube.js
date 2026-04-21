import React, { useState } from "react";

const Kiddies3DPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form Submitted:", formData);
    alert("Submitted successfully!");
  };

  return (
    <>
      <style>{`
        .kid-wrap {
          min-height: 100vh;
          background: linear-gradient(180deg, #2f6fa5, #1c4f78);
          font-family: Inter, sans-serif;

          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;

          padding: 30px 20px;
          position: relative;
          overflow: hidden;
        }

        /* Background Glow */
        .kid-wrap::before {
          content: "";
          position: absolute;
          bottom: -100px;
          left: -100px;
          width: 400px;
          height: 400px;
          background: radial-gradient(circle, #f59e0b, transparent 70%);
          filter: blur(80px);
        }

        .kid-wrap::after {
          content: "";
          position: absolute;
          top: -100px;
          right: -100px;
          width: 400px;
          height: 400px;
          background: radial-gradient(circle, #38bdf8, transparent 70%);
          filter: blur(80px);
        }

        .kid-hero {
          text-align: center;
          margin-bottom: 10px;
          z-index: 1;
          gap: 2px;
        }

     .kid-hero h1 {
  font-size: clamp(28px, 8vw, 42px);
  font-weight: 900;
  color: #f59e0b;
  margin-bottom: 4px;

  /* 🔥 REAL 3D STACK */
  text-shadow:
    0 2px 0 #b45309,
    0 4px 0 #b45309,
    0 6px 0 #b45309,
    0 8px 0 #92400e,
    0 10px 0 #78350f,
    0 12px 15px rgba(0,0,0,0.6),
    0 20px 40px rgba(0,0,0,0.4);

  transform: perspective(500px) rotateX(10deg);
}
.kid-hero h1 {
  animation: pop 1.2s ease;
}

@keyframes pop {
  0% {
    transform: scale(0.8) rotateX(20deg);
    opacity: 0;
  }
  100% {
    transform: scale(1) rotateX(10deg);
    opacity: 1;
  }
}
  
        .kid-hero h2 {
          font-size: clamp(20px, 6vw, 28px);
          font-weight: 800;
          color: #38bdf8;
          text-shadow: 0 4px 0 #0369a1, 0 10px 25px rgba(0,0,0,0.4);
          margin-top: 0px;
        }

        .kid-card {
          width: 100%;
          max-width: 420px;

          background: rgba(255,255,255,0.06);
          backdrop-filter: blur(12px);

          border-radius: 20px;
          padding: 20px 14px;
margin: 20px;
          box-shadow: 0 25px 80px rgba(0,0,0,.5);
          z-index: 1;
        }

        .kid-text {
          font-size: clamp(13px, 4vw, 14px);
          color: #e2e8f0;
          margin-bottom: 20px;
          text-align: center;
        }

        .kid-form {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .kid-form input {
          padding: 14px;
          border-radius: 12px;
          border: none;
          font-size: 14px;
          outline: none;
        }

        .kid-form button {
          background: linear-gradient(135deg, #38bdf8, #0ea5e9);
          color: white;
          font-weight: 800;

          padding: 14px;
          border-radius: 999px;
          border: none;

          cursor: pointer;

          box-shadow: 0 10px 30px rgba(56,189,248,.5);
          transition: 0.3s;
        }

        .kid-form button:hover {
          transform: translateY(-2px) scale(1.03);
          box-shadow: 0 20px 50px rgba(56,189,248,.6);
        }

        /* MOBILE FIX */
        @media (max-width: 480px) {
          .kid-card {
            padding: 24px 12px;
            margin: 20px;
          }
        }
      `}</style>

      <div className="kid-wrap">
        <div className="kid-hero">
          <h1>GLORY-DEMO</h1>
          <h2>Kiddies Store 🛒</h2>
        </div>

        <div className="kid-card">
          <p className="kid-text">
            Enter your details below to get access to our latest kids
            collections and exclusive offers.
          </p>

          <form className="kid-form" onSubmit={handleSubmit}>
            <input
              type="text"
              name="name"
              placeholder="Your Name"
              value={formData.name}
              onChange={handleChange}
              required
            />

            <input
              type="tel"
              name="phone"
              placeholder="WhatsApp Number"
              value={formData.phone}
              onChange={handleChange}
              required
            />

            <button type="submit">Submit & Continue</button>
          </form>
        </div>
      </div>
    </>
  );
};

export default Kiddies3DPage;

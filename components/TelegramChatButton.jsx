"use client";

import { useEffect, useState } from "react";
import { MessageCircle } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import styles from "@/styles/TelegramChatButton.module.css";
import Modal from "@/components/Modal";

export default function TelegramChatButton({
  groupLink = "https://mytiklink.com/r/mytiklink",
}) {
  const [visible, setVisible] = useState(false);
  const [openModal, setOpenModal] = useState(false);

  useEffect(() => {
    setTimeout(() => setVisible(true), 300);
  }, []);

  const handleClick = () => {
    setOpenModal(true);
  };

  const handleRedirect = () => {
    window.open(groupLink, "_blank");
    setOpenModal(false);
  };

  return (
    <>
      {/* FLOATING BUTTON */}
      <button
        onClick={handleClick}
        className={`${styles.fab} ${visible ? styles.show : ""}`}
      >
        <FaWhatsapp size={24} />
      </button>

      {/* MODAL */}
      <Modal
        isOpen={openModal}
        onClose={() => setOpenModal(false)}
        title="Support Group Notice"
      >
        <div className="content">
          {/* TITLE */}

          {/* SUBTEXT */}
          <p className="subtext">
            Our WhatsApp support group is available daily between{" "}
            <strong>8:00AM – 10:00AM</strong>
          </p>

          {/* FEATURES */}
          <div className="features">
            <span>Questions</span>
            <span>Complaints</span>
            <span>Enquiries</span>
          </div>

          {/* INFO BOX */}
          <div className="notice">
            ⚡ Need urgent help?
            <br />
            Email:{" "}
            <strong>
              <a href="mailto:support@mytiklink.com">support@mytiklink.com</a>
            </strong>
          </div>

          {/* CTA */}
          <button className="joinBtn" onClick={handleRedirect}>
            Join WhatsApp Group →
          </button>
        </div>

        <style jsx>{`
          .content {
            text-align: center;
            padding-top: 10px;
          }

          /* ICON */
          .iconWrap {
            position: relative;
            margin-bottom: 14px;
          }

          .icon {
            font-size: 28px;
            position: relative;
            z-index: 2;
          }

          .iconGlow {
            position: absolute;
            inset: 0;
            margin: auto;
            width: 50px;
            height: 50px;
            background: radial-gradient(circle, #25d36655, transparent);
            filter: blur(10px);
            z-index: 1;
          }

          /* TITLE */
          .heading {
            font-size: 22px;
            font-weight: 700;
            margin-bottom: 10px;
          }

          /* SUBTEXT */
          .subtext {
            font-size: 14px;
            color: var(--muted);
            margin-bottom: 16px;
            line-height: 1.5;
          }

          /* FEATURES */
          .features {
            display: flex;
            justify-content: center;
            gap: 10px;
            flex-wrap: wrap;
            margin-bottom: 18px;
          }

          .features span {
            background: var(--glass);
            border: 1px solid var(--line);
            padding: 6px 12px;
            border-radius: 999px;
            font-size: 12px;
            font-weight: 500;
          }

          /* NOTICE BOX */
          .notice {
            background: rgba(37, 211, 102, 0.08);
            border: 1px solid rgba(37, 211, 102, 0.2);
            padding: 12px;
            border-radius: 12px;
            font-size: 13px;
            margin-bottom: 18px;
            line-height: 1.5;
          }

          /* BUTTON */
          .joinBtn {
            width: 100%;
            padding: 14px;
            border-radius: 12px;
            border: none;
            font-weight: 700;
            font-size: 15px;

            background: linear-gradient(135deg, #25d366, #128c7e);
            color: white;

            cursor: pointer;
            transition: all 0.25s ease;

            box-shadow: 0 10px 25px rgba(37, 211, 102, 0.25);
          }

          .joinBtn:hover {
            transform: translateY(-2px) scale(1.02);
            box-shadow: 0 15px 35px rgba(37, 211, 102, 0.35);
          }
        `}</style>
      </Modal>
    </>
  );
}

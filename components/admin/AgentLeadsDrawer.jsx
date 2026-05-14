"use client";

import { X, CheckCircle2 } from "lucide-react";

import styles from "@/styles/admin/agentLeadsDrawer.module.css";

export default function AgentLeadsDrawer({ agent, leads, onClose }) {
  return (
    <div className={styles.overlay}>
      <div className={styles.drawer}>
        <button className={styles.closeBtn} onClick={onClose}>
          <X size={18} />
        </button>

        <h2>{agent.name} Leads</h2>

        <p className={styles.email}>{agent.email}</p>

        <div className={styles.list}>
          {leads.length === 0 ? (
            <p>No leads assigned.</p>
          ) : (
            leads.map((lead) => (
              <div key={lead._id} className={styles.card}>
                <div className={styles.row}>
                  <div>
                    <strong>{lead.user?.name}</strong>

                    <p className={styles.email}>{lead.user?.email}</p>
                    {lead.userUpgradedBeforeContact && (
                      <div className={styles.upgradedBadge}>
                        User upgraded already
                      </div>
                    )}

                    {lead.totalEarned > 0 && (
                      <div className={styles.earnedBadge}>
                        +₦{lead.totalEarned} Earned
                      </div>
                    )}

                    {lead.rewardCount > 0 && (
                      <div className={styles.countBadge}>
                        {lead.rewardCount}/3 Upgrades
                      </div>
                    )}
                  </div>

                  <span
                    className={
                      lead.contacted ? styles.contacted : styles.notContacted
                    }
                  >
                    {lead.contacted ? "Contacted" : "Not Contacted"}
                  </span>
                </div>

                <div className={styles.meta}>
                  <div>
                    <small>WhatsApp</small>

                    <p>{lead.user?.whatsappNumber}</p>
                  </div>

                  <div>
                    <small>Assigned</small>

                    <p>{new Date(lead.createdAt).toLocaleString()}</p>
                  </div>
                </div>

                {lead.proofScreenshot ? (
                  <div className={styles.screenshotBox}>
                    <small>Uploaded Proof</small>

                    <a
                      href={lead.proofScreenshot}
                      target="_blank"
                      className={styles.screenshotLink}
                    >
                      {lead.proofScreenshot.split("/").pop()}
                    </a>
                  </div>
                ) : (
                  <div className={styles.noProof}>No screenshot uploaded</div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

"use client";

import { Eye, Mail, User, Link as LinkIcon } from "lucide-react";
import styles from "@/styles/admin/users.module.css";

export default function UserTable({ users, onOpen, onEmail }) {
  return (
    <div className={styles.tableCard}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>User</th>
            <th>Email</th>
            <th>Plan</th>
            <th>Links</th>
            <th>Created</th>
            <th></th>
          </tr>
        </thead>

        <tbody>
          {users.map((u) => (
            <tr key={u._id}>
              <td>
                <div className={styles.userCell}>
                  <User size={16} />
                  {u.name || "No Name"}
                </div>
              </td>

              <td>
                <div className={styles.userCell}>
                  <Mail size={14} />
                  {u.email}
                </div>
              </td>

              <td>
                <span className={`${styles.plan} ${styles[u.plan]}`}>
                  {u.plan}
                </span>
              </td>

              <td>
                <div className={styles.userCell}>
                  <LinkIcon size={14} />
                  {u.linkCount}
                </div>
              </td>

              <td>{new Date(u.createdAt).toLocaleDateString()}</td>

              <td className={styles.actions}>
                {/* VIEW */}
                <button className={styles.viewBtn} onClick={() => onOpen(u)}>
                  <Eye size={14} /> View
                </button>

                {/* EMAIL */}
                <button className={styles.viewBtn} onClick={() => onEmail(u)}>
                  <Mail size={14} /> Email
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

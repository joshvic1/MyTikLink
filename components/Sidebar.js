export default function Sidebar() {
  return (
    <div className="sidebar">
      <h2 className="logo">TikLink</h2>
      <ul>
        <li>Dashboard</li>
        <li>Create Link</li>
        <li>My Links</li>
        <li>Upgrade</li>
        <li>Logout</li>
      </ul>

      <style jsx>{`
        .sidebar {
          background: #000;
          color: #fff;
          width: 240px;
          height: 100vh;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          border-right: 1px solid #222;
        }
        .logo {
          color: #ff0050;
          font-size: 1.5rem;
          font-weight: bold;
        }
        ul {
          list-style: none;
          padding: 0;
          margin-top: 2rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        li {
          cursor: pointer;
          transition: 0.2s;
        }
        li:hover {
          color: #ff0050;
        }
      `}</style>
    </div>
  );
}

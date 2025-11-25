export default function Topbar() {
  return (
    <div className="topbar">
      <h3>Welcome back 👋</h3>
      <button>+ Create Link</button>

      <style jsx>{`
        .topbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 2rem;
          background: #111;
          border-bottom: 1px solid #222;
        }
        h3 {
          color: #fff;
        }
        button {
          background: #ff0050;
          border: none;
          color: #fff;
          padding: 0.6rem 1rem;
          border-radius: 8px;
          cursor: pointer;
        }
        button:hover {
          opacity: 0.9;
        }
      `}</style>
    </div>
  );
}

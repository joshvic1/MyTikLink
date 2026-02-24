export default function Page() {
  return (
    <div className="yt-wrap">
      <div className="yt-card">
        <div className="yt-badge">▶ YOUTUBE EXCLUSIVE</div>

        <h1>Watch My Exclusive YouTube Content</h1>

        <p className="yt-sub">
          This content is only available for a limited time. Don’t miss out.
        </p>

        <div className="yt-stats">
          <div>
            <strong>120K+</strong>
            <span>Subscribers</span>
          </div>
          <div>
            <strong>5M+</strong>
            <span>Total Views</span>
          </div>
          <div>
            <strong>100+</strong>
            <span>Videos</span>
          </div>
        </div>

        <button className="yt-btn">Watch Now</button>

        <p className="yt-note">Limited access. Watch before it gets removed.</p>
      </div>

      <style jsx>{`
        .yt-wrap {
          min-height: 100vh;
          background: radial-gradient(circle at top, #0f0f0f, #000);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          font-family: Inter, system-ui, sans-serif;
        }

        .yt-card {
          background: #111;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 20px;
          padding: 40px 28px;
          max-width: 480px;
          width: 100%;
          text-align: center;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6);
        }

        .yt-badge {
          display: inline-block;
          background: #ff0000;
          color: white;
          font-weight: 700;
          font-size: 12px;
          padding: 6px 14px;
          border-radius: 999px;
          margin-bottom: 18px;
          letter-spacing: 1px;
        }

        h1 {
          font-size: 26px;
          font-weight: 900;
          color: white;
          margin-bottom: 14px;
          line-height: 1.3;
        }

        .yt-sub {
          font-size: 15px;
          color: #bbb;
          margin-bottom: 28px;
          line-height: 1.6;
        }

        .yt-stats {
          display: flex;
          justify-content: space-between;
          margin-bottom: 30px;
          gap: 12px;
        }

        .yt-stats div {
          flex: 1;
          background: rgba(255, 255, 255, 0.05);
          padding: 12px;
          border-radius: 14px;
        }

        .yt-stats strong {
          display: block;
          font-size: 18px;
          color: white;
          margin-bottom: 4px;
        }

        .yt-stats span {
          font-size: 12px;
          color: #999;
        }

        .yt-btn {
          width: 100%;
          background: #ff0000;
          color: white;
          font-size: 16px;
          font-weight: 800;
          padding: 14px;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          transition: 0.3s;
          box-shadow: 0 8px 25px rgba(255, 0, 0, 0.4);
        }

        .yt-btn:hover {
          background: #e60000;
          transform: translateY(-2px);
          box-shadow: 0 12px 30px rgba(255, 0, 0, 0.5);
        }

        .yt-note {
          margin-top: 18px;
          font-size: 12px;
          color: #777;
        }

        @media (max-width: 480px) {
          .yt-stats {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
}

export default function ClickDetailsTable({ clicks }) {
  return (
    <div className="bg-[#0b0b0b] mt-6 p-6 rounded-2xl border border-[#1e1e1e] text-white w-full shadow-lg overflow-x-auto">
      <h3 className="text-lg mb-4 font-semibold">Click Details</h3>
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="text-gray-400 border-b border-[#1e1e1e]">
            <th className="py-2 text-left">Date</th>
            <th className="py-2 text-left">IP Address</th>
            <th className="py-2 text-left">Device</th>
          </tr>
        </thead>
        <tbody>
          {clicks.map((click, idx) => (
            <tr
              key={idx}
              className="border-b border-[#1e1e1e] hover:bg-[#151515] transition"
            >
              <td className="py-2">
                {new Date(click.timestamp).toLocaleString()}
              </td>
              <td className="py-2">{click.ip || "Unknown"}</td>
              <td className="py-2">{click.userAgent?.slice(0, 30) || "N/A"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

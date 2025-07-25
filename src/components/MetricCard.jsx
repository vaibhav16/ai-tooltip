export default function MetricCard({ title, value }) {
  return (
    <div className="bg-white p-4 rounded-xl shadow text-center hover:shadow-lg transition">
      <div className="text-gray-500 text-sm">{title}</div>
      <div className="text-2xl font-semibold mt-1">{value}</div>
    </div>
  );
}
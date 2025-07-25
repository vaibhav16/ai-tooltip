import React from "react";

const candidates = [
  { name: "Riya Mehta", role: "Frontend Engineer", yoe: 3, notice: "15 days", status: "Interviewing" },
  { name: "Amit Rao", role: "Backend Engineer", yoe: 5, notice: "30 days", status: "Offered" },
  { name: "Sneha Patil", role: "Product Manager", yoe: 4, notice: "Serving", status: "Rejected" },
  { name: "Karan Gill", role: "DevOps Engineer", yoe: 2, notice: "7 days", status: "Interviewing" },
];

export default function CandidatesTable() {
  return (
    <table className="min-w-full text-sm text-left text-gray-600">
      <thead className="bg-gray-100 text-xs uppercase text-gray-500">
        <tr>
          <th className="px-6 py-3">Name</th>
          <th className="px-6 py-3">Role</th>
          <th className="px-6 py-3">Experience</th>
          <th className="px-6 py-3">Notice Period</th>
          <th className="px-6 py-3">Status</th>
        </tr>
      </thead>
      <tbody>
        {candidates.map((c, idx) => (
          <tr key={idx} className="border-b hover:bg-gray-50">
            <td className="px-6 py-4 font-medium text-gray-800">{c.name}</td>
            <td className="px-6 py-4">{c.role}</td>
            <td className="px-6 py-4">{c.yoe} yrs</td>
            <td className="px-6 py-4">{c.notice}</td>
            <td className={`px-6 py-4 font-semibold ${
              c.status === "Offered"
                ? "text-green-600"
                : c.status === "Rejected"
                ? "text-red-500"
                : "text-blue-600"
            }`}>
              {c.status}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

"use client";

export default function RecentCompaniesCard({ companies }) {
  // Sort by createdAt descending and show most recent 5
  const sorted = (companies || [])
    .slice()
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  return (
    <div className="p-6 rounded-xl border border-neutral-300 bg-white">
      <h2 className="text-lg font-semibold mb-1">
        Recent Registered Companies
      </h2>
      <p className="text-sm text-neutral-500 mb-4">Last registered companies</p>

      <div className="flex flex-col gap-3">
        {sorted.map((company) => (
          <div
            key={company.id || company.registrationNumber || company.name}
            className="p-3 rounded-lg border border-neutral-200 hover:border-orange-300 hover:bg-orange-50 transition-all duration-300"
          >
            <p className="font-semibold text-sm text-neutral-900">
              {company.name}
            </p>
            <div className="flex items-center justify-between mt-1">
              <p className="text-sm text-neutral-500">
                {company.country || company.city || "—"}
              </p>
              <p className="text-xs text-neutral-400">
                {new Date(company.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        ))}
      </div>

      <button className="mt-4 text-sm font-semibold text-orange-600 hover:underline transition-all">
        See more →
      </button>
    </div>
  );
}

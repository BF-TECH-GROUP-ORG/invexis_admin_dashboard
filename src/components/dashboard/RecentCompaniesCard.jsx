"use client";

export default function RecentCompaniesCard({ companies }) {
  return (
    <div className="p-6 rounded-xl border border-neutral-300 bg-white">
      <h2 className="text-lg font-semibold mb-1">
        Recent Registered Companies
      </h2>
      <p className="text-sm text-neutral-500 mb-4">Last registered companies</p>

      <div className="flex flex-col gap-3">
        {companies.map((company, i) => (
          <div
            key={i}
            className="p-3 rounded-lg border border-neutral-200 hover:border-orange-300 hover:bg-orange-50 transition-all duration-300"
          >
            <p className="font-semibold text-sm text-neutral-900">
              {company.name}
            </p>
            <p className="text-sm text-neutral-500 mt-1">{company.location}</p>
          </div>
        ))}
      </div>

      <button className="mt-4 text-sm font-semibold text-orange-600 hover:underline transition-all">
        See more →
      </button>
    </div>
  );
}

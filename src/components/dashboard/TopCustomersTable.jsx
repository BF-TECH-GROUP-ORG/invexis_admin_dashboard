"use client";

import { Crown, TrendingUp, ShoppingBag, DollarSign } from "lucide-react";

export default function TopCustomersTable({ customers = [], title = "Top Customers" }) {
  if (!customers || customers.length === 0) {
    return (
      <div className="p-6 rounded-xl border border-neutral-300 bg-white shadow-sm">
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-1">{title}</h2>
          <p className="text-sm text-neutral-500">By total spending</p>
        </div>
        <div className="w-full h-96 flex items-center justify-center">
          <p className="text-neutral-400 text-sm">No customer data available</p>
        </div>
      </div>
    );
  }
  return (
    <div className="p-6 rounded-xl border border-neutral-300 bg-white shadow-sm">
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-1">{title}</h2>
        <p className="text-sm text-neutral-500">
          Highest spending customers by total value
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 border-neutral-200">
              <th className="text-left py-3 px-4 font-semibold text-neutral-700">
                Rank
              </th>
              <th className="text-left py-3 px-4 font-semibold text-neutral-700">
                Customer
              </th>
              <th className="text-right py-3 px-4 font-semibold text-neutral-700">
                Orders
              </th>
              <th className="text-right py-3 px-4 font-semibold text-neutral-700">
                Total Spent
              </th>
              <th className="text-right py-3 px-4 font-semibold text-neutral-700">
                Avg Order
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((customer, index) => (
              <tr
                key={index}
                className="border-b border-neutral-100 hover:bg-orange-50 transition-colors"
              >
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    {index < 3 ? (
                      <Crown
                        className="w-5 h-5"
                        style={{
                          color: index === 0 ? "#ff782d" : index === 1 ? "#a855f7" : "#3b82f6",
                        }}
                      />
                    ) : (
                      <span className="text-neutral-500 font-medium">#{index + 1}</span>
                    )}
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-purple-500 flex items-center justify-center text-white font-bold text-xs">
                      {customer.name.split(" ").map(n => n[0]).join("")}
                    </div>
                    <span className="font-medium text-neutral-900">{customer.name}</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <ShoppingBag className="w-4 h-4 text-neutral-400" />
                    <span className="font-semibold text-neutral-900">{customer.orders}</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <DollarSign className="w-4 h-4 text-green-500" />
                    <span className="font-bold text-green-600">
                      ${(customer.totalSpent || 0).toLocaleString()}
                    </span>
                  </div>
                </td>
                <td className="py-3 px-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <TrendingUp className="w-4 h-4 text-neutral-400" />
                    <span className="text-neutral-700">${customer.avgOrder}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

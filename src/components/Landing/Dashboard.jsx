'use client';

import { useState } from 'react';
import { 
  ChevronDown, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  Printer
} from 'lucide-react';

export default function AnalyticsDashboard() {
  const [selectedShop, setSelectedShop] = useState('All Shops');
  const [currentDate] = useState('31/12/2025');

  // Sample orders data
  const ordersData = [
    {
      id: '#001',
      customer: 'Alice M.',
      date: 'Sep 2, 2025',
      products: '3 items',
      qty: 5,
      totalAmount: '120 FRW',
      sellingMethod: 'Ordered',
      payment: 'Card',
      status: 'Completed',
      actionStatus: 'Invoice'
    },
    {
      id: '#002',
      customer: 'Alice M.',
      date: 'Sep 2, 2025',
      products: '3 items',
      qty: 5,
      totalAmount: '120 FRW',
      sellingMethod: 'In hand',
      payment: 'Phone',
      status: 'Completed',
      actionStatus: 'Invoice'
    }
  ];

  const StatusBadge = ({ status, type = 'status' }) => {
    const getStatusStyle = (status, type) => {
      if (type === 'method') {
        switch (status) {
          case 'Ordered':
            return 'bg-orange-100 text-orange-600 border border-orange-200';
          case 'In hand':
            return 'bg-blue-100 text-blue-600 border border-blue-200';
          default:
            return 'bg-gray-100 text-gray-600';
        }
      } else if (type === 'action') {
        return 'bg-teal-100 text-teal-600 border border-teal-200 cursor-pointer hover:bg-teal-200';
      } else {
        switch (status) {
          case 'Completed':
            return 'bg-green-100 text-green-600';
          default:
            return 'bg-gray-100 text-gray-600';
        }
      }
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusStyle(status, type)}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">Analytics</h1>
          <div className="text-sm text-gray-500">On {currentDate}</div>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Sold Product Today */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="text-sm text-gray-600 mb-2">Sold Product Today</h3>
            <div className="flex items-baseline space-x-2 mb-3">
              <span className="text-3xl font-bold text-gray-900">400</span>
              <span className="text-lg font-medium text-orange-500">Pcs</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-600">Now We have Sold</span>
              <span className="bg-green-100 text-green-600 text-xs px-2 py-1 rounded font-medium">
                65.7%
              </span>
            </div>
          </div>

          {/* Current Revenue Today */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="text-sm text-gray-600 mb-2">Current Revenue Today</h3>
            <div className="text-3xl font-bold text-gray-900 mb-3">5,000,000</div>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-teal-500">400</span>
              <span className="text-xs text-gray-400">X</span>
              <span className="text-xs text-teal-500">300</span>
            </div>
          </div>

          {/* Low Stock Items */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="text-sm text-gray-600 mb-2">Low Stock Items</h3>
            <div className="flex items-center justify-center mb-4">
              <div className="relative w-16 h-16">
                <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    d="m18,2.0845 a 15.9155,15.9155 0 0,1 0,31.831 a 15.9155,15.9155 0 0,1 0,-31.831"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="2"
                  />
                  <path
                    d="m18,2.0845 a 15.9155,15.9155 0 0,1 0,31.831 a 15.9155,15.9155 0 0,1 0,-31.831"
                    fill="none"
                    stroke="#f97316"
                    strokeWidth="2"
                    strokeDasharray="14, 86"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-bold text-gray-900">14%</span>
                </div>
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex items-center text-xs">
                <div className="w-2 h-2 bg-orange-500 rounded-full mr-2"></div>
                <span className="text-gray-600">Remaining Products</span>
              </div>
              <div className="flex items-center text-xs">
                <div className="w-2 h-2 bg-gray-300 rounded-full mr-2"></div>
                <span className="text-gray-600">Whole Stock</span>
              </div>
            </div>
          </div>

          {/* Expected Income On Stock */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="text-sm text-gray-600 mb-2">Expected Income On Stock</h3>
            <div className="text-3xl font-bold text-gray-900 mb-3">120,000,000</div>
            <div className="text-xs text-teal-500">When We Find Our Stock</div>
          </div>
        </div>

        {/* Stock Status Analysis */}
        <div className="bg-white rounded-lg shadow-sm mb-8">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Stock Status analysis</h3>
                <p className="text-sm text-gray-600 mt-1">Overview of today's inventory and stock levels per product</p>
              </div>
              <ChevronDown className="w-5 h-5 text-gray-400" />
            </div>
          </div>
          
          <div className="p-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-700">Total earned on ( Mukiko ) shop :</span>
                <span className="font-semibold text-green-600">240 FRW</span>
              </div>
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <select 
                    value={selectedShop}
                    onChange={(e) => setSelectedShop(e.target.value)}
                    className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option>All Shops</option>
                    <option>Mukiko Shop</option>
                    <option>Downtown Shop</option>
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
              <button className="flex items-center space-x-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                <Filter className="w-4 h-4 text-gray-600" />
                <span className="text-sm text-gray-700">Filters</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Products
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Qty
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Selling Method
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {ordersData.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.customer}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.products}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.qty}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.totalAmount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={order.sellingMethod} type="method" />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.payment}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={order.actionStatus} type="action" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-end space-x-2">
              <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <ChevronLeft className="w-4 h-4 text-gray-600" />
              </button>
              <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <ChevronRight className="w-4 h-4 text-gray-600" />
              </button>
              <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <Printer className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
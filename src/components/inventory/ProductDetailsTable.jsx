'use client';

import { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Trash2, 
  Filter, 
  Download, 
  Plus,
  ChevronDown,
  MoreVertical
} from 'lucide-react';
import {
  fetchProducts,
  deleteProducts,
  toggleSelectProduct,
  selectAllProducts,
  deselectAllProducts,
  selectAllProductsData,
  selectSelectedProducts,
  selectProductLoading,
  setCurrentProduct
} from '@/store/slices/productSlice';

const ProductDetailsTable = ({ onAddNew }) => {
  const dispatch = useDispatch();

  // Safely select products (fallback to empty array)
  const products = useSelector(selectAllProductsData) || [];
  const selectedProducts = useSelector(selectSelectedProducts) || [];
  const loading = useSelector(selectProductLoading);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  // ✅ Handle sorting logic safely
  const sortedProducts = useMemo(() => {
    if (!Array.isArray(products)) return [];
    if (!sortConfig.key) return products;

    const sorted = [...products].sort((a, b) => {
      const aValue = a?.[sortConfig.key];
      const bValue = b?.[sortConfig.key];

      if (aValue === undefined || bValue === undefined) return 0;
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [products, sortConfig]);

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      dispatch(selectAllProducts());
    } else {
      dispatch(deselectAllProducts());
    }
  };

  const handleSelectProduct = (productId) => {
    dispatch(toggleSelectProduct(productId));
  };

  const handleDelete = async () => {
    if (selectedProducts.length === 0) {
      alert('Please select products to delete');
      return;
    }

    if (window.confirm(`Delete ${selectedProducts.length} product(s)?`)) {
      await dispatch(deleteProducts(selectedProducts));
    }
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleExport = () => {
    console.log('Exporting products...');
    alert('Export functionality to be implemented');
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'low':
        return 'bg-red-100 text-red-600';
      case 'medium':
        return 'bg-yellow-100 text-yellow-600';
      case 'high':
        return 'bg-green-100 text-green-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  // ✅ Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  // ✅ Empty data state
  if (!loading && (!products || products.length === 0)) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500">
        <p className="text-lg font-medium">No products found</p>
        <button
          onClick={onAddNew}
          className="mt-4 flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add new product
        </button>
      </div>
    );
  }

  // ✅ Normal table rendering
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl font-semibold text-gray-900">Product Details</h2>
        
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleDelete}
            disabled={selectedProducts.length === 0}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              selectedProducts.length > 0
                ? 'bg-red-500 text-white hover:bg-red-600'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
          
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Filter className="w-4 h-4" />
            Filters
          </button>
          
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
          
          <button
            onClick={onAddNew}
            className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add new
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1000px]">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedProducts.length === products.length && products.length > 0}
                  onChange={handleSelectAll}
                  className="w-4 h-4 text-orange-500 rounded focus:ring-orange-500"
                />
              </th>
              {[
                { key: 'name', label: 'Product name' },
                { key: 'category', label: 'Category' },
                { key: 'unitPrice', label: 'Unit price' },
                { key: 'inStock', label: 'In stock' },
                { key: 'discount', label: 'Discount' },
                { key: 'status', label: 'Status' },
                { key: 'totalValue', label: 'Total Value' },
              ].map(({ key, label }) => (
                <th
                  key={key}
                  onClick={() => handleSort(key)}
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                >
                  <div className="flex items-center gap-1">
                    {label}
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </th>
              ))}
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200">
            {sortedProducts.map((product) => (
              <tr key={product.id || product._id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-4">
                  <input
                    type="checkbox"
                    checked={selectedProducts.includes(product.id || product._id)}
                    onChange={() => handleSelectProduct(product.id || product._id)}
                    className="w-4 h-4 text-orange-500 rounded focus:ring-orange-500"
                  />
                </td>
                <td className="px-4 py-4 text-sm text-gray-900 font-medium">{product.name}</td>
                <td className="px-4 py-4 text-sm text-gray-600">{product.category}</td>
                <td className="px-4 py-4 text-sm text-gray-600">{product.unitPrice?.toLocaleString()} RWF</td>
                <td className="px-4 py-4 text-sm text-gray-600">{product.inStock}</td>
                <td className="px-4 py-4 text-sm text-gray-600">{product.discount?.toLocaleString()} RWF</td>
                <td className="px-4 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(product.status)}`}>
                    {product.status}
                  </span>
                </td>
                <td className="px-4 py-4 text-sm text-gray-600">{product.totalValue?.toLocaleString()} RWF</td>
                <td className="px-4 py-4">
                  <button className="p-1 hover:bg-gray-100 rounded transition-colors">
                    <MoreVertical className="w-5 h-5 text-gray-400" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductDetailsTable;

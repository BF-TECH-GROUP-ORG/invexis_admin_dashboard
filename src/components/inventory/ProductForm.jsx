'use client';

import { useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Upload, Calendar, Clock } from 'lucide-react';
import {
  createProduct,
  updateProduct,
  uploadProductImage,
  selectProductLoading
} from '@/store/slices/productSlice';

const ProductForm = ({ onClose, productToEdit = null }) => {
  const dispatch = useDispatch();
  const loading = useSelector(selectProductLoading);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState(productToEdit || {
    name: '',
    category: '',
    unitPrice: '',
    supplier: '',
    expiryDate: '',
    quantity: '',
    description: '',
    image: null,
    discountEnabled: false,
    discountType: 'percentage',
    discountValue: '',
    returnPolicy: {
      dateAdded: new Date().toISOString().split('T')[0],
      time: '12:00 PM'
    }
  });

  const [imagePreview, setImagePreview] = useState(productToEdit?.image || null);

  const categories = ['Phone', 'Laptop', 'Tablet', 'Accessories', 'Electronics'];
  const suppliers = ['Apple Inc', 'Samsung', 'Dell', 'HP', 'Sony'];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setFormData(prev => ({ ...prev, image: file }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (productToEdit) {
        await dispatch(updateProduct({
          id: productToEdit.id,
          productData: formData
        })).unwrap();
      } else {
        await dispatch(createProduct(formData)).unwrap();
      }

      alert('Product saved successfully!');
      onClose();
    } catch (error) {
      alert('Error saving product: ' + error.message || error);
    }
  };

  return (
    <div className="bg-white rounded-lg p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        {productToEdit ? 'Edit Product' : 'Add New Product'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Product name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Product name"
                className="w-full px-4 py-2 bg-gray-100 border-0 rounded-lg focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-4 py-2 bg-gray-100 border-0 rounded-lg focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all"
                required
              >
                <option value="">Select product category</option>
                {categories.map(cat => (
                  <option key={cat} value={cat.toLowerCase()}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Selling price</label>
                <input
                  type="number"
                  name="unitPrice"
                  value={formData.unitPrice}
                  onChange={handleInputChange}
                  placeholder="Selling price"
                  className="w-full px-4 py-2 bg-gray-100 border-0 rounded-lg focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Supplier</label>
                <select
                  name="supplier"
                  value={formData.supplier}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-gray-100 border-0 rounded-lg focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all"
                  required
                >
                  <option value="">Select supplier</option>
                  {suppliers.map(sup => (
                    <option key={sup} value={sup}>{sup}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Date</label>
              <input
                type="date"
                name="expiryDate"
                value={formData.expiryDate}
                onChange={handleInputChange}
                className="w-full px-4 py-2 bg-gray-100 border-0 rounded-lg focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Product quantity</label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleInputChange}
                placeholder="Product quantity"
                className="w-full px-4 py-2 bg-gray-100 border-0 rounded-lg focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all"
                required
              />
            </div>

            {/* Discount Section */}
            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-4">
                <label className="text-sm font-medium text-gray-700">Discount</label>
                <label className="flex items-center cursor-pointer relative">
                  <input
                    type="checkbox"
                    name="discountEnabled"
                    checked={formData.discountEnabled}
                    onChange={handleInputChange}
                    className="sr-only"
                  />
                  <div
                    className={`w-10 h-6 rounded-full transition-colors ${
                      formData.discountEnabled ? 'bg-orange-500' : 'bg-gray-300'
                    }`}
                  ></div>
                  <div
                    className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      formData.discountEnabled ? 'translate-x-4' : ''
                    }`}
                  ></div>
                  <span className="ml-2 text-sm text-gray-600">Add Discount</span>
                </label>
              </div>

              {formData.discountEnabled && (
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    name="discountType"
                    value={formData.discountType}
                    onChange={handleInputChange}
                    placeholder="Type"
                    className="px-4 py-2 bg-gray-100 border-0 rounded-lg focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all"
                  />
                  <input
                    type="number"
                    name="discountValue"
                    value={formData.discountValue}
                    onChange={handleInputChange}
                    placeholder="Value"
                    className="px-4 py-2 bg-gray-100 border-0 rounded-lg focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Write product description..."
                rows={5}
                className="w-full px-4 py-2 bg-gray-100 border-0 rounded-lg focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all"
              ></textarea>
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Product Image</label>
              <div
                className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-4 cursor-pointer hover:border-orange-400 transition"
                onClick={() => fileInputRef.current.click()}
              >
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="w-48 h-48 object-cover rounded-lg" />
                ) : (
                  <>
                    <Upload className="w-10 h-10 text-gray-400" />
                    <p className="text-sm text-gray-500 mt-2">Click to upload product image</p>
                  </>
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>
            </div>

            {/* Return Policy Info */}
            <div className="flex items-center justify-between mt-6 text-gray-600 text-sm">
              <span className="flex items-center gap-2">
                <Calendar className="w-4 h-4" /> Added: {formData.returnPolicy.dateAdded}
              </span>
              <span className="flex items-center gap-2">
                <Clock className="w-4 h-4" /> {formData.returnPolicy.time}
              </span>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-4 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 rounded-lg bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-50 transition"
          >
            {loading ? 'Saving...' : 'Save Product'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;

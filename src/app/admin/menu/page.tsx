// File: app/admin/menu/page.tsx

"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Define a type for our menu item for TypeScript
interface MenuItem {
  _id: string;
  name: string;
  price: number;
  category: string;
  inStock: boolean;
  count: number;
}

// A reusable component for our Add/Edit Item Modal
const ItemModal = ({
  onClose,
  onSave,
  itemToEdit,
}: {
  onClose: () => void;
  onSave: (itemData: Omit<MenuItem, '_id' | 'inStock'>, id?: string) => Promise<void>;
  itemToEdit: MenuItem | null;
}) => {
  const [name, setName] = useState(itemToEdit?.name || '');
  const [price, setPrice] = useState(itemToEdit?.price.toString() || '');
  const [category, setCategory] = useState(itemToEdit?.category || 'Snacks');
  const [count, setCount] = useState(itemToEdit?.count.toString() || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError('');
    setIsSubmitting(true);
    try {
      const itemData = {
        name,
        price: parseFloat(price),
        category,
        count: parseInt(count, 10),
      };
      // If we are editing, we pass the ID, otherwise it's undefined
      await onSave(itemData, itemToEdit?._id);
    } catch (error: any) {
      setModalError(error.message || 'An unknown error occurred.');
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6">{itemToEdit ? 'Edit Menu Item' : 'Add New Menu Item'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <input type="text" placeholder="Item Name" value={name} onChange={(e) => setName(e.target.value)} required className="w-full px-3 py-2 border border-gray-300 rounded-md" />
            <input type="number" placeholder="Price" value={price} onChange={(e) => setPrice(e.target.value)} required className="w-full px-3 py-2 border border-gray-300 rounded-md" step="0.01" min="0" />
            <input type="number" placeholder="Stock Count" value={count} onChange={(e) => setCount(e.target.value)} required className="w-full px-3 py-2 border border-gray-300 rounded-md" min="0" />
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md">
              <option value="Snacks">Snacks</option>
              <option value="Meals">Meals</option>
              <option value="Chai">Chai</option>
            </select>
          </div>
          {modalError && <p className="text-red-500 text-sm mt-4">{modalError}</p>}
          <div className="flex justify-end space-x-4 mt-6">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400" disabled={isSubmitting}>Cancel</button>
            <button type="submit" className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:bg-green-300" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


export default function MenuManagementPage() {
  const router = useRouter();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null); // State to hold the item being edited

  const fetchMenuItems = async () => {
    try {
      const response = await fetch('/api/menu');
      if (!response.ok) throw new Error('Failed to fetch menu items');
      const data = await response.json();
      setMenuItems(data);
    } catch (err: any) {
      setError(err.message);
    }
  };

  useEffect(() => {
    setIsLoading(true);
    fetchMenuItems().finally(() => setIsLoading(false));
  }, []);

  const handleOpenAddModal = () => {
    setEditingItem(null); // Make sure we're not in edit mode
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: MenuItem) => {
    setEditingItem(item); // Set the item to edit
    setIsModalOpen(true);
  };

  const handleSaveItem = async (itemData: Omit<MenuItem, '_id' | 'inStock'>, id?: string) => {
    const isEditing = !!id;
    const url = isEditing ? `/api/menu?id=${id}` : '/api/menu';
    const method = isEditing ? 'PUT' : 'POST';

    const response = await fetch(url, {
      method: method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(itemData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Failed to ${isEditing ? 'update' : 'add'} item.`);
    }
    
    setIsModalOpen(false);
    setEditingItem(null);
    await fetchMenuItems(); // Re-fetch data to show the changes
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    try {
      const response = await fetch(`/api/menu?id=${itemId}`, { method: 'DELETE' });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete item.');
      }
      await fetchMenuItems();
    } catch (err: any) {
      console.error('Delete error:', err);
      alert(`Error: ${err.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {isModalOpen && <ItemModal onClose={() => setIsModalOpen(false)} onSave={handleSaveItem} itemToEdit={editingItem} />}
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-xl font-bold text-indigo-600">Canteen Admin</h1>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <a href="/admin/dashboard" className="text-gray-500 hover:bg-gray-100 px-3 py-2 rounded-md text-sm font-medium">Dashboard</a>
                <a href="/admin/menu" className="bg-indigo-600 text-white px-3 py-2 rounded-md text-sm font-medium">Menu</a>
                <a href="/admin/orders" className="text-gray-500 hover:bg-gray-100 px-3 py-2 rounded-md text-sm font-medium">Orders</a>
              </div>
            </div>
            <button onClick={() => router.push('/admin/login')} className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-md text-sm font-medium">Logout</button>
          </div>
        </div>
      </nav>
      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Menu Items</h2>
            <button onClick={handleOpenAddModal} className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg">+ Add New Item</button>
          </div>
          <div className="bg-white p-8 rounded-lg shadow overflow-x-auto">
            {isLoading && <p>Loading menu...</p>}
            {error && <p className="text-red-500">Error: {error}</p>}
            {!isLoading && !error && (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock Count</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {menuItems.map((item) => (
                    <tr key={item._id}>
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{item.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-500">{item.category}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-500">₹{item.price.toFixed(2)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-500">{item.count}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${item.inStock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{item.inStock ? 'In Stock' : 'Out of Stock'}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button onClick={() => handleOpenEditModal(item)} className="text-indigo-600 hover:text-indigo-900">Edit</button>
                        <button onClick={() => handleDeleteItem(item._id)} className="ml-4 text-red-600 hover:text-red-900">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

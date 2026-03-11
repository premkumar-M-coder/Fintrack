import React from "react";

const CategoryBox = ({ categories = [] }) => {
    return (
        <div className="bg-white shadow rounded-xl p-5">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Top Categories</h2>

                <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 text-sm rounded">
                    + Add
                </button>
            </div>

            {categories.length === 0 && (
                <p className="text-gray-500">No categories yet.</p>
            )}

            <div className="space-y-3">
                {categories.map((cat, i) => (
                    <div
                        key={i}
                        className="flex justify-between items-center bg-gray-50 border rounded-lg px-4 py-2"
                    >
                        <span className="font-medium text-gray-700">{cat.name}</span>
                        <span className="text-gray-500">₹{cat.amount || 0}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CategoryBox;

// Test Market component to debug the issue
import React, { useState, useEffect } from 'react';
import api from '../services/api';

const TestMarket = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Testing market API...');
        const response = await api.getCurrentMarketPrices({
          commodity: 'wheat',
          state: 'Maharashtra',
          district: 'Pune'
        });
        
        console.log('API Response:', response);
        setData(response);
      } catch (err) {
        console.error('API Error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p>Loading test market data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded max-w-md">
          <h3 className="font-bold">Test Market Error</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Test Market Data</h1>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">API Response:</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>

        {data?.data?.prices && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            {data.data.prices.map((price, index) => (
              <div key={index} className="bg-white rounded-lg shadow p-6">
                <h3 className="font-semibold text-gray-900 mb-2">{price.market}</h3>
                <p className="text-sm text-gray-600 mb-4">{price.district}, {price.state}</p>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Modal Price:</span>
                    <span className="font-semibold">₹{price.modalPrice}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Min Price:</span>
                    <span className="text-red-600">₹{price.minPrice}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Max Price:</span>
                    <span className="text-green-600">₹{price.maxPrice}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TestMarket;
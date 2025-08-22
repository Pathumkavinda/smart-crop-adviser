"use client"

import { useState } from 'react';
import { BarChart, LineChart, PieChart, DonutChart, AreaChart } from 'recharts';
import { Search, Users, MessageCircle, FileText, BarChart2, Home, LogOut, Filter, Download, Calendar, Map, HelpCircle, Info, Plus, Send, AlertTriangle, CheckCircle, Activity, Globe, ThumbsUp, Thermometer, Clock, Droplet, Wind, User, Bell, Lock, Camera, Settings } from 'lucide-react';

export default function UserDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedCrop, setSelectedCrop] = useState('rice');
  
  // Mock data
  const crops = [
    { id: 1, name: 'Rice', variety: 'BG 300', status: 'Recommended', confidence: '92%' },
    { id: 2, name: 'Corn', variety: 'Pioneer 1234', status: 'Suitable', confidence: '78%' },
    { id: 3, name: 'Wheat', variety: 'Triticum A', status: 'Not Recommended', confidence: '35%' },
    { id: 4, name: 'Sugarcane', variety: 'CO-62175', status: 'Recommended', confidence: '87%' },
    { id: 5, name: 'Cotton', variety: 'DCH-32', status: 'Suitable', confidence: '65%' },
  ];
  
  const recentPredictions = [
    { id: 1, crop: 'Rice', variety: 'BG 300', date: '14/07/2025', status: 'Recommended', confidence: '92%' },
    { id: 2, crop: 'Corn', variety: 'Pioneer 1234', date: '10/07/2025', status: 'Suitable', confidence: '78%' },
    { id: 3, crop: 'Wheat', variety: 'Triticum A', date: '05/07/2025', status: 'Not Recommended', confidence: '35%' },
    { id: 4, crop: 'Sugarcane', variety: 'CO-62175', date: '01/07/2025', status: 'Recommended', confidence: '87%' },
  ];
  
  const weatherData = [
    { day: 'Mon', temp: 32, weather: 'Sunny', humidity: '65%', rainfall: '0mm' },
    { day: 'Tue', temp: 30, weather: 'Partly Cloudy', humidity: '70%', rainfall: '0mm' },
    { day: 'Wed', temp: 28, weather: 'Cloudy', humidity: '75%', rainfall: '2mm' },
    { day: 'Thu', temp: 29, weather: 'Partly Cloudy', humidity: '72%', rainfall: '0mm' },
    { day: 'Fri', temp: 31, weather: 'Sunny', humidity: '68%', rainfall: '0mm' },
    { day: 'Sat', temp: 33, weather: 'Sunny', humidity: '63%', rainfall: '0mm' },
    { day: 'Sun', temp: 32, weather: 'Sunny', humidity: '65%', rainfall: '0mm' },
  ];
  
  const cropPrices = [
    { crop: 'Rice', variety: 'BG 300', price: '24.50', change: '+1.2', status: 'up' },
    { crop: 'Corn', variety: 'Pioneer 1234', price: '18.75', change: '-0.5', status: 'down' },
    { crop: 'Wheat', variety: 'Triticum A', price: '22.30', change: '+0.8', status: 'up' },
    { crop: 'Sugarcane', variety: 'CO-62175', price: '12.45', change: '+2.1', status: 'up' },
    { crop: 'Cotton', variety: 'DCH-32', price: '56.20', change: '-1.3', status: 'down' },
  ];
  
  const messages = [
    { id: 1, from: 'Advisor Jane', message: 'Your recent rice prediction looks promising. Consider using the BG 300 variety for your next planting cycle.', time: '2 hours ago', unread: true },
    { id: 2, from: 'System', message: 'New weather alert: Increased rainfall expected next week. Consider adjusting your planting schedule.', time: '5 hours ago', unread: true },
    { id: 3, from: 'Advisor Jane', message: 'The soil analysis results are in. Your field is suitable for rice cultivation.', time: 'Yesterday', unread: false },
  ];
  
  const resources = [
    { id: 1, name: 'Rice Cultivation Guide.pdf', type: 'PDF', size: '2.4 MB', date: '10/07/2025' },
    { id: 2, name: 'Fertilizer Application.pdf', type: 'PDF', size: '1.8 MB', date: '05/07/2025' },
    { id: 3, name: 'Pest Control Methods.pdf', type: 'PDF', size: '3.2 MB', date: '01/07/2025' },
  ];
  
  const fieldData = [
    { id: 1, name: 'Field 1', location: 'Eastern Province', size: '5 acres', crops: ['Rice'], lastPrediction: '14/07/2025' },
    { id: 2, name: 'Field 2', location: 'Eastern Province', size: '3 acres', crops: ['Corn'], lastPrediction: '10/07/2025' },
    { id: 3, name: 'Field 3', location: 'Northern Province', size: '7 acres', crops: ['Wheat', 'Sugarcane'], lastPrediction: '05/07/2025' },
  ];
  
  const cropDetails = {
    rice: {
      name: 'Rice (BG 300)',
      description: 'High-yielding rice variety suitable for tropical and subtropical regions. Resistant to blast and bacterial blight.',
      growingPeriod: '110-120 days',
      optimalTemperature: '20-35°C',
      waterRequirement: 'High',
      soilType: 'Clay or clay loam',
      yield: '5-6 tons/hectare',
      fertilizer: 'N: 100-120 kg/ha, P: 60 kg/ha, K: 60 kg/ha',
      diseases: 'Resistant to blast, moderate resistance to bacterial blight',
      recommendations: [
        'Plant at the onset of rainy season',
        'Maintain water level of 2-5cm during vegetative phase',
        'Apply fertilizer in 3 split doses',
        'Monitor for pests regularly, especially during reproductive phase'
      ]
    },
    corn: {
      name: 'Corn (Pioneer 1234)',
      description: 'High-yielding hybrid corn variety with excellent drought tolerance and disease resistance.',
      growingPeriod: '90-110 days',
      optimalTemperature: '18-32°C',
      waterRequirement: 'Medium',
      soilType: 'Well-drained loamy soil',
      yield: '8-10 tons/hectare',
      fertilizer: 'N: 150-180 kg/ha, P: 80 kg/ha, K: 80 kg/ha',
      diseases: 'Resistant to common rust and southern corn leaf blight',
      recommendations: [
        'Plant when soil temperature reaches 12°C or higher',
        'Space plants 20-25cm apart with 75cm between rows',
        'Apply pre-emergence herbicide to control weeds',
        'Monitor for fall armyworm during early vegetative stages'
      ]
    }
  };
  
  const renderDashboard = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div className="bg-white p-6 rounded-xl shadow-sm col-span-full">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">Welcome to Crop Prediction System</h2>
          <div className="flex space-x-2">
            <button className="bg-blue-50 hover:bg-blue-100 text-blue-600 px-3 py-1 rounded-md text-sm font-medium flex items-center">
              <Download className="w-4 h-4 mr-1" /> Export Reports
            </button>
          </div>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <div className="flex items-center">
          <div className="p-3 rounded-full bg-blue-50 text-blue-600">
            <ThumbsUp className="w-6 h-6" />
          </div>
          <div className="ml-4">
            <h3 className="text-sm font-medium text-gray-500">Recommended Crops</h3>
            <p className="text-2xl font-semibold text-gray-800">2</p>
            <p className="text-xs text-gray-500">Rice, Sugarcane</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <div className="flex items-center">
          <div className="p-3 rounded-full bg-amber-50 text-amber-600">
            <Activity className="w-6 h-6" />
          </div>
          <div className="ml-4">
            <h3 className="text-sm font-medium text-gray-500">Predictions Made</h3>
            <p className="text-2xl font-semibold text-gray-800">12</p>
            <p className="text-xs text-blue-600">Make New Prediction</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <div className="flex items-center">
          <div className="p-3 rounded-full bg-purple-50 text-purple-600">
            <MessageCircle className="w-6 h-6" />
          </div>
          <div className="ml-4">
            <h3 className="text-sm font-medium text-gray-500">Unread Messages</h3>
            <p className="text-2xl font-semibold text-gray-800">2</p>
            <p className="text-xs text-gray-500">Tap to view messages</p>
          </div>
        </div>
      </div>
      
      {/* Weather Forecast */}
      <div className="bg-white p-6 rounded-xl shadow-sm col-span-full">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-800">Weather Forecast</h3>
          <span className="text-sm text-gray-500">Eastern Province</span>
        </div>
        <div className="grid grid-cols-7 gap-4">
          {weatherData.map((day, index) => (
            <div key={index} className={`p-3 rounded-lg border ${index === 0 ? 'bg-blue-50 border-blue-200' : 'border-gray-200'}`}>
              <div className="text-center">
                <p className="text-sm font-medium text-gray-800">{day.day}</p>
                <div className="my-2 flex justify-center">
                  {day.weather === 'Sunny' ? (
                    <div className="text-yellow-500">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <circle cx="12" cy="12" r="5" strokeWidth="2" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                      </svg>
                    </div>
                  ) : day.weather === 'Partly Cloudy' ? (
                    <div className="text-gray-500">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                      </svg>
                    </div>
                  ) : (
                    <div className="text-gray-600">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                      </svg>
                    </div>
                  )}
                </div>
                <p className="text-lg font-semibold text-gray-800">{day.temp}°C</p>
                <div className="mt-2 flex items-center justify-center text-xs text-gray-500">
                  <Droplet className="w-3 h-3 mr-1" />
                  <span>{day.humidity}</span>
                </div>
                <div className="mt-1 flex items-center justify-center text-xs text-gray-500">
                  <Wind className="w-3 h-3 mr-1" />
                  <span>{day.rainfall}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Crop Recommendations */}
      <div className="bg-white p-6 rounded-xl shadow-sm lg:col-span-2">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-800">Crop Recommendations</h3>
          <button className="text-sm text-blue-600 hover:text-blue-800 flex items-center">
            <Plus className="w-4 h-4 mr-1" /> New Prediction
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Crop</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Variety</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Confidence</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {crops.map((crop) => (
                <tr key={crop.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{crop.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{crop.variety}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      crop.status === 'Recommended' ? 'bg-green-100 text-green-800' : 
                      crop.status === 'Suitable' ? 'bg-blue-100 text-blue-800' : 
                      'bg-red-100 text-red-800'
                    }`}>
                      {crop.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{crop.confidence}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-blue-600 hover:text-blue-900" onClick={() => setSelectedCrop(crop.name.toLowerCase())}>View Details</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Recent Messages */}
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-800">Recent Messages</h3>
          <button className="text-sm text-blue-600 hover:text-blue-800">View All</button>
        </div>
        <div className="space-y-4">
          {messages.map((message) => (
            <div key={message.id} className={`p-4 rounded-lg border ${message.unread ? 'border-blue-100 bg-blue-50' : 'border-gray-100'}`}>
              <div className="flex items-start">
                <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold">
                  {message.from === 'System' ? 'S' : message.from.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="ml-3 flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-gray-900">{message.from}</h4>
                    <span className="text-xs text-gray-500">{message.time}</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{message.message}</p>
                  <div className="mt-2 flex justify-end">
                    <button className="text-xs text-blue-600 hover:text-blue-800">Reply</button>
                  </div>
                </div>
                {message.unread && <div className="ml-2 h-2 w-2 bg-blue-500 rounded-full"></div>}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Crop Prices */}
      <div className="bg-white p-6 rounded-xl shadow-sm col-span-full">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-800">Current Crop Prices</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Crop</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Variety</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price ($/kg)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Change</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {cropPrices.map((price, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{price.crop}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{price.variety}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${price.price}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`flex items-center ${price.status === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                      {price.status === 'up' ? '↑' : '↓'} {price.change}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
  
  const renderPredictions = () => (
    <div>
      <div className="bg-white p-6 rounded-xl shadow-sm mb-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">New Prediction</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Field</label>
              <select className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <option value="">Select a field</option>
                {fieldData.map(field => (
                  <option key={field.id} value={field.id}>{field.name} - {field.location}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Crop</label>
              <select className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <option value="">Select a crop</option>
                {crops.map(crop => (
                  <option key={crop.id} value={crop.id}>{crop.name} - {crop.variety}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Soil pH</label>
              <input
                type="number"
                step="0.1"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter soil pH (e.g. 6.5)"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Soil Type</label>
              <select className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <option value="">Select soil type</option>
                <option value="clay">Clay</option>
                <option value="loam">Loam</option>
                <option value="sand">Sandy</option>
                <option value="silt">Silty</option>
                <option value="clay_loam">Clay Loam</option>
              </select>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Expected Planting Date</label>
              <input
                type="date"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nitrogen (N) kg/ha</label>
              <input
                type="number"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter nitrogen value"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phosphorus (P) kg/ha</label>
              <input
                type="number"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter phosphorus value"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Potassium (K) kg/ha</label>
              <input
                type="number"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter potassium value"
              />
            </div>
          </div>
        </div>
        
        <div className="mt-6 flex justify-end">
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium">
            Get Prediction
          </button>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Prediction History</h2>
          <div className="flex space-x-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Search predictions..."
                className="pl-9 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <div className="absolute left-3 top-2.5 text-gray-400">
                <Search className="w-4 h-4" />
              </div>
            </div>
            <button className="bg-blue-50 hover:bg-blue-100 text-blue-600 px-4 py-2 rounded-md text-sm font-medium flex items-center">
              <Download className="w-4 h-4 mr-1" /> Export
            </button>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 mb-4">
          <Filter className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-500">Filter by:</span>
          <select className="border border-gray-300 rounded-md text-sm py-1 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
            <option value="">All Crops</option>
            {crops.map(crop => (
              <option key={crop.id} value={crop.name.toLowerCase()}>{crop.name}</option>
            ))}
          </select>
          <select className="border border-gray-300 rounded-md text-sm py-1 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
            <option value="">All Status</option>
            <option value="recommended">Recommended</option>
            <option value="suitable">Suitable</option>
            <option value="not_recommended">Not Recommended</option>
          </select>
          <input 
            type="date" 
            className="border border-gray-300 rounded-md text-sm py-1 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Crop</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Variety</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Confidence</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentPredictions.map((prediction) => (
                <tr key={prediction.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{prediction.crop}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{prediction.variety}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{prediction.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      prediction.status === 'Recommended' ? 'bg-green-100 text-green-800' : 
                      prediction.status === 'Suitable' ? 'bg-blue-100 text-blue-800' : 
                      'bg-red-100 text-red-800'
                    }`}>
                      {prediction.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{prediction.confidence}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-blue-600 hover:text-blue-900 mr-2">View</button>
                    <button className="text-gray-600 hover:text-gray-900">Share</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Showing <span className="font-medium">1</span> to <span className="font-medium">4</span> of <span className="font-medium">12</span> predictions
          </div>
          <div className="flex space-x-2">
            <button className="border border-gray-300 rounded-md px-3 py-1 text-sm">Previous</button>
            <button className="bg-blue-600 text-white rounded-md px-3 py-1 text-sm">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
  
  const renderFields = () => (
    <div>
      <div className="bg-white p-6 rounded-xl shadow-sm mb-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">My Fields</h2>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center">
            <Plus className="w-4 h-4 mr-1" /> Add New Field
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {fieldData.map(field => (
            <div key={field.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-medium text-gray-800">{field.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">{field.location}</p>
                </div>
                <div className="flex space-x-1">
                  <button className="p-1 text-blue-600 hover:bg-blue-50 rounded">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
                    </svg>
                  </button>
                  <button className="p-1 text-red-600 hover:bg-red-50 rounded">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
                  </button>
                </div>
              </div>
              <div className="mt-4 text-sm text-gray-600">
                <div className="flex justify-between items-center mb-1">
                  <span>Size:</span>
                  <span className="font-medium">{field.size}</span>
                </div>
                <div className="flex justify-between items-center mb-1">
                  <span>Crops:</span>
                  <div className="flex space-x-1">
                    {field.crops.map((crop, idx) => (
                      <span key={idx} className="px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-800">
                        {crop}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span>Last Prediction:</span>
                  <span className="font-medium">{field.lastPrediction}</span>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-gray-100 flex justify-end">
                <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">Add New Field</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Field Name</label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter field name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <select className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <option value="">Select location</option>
                <option value="eastern">Eastern Province</option>
                <option value="western">Western Province</option>
                <option value="northern">Northern Province</option>
                <option value="southern">Southern Province</option>
                <option value="central">Central Province</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Size (acres)</label>
              <input
                type="number"
                step="0.1"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter field size"
              />
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Soil Type</label>
              <select className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <option value="">Select soil type</option>
                <option value="clay">Clay</option>
                <option value="loam">Loam</option>
                <option value="sand">Sandy</option>
                <option value="silt">Silty</option>
                <option value="clay_loam">Clay Loam</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Soil pH</label>
              <input
                type="number"
                step="0.1"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter soil pH (e.g. 6.5)"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Current/Previous Crops</label>
              <div className="border border-gray-300 rounded-md p-3">
                <div className="flex flex-wrap gap-2">
                  {crops.slice(0, 3).map((crop, idx) => (
                    <div key={idx} className="px-2 py-1 bg-gray-100 rounded-md text-xs flex items-center">
                      <span>{crop.name}</span>
                      <button className="ml-1 text-gray-500 hover:text-gray-700">
                        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                      </button>
                    </div>
                  ))}
                  <button className="px-2 py-1 border border-dashed border-gray-300 rounded-md text-xs text-gray-500 hover:text-gray-700 hover:border-gray-500">
                    + Add Crop
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-6 flex justify-end">
          <button className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md text-sm font-medium mr-2">
            Cancel
          </button>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium">
            Save Field
          </button>
        </div>
      </div>
    </div>
  );
  
  const renderMessages = () => (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Messages</h2>
        <div className="flex space-x-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Search messages..."
              className="pl-9 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <div className="absolute left-3 top-2.5 text-gray-400">
              <Search className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex h-[calc(100vh-250px)]">
        <div className="w-1/3 border-r pr-4">
          <div className="mb-4">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium w-full flex items-center justify-center">
              <Plus className="w-4 h-4 mr-1" /> New Message
            </button>
          </div>
          
          <div className="space-y-2">
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Unread</div>
            {messages.filter(m => m.unread).map(message => (
              <div key={message.id} className="p-3 rounded-lg border border-blue-100 bg-blue-50 cursor-pointer">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-gray-900">{message.from}</h4>
                  <span className="text-xs text-gray-500">{message.time}</span>
                </div>
                <p className="text-xs text-gray-600 mt-1 truncate">{message.message}</p>
              </div>
            ))}
            
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mt-4 mb-2">Read</div>
            {messages.filter(m => !m.unread).map(message => (
              <div key={message.id} className="p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-gray-900">{message.from}</h4>
                  <span className="text-xs text-gray-500">{message.time}</span>
                </div>
                <p className="text-xs text-gray-600 mt-1 truncate">{message.message}</p>
              </div>
            ))}
          </div>
        </div>
        
        <div className="w-2/3 pl-4 flex flex-col">
          <div className="border-b pb-4 mb-4">
            <div className="flex items-center">
              <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold">
                AJ
              </div>
              <div className="ml-3">
                <h4 className="text-md font-medium text-gray-900">Advisor Jane</h4>
                <p className="text-xs text-gray-500">2 hours ago</p>
              </div>
            </div>
          </div>
          
          <div className="flex-grow overflow-y-auto mb-4 space-y-4">
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-lg p-3 max-w-[80%]">
                <p className="text-sm text-gray-800">Hello! I've reviewed your recent prediction results. How are you planning to proceed with the planting?</p>
                <span className="text-xs text-gray-500 mt-1 block text-right">10:30 AM</span>
              </div>
            </div>
            
            <div className="flex justify-end">
              <div className="bg-blue-100 rounded-lg p-3 max-w-[80%]">
                <p className="text-sm text-gray-800">Hi Jane, I'm considering the Rice BG 300 variety as it showed the highest confidence. Would you recommend that?</p>
                <span className="text-xs text-gray-500 mt-1 block text-right">10:45 AM</span>
              </div>
            </div>
            
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-lg p-3 max-w-[80%]">
                <p className="text-sm text-gray-800">Your recent rice prediction looks promising. Consider using the BG 300 variety for your next planting cycle. It's well-suited for your soil conditions and the current season.</p>
                <span className="text-xs text-gray-500 mt-1 block text-right">11:15 AM</span>
              </div>
            </div>
          </div>
          
          <div className="border-t pt-4">
            <div className="flex items-center">
              <input
                type="text"
                placeholder="Type your message..."
                className="flex-grow border border-gray-300 rounded-l-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-r-md">
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
  
  const renderResources = () => (
    <div>
      <div className="bg-white p-6 rounded-xl shadow-sm mb-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Resource Library</h2>
          <div className="relative">
            <input
              type="text"
              placeholder="Search resources..."
              className="pl-9 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <div className="absolute left-3 top-2.5 text-gray-400">
              <Search className="w-4 h-4" />
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {resources.map(resource => (
            <div key={resource.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center mb-3">
                <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center mr-3">
                  <FileText className="h-5 w-5 text-red-500" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-800">{resource.name}</h3>
                  <p className="text-xs text-gray-500">{resource.type} • {resource.size}</p>
                </div>
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>Added: {resource.date}</span>
                <button className="text-blue-600 hover:text-blue-800">
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">Crop Information</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-blue-600 p-4">
                <h3 className="text-lg font-medium text-white">{cropDetails[selectedCrop].name}</h3>
              </div>
              <div className="p-6">
                <p className="text-gray-600 mb-6">{cropDetails[selectedCrop].description}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 p-1.5 rounded-md bg-blue-100 text-blue-600">
                      <Clock className="h-5 w-5" />
                    </div>
                    <div className="ml-3">
                      <h4 className="text-sm font-medium text-gray-800">Growing Period</h4>
                      <p className="text-sm text-gray-600">{cropDetails[selectedCrop].growingPeriod}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex-shrink-0 p-1.5 rounded-md bg-blue-100 text-blue-600">
                      <Thermometer className="h-5 w-5" />
                    </div>
                    <div className="ml-3">
                      <h4 className="text-sm font-medium text-gray-800">Optimal Temperature</h4>
                      <p className="text-sm text-gray-600">{cropDetails[selectedCrop].optimalTemperature}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex-shrink-0 p-1.5 rounded-md bg-blue-100 text-blue-600">
                      <Droplet className="h-5 w-5" />
                    </div>
                    <div className="ml-3">
                      <h4 className="text-sm font-medium text-gray-800">Water Requirement</h4>
                      <p className="text-sm text-gray-600">{cropDetails[selectedCrop].waterRequirement}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex-shrink-0 p-1.5 rounded-md bg-blue-100 text-blue-600">
                      <Globe className="h-5 w-5" />
                    </div>
                    <div className="ml-3">
                      <h4 className="text-sm font-medium text-gray-800">Soil Type</h4>
                      <p className="text-sm text-gray-600">{cropDetails[selectedCrop].soilType}</p>
                    </div>
                  </div>
                </div>
                
                <div className="border-t border-gray-200 pt-6">
                  <h4 className="text-md font-medium text-gray-800 mb-3">Recommendations</h4>
                  <ul className="space-y-2">
                    {cropDetails[selectedCrop].recommendations.map((rec, idx) => (
                      <li key={idx} className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-600">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <div className="border border-gray-200 rounded-lg p-4 mb-4">
              <h4 className="text-md font-medium text-gray-800 mb-3">Select Crop</h4>
              <div className="space-y-2">
                {Object.keys(cropDetails).map(crop => (
                  <button 
                    key={crop}
                    className={`w-full py-2 px-3 rounded-md text-left text-sm ${
                      selectedCrop === crop 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    }`}
                    onClick={() => setSelectedCrop(crop)}
                  >
                    {cropDetails[crop].name}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="text-md font-medium text-gray-800 mb-3">Growing Calendar</h4>
              <div className="space-y-3">
                <div className="flex items-center">
                  <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                  <span className="text-sm text-gray-600">Planting</span>
                  <span className="ml-auto text-sm font-medium text-gray-800">July - August</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mr-2"></div>
                  <span className="text-sm text-gray-600">Growing</span>
                  <span className="ml-auto text-sm font-medium text-gray-800">Aug - Oct</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 rounded-full bg-amber-500 mr-2"></div>
                  <span className="text-sm text-gray-600">Harvesting</span>
                  <span className="ml-auto text-sm font-medium text-gray-800">November</span>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center mb-2">
                  <AlertTriangle className="h-5 w-5 text-amber-500 mr-2" />
                  <h5 className="text-sm font-medium text-gray-800">Notes</h5>
                </div>
                <p className="text-xs text-gray-600">
                  Adjust planting dates based on local weather conditions and rainfall patterns. Consult with your advisor for specific recommendations for your region.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
  
  const renderProfile = () => (
    <div>
      <div className="bg-white p-6 rounded-xl shadow-sm mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">Profile Management</h2>
        
        <div className="flex flex-col md:flex-row gap-6">
          <div className="md:w-1/3">
            <div className="bg-gray-50 p-6 rounded-xl flex flex-col items-center">
              <div className="relative mb-4">
                <div className="h-32 w-32 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-4xl font-bold">
                  F
                </div>
                <button className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700">
                  <Camera className="h-4 w-4" />
                </button>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-1">Farmer User</h3>
              <p className="text-gray-500 text-sm mb-4">farmer@example.com</p>
              <div className="w-full border-t border-gray-200 pt-4 mt-2">
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Member Since</span>
                    <span className="font-medium">January 15, 2024</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Last Login</span>
                    <span className="font-medium">Today, 9:30 AM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Account Type</span>
                    <span className="font-medium">Farmer</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="md:w-2/3">
            <div className="bg-white rounded-xl">
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8">
                  <button className="px-1 py-4 text-sm font-medium text-blue-600 border-b-2 border-blue-600">
                    Personal Information
                  </button>
                  <button className="px-1 py-4 text-sm font-medium text-gray-500 hover:text-gray-700 border-b-2 border-transparent">
                    Security
                  </button>
                  <button className="px-1 py-4 text-sm font-medium text-gray-500 hover:text-gray-700 border-b-2 border-transparent">
                    Notifications
                  </button>
                </nav>
              </div>
              
              <div className="p-4">
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                      <input
                        type="text"
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value="Farmer"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                      <input
                        type="text"
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value="User"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                    <input
                      type="email"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value="farmer@example.com"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value="+94 71 234 5678"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                    <textarea
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      rows="3"
                    >123 Farm Road, Eastern Province</textarea>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Language</label>
                    <select className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                      <option value="en">English</option>
                      <option value="si">Sinhala</option>
                      <option value="ta">Tamil</option>
                    </select>
                  </div>
                  
                  <div className="pt-4 flex justify-end">
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium">
                      Save Changes
                    </button>
                  </div>
                </div>
                
                {/* Password Change Section (Hidden by default) */}
                <div className="hidden space-y-6 pt-6 border-t border-gray-200 mt-6">
                  <h3 className="text-lg font-medium text-gray-800">Change Password</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                    <input
                      type="password"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter your current password"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                    <input
                      type="password"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter new password"
                    />
                    <p className="mt-1 text-xs text-gray-500">Must be at least 8 characters with at least one number and one special character.</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                    <input
                      type="password"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Confirm new password"
                    />
                  </div>
                  
                  <div className="pt-4 flex justify-end">
                    <button className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md text-sm font-medium mr-2">
                      Cancel
                    </button>
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium">
                      Update Password
                    </button>
                  </div>
                </div>
                
                {/* Notification Settings Section (Hidden by default) */}
                <div className="hidden space-y-6 pt-6 border-t border-gray-200 mt-6">
                  <h3 className="text-lg font-medium text-gray-800">Notification Preferences</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-gray-700">Email Notifications</h4>
                        <p className="text-xs text-gray-500">Receive updates via email</p>
                      </div>
                      <div className="relative inline-block w-10 mr-2 align-middle select-none">
                        <input type="checkbox" name="toggle-1" id="toggle-1" className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer" defaultChecked />
                        <label htmlFor="toggle-1" className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"></label>
                      </div>
                      <style jsx>{`
                        .toggle-checkbox:checked {
                          right: 0;
                          border-color: #2563eb;
                        }
                        .toggle-checkbox:checked + .toggle-label {
                          background-color: #2563eb;
                        }
                      `}</style>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-gray-700">SMS Notifications</h4>
                        <p className="text-xs text-gray-500">Receive updates via text message</p>
                      </div>
                      <div className="relative inline-block w-10 mr-2 align-middle select-none">
                        <input type="checkbox" name="toggle-2" id="toggle-2" className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer" />
                        <label htmlFor="toggle-2" className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"></label>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-gray-700">Weather Alerts</h4>
                        <p className="text-xs text-gray-500">Receive alerts about weather conditions</p>
                      </div>
                      <div className="relative inline-block w-10 mr-2 align-middle select-none">
                        <input type="checkbox" name="toggle-3" id="toggle-3" className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer" defaultChecked />
                        <label htmlFor="toggle-3" className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"></label>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-gray-700">Price Updates</h4>
                        <p className="text-xs text-gray-500">Receive notifications about crop price changes</p>
                      </div>
                      <div className="relative inline-block w-10 mr-2 align-middle select-none">
                        <input type="checkbox" name="toggle-4" id="toggle-4" className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer" defaultChecked />
                        <label htmlFor="toggle-4" className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"></label>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-gray-700">Advisor Messages</h4>
                        <p className="text-xs text-gray-500">Receive notifications when advisors send messages</p>
                      </div>
                      <div className="relative inline-block w-10 mr-2 align-middle select-none">
                        <input type="checkbox" name="toggle-5" id="toggle-5" className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer" defaultChecked />
                        <label htmlFor="toggle-5" className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"></label>
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-4 flex justify-end">
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium">
                      Save Preferences
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">Account Management</h2>
        
        <div className="space-y-6">
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-start">
              <Lock className="h-5 w-5 text-blue-600 mt-0.5 mr-3" />
              <div>
                <h3 className="text-md font-medium text-gray-800">Change Password</h3>
                <p className="text-sm text-gray-600 mt-1 mb-3">
                  It's a good idea to use a strong password that you don't use elsewhere
                </p>
                <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                  Change Password
                </button>
              </div>
            </div>
          </div>
          
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-start">
              <Bell className="h-5 w-5 text-blue-600 mt-0.5 mr-3" />
              <div>
                <h3 className="text-md font-medium text-gray-800">Notification Settings</h3>
                <p className="text-sm text-gray-600 mt-1 mb-3">
                  Manage how and when you receive notifications from the system
                </p>
                <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                  Update Notification Settings
                </button>
              </div>
            </div>
          </div>
          
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-start">
              <Settings className="h-5 w-5 text-blue-600 mt-0.5 mr-3" />
              <div>
                <h3 className="text-md font-medium text-gray-800">Account Preferences</h3>
                <p className="text-sm text-gray-600 mt-1 mb-3">
                  Adjust language, timezone, and other account preferences
                </p>
                <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                  Manage Preferences
                </button>
              </div>
            </div>
          </div>
          
          <div className="border border-red-100 rounded-lg p-4 bg-red-50">
            <div className="flex items-start">
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 mr-3" />
              <div>
                <h3 className="text-md font-medium text-red-800">Deactivate Account</h3>
                <p className="text-sm text-red-600 mt-1 mb-3">
                  Temporarily disable your account. You can reactivate it at any time.
                </p>
                <button className="text-red-600 hover:text-red-800 text-sm font-medium">
                  Deactivate Account
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
  
  const renderHelp = () => (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Help & Support</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="border border-gray-200 rounded-lg p-6">
          <div className="flex items-start mb-4">
            <HelpCircle className="w-6 h-6 text-blue-600 mr-3" />
            <h3 className="text-lg font-medium text-gray-800">FAQs</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <h4 className="text-md font-medium text-gray-700 mb-1">How do I get a crop prediction?</h4>
              <p className="text-sm text-gray-600">
                Go to the Predictions tab and click "New Prediction". Fill in the required field information and click "Get Prediction" to receive recommendations.
              </p>
            </div>
            
            <div>
              <h4 className="text-md font-medium text-gray-700 mb-1">What do the prediction statuses mean?</h4>
              <p className="text-sm text-gray-600">
                "Recommended" ({'>'}80% confidence) indicates ideal conditions, "Suitable" (60-80%) means acceptable conditions, "Not Recommended" ({'<'}60%) suggests finding alternatives.
              </p>
            </div>
            
            <div>
              <h4 className="text-md font-medium text-gray-700 mb-1">How do I contact my advisor?</h4>
              <p className="text-sm text-gray-600">
                Use the Messages tab to send a direct message to your assigned advisor for personalized support and advice.
              </p>
            </div>
            
            <button className="mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium">
              View All FAQs
            </button>
          </div>
        </div>
        
        <div className="border border-gray-200 rounded-lg p-6">
          <div className="flex items-start mb-4">
            <MessageCircle className="w-6 h-6 text-blue-600 mr-3" />
            <h3 className="text-lg font-medium text-gray-800">Contact Support</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
              <select className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <option value="">Select a topic</option>
                <option value="account">Account Issues</option>
                <option value="prediction">Prediction Questions</option>
                <option value="technical">Technical Problems</option>
                <option value="other">Other</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
              <textarea
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows="4"
                placeholder="Describe your issue or question"
              ></textarea>
            </div>
            
            <div className="flex justify-end">
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium">
                Submit Request
              </button>
            </div>
          </div>
        </div>
        
        <div className="border border-gray-200 rounded-lg p-6">
          <div className="flex items-start mb-4">
            <Info className="w-6 h-6 text-blue-600 mr-3" />
            <h3 className="text-lg font-medium text-gray-800">Quick Tips</h3>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-start">
              <div className="flex-shrink-0 h-5 w-5 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-xs">
                1
              </div>
              <p className="ml-2 text-sm text-gray-600">
                Keep your field information up-to-date for accurate predictions
              </p>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0 h-5 w-5 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-xs">
                2
              </div>
              <p className="ml-2 text-sm text-gray-600">
                Check weather forecasts regularly to plan farming activities
              </p>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0 h-5 w-5 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-xs">
                3
              </div>
              <p className="ml-2 text-sm text-gray-600">
                Review resources for best practices on crop cultivation
              </p>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0 h-5 w-5 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-xs">
                4
              </div>
              <p className="ml-2 text-sm text-gray-600">
                Consult with your advisor before making major farming decisions
              </p>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0 h-5 w-5 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-xs">
                5
              </div>
              <p className="ml-2 text-sm text-gray-600">
                Export prediction reports to share with family or farming partners
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-800 mb-4">Video Tutorials</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="h-40 bg-gray-100 flex items-center justify-center">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <div className="p-3">
              <h4 className="text-sm font-medium text-gray-800">Getting Started Guide</h4>
              <p className="text-xs text-gray-500 mt-1">3:45 mins</p>
            </div>
          </div>
          
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="h-40 bg-gray-100 flex items-center justify-center">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <div className="p-3">
              <h4 className="text-sm font-medium text-gray-800">How to Get Crop Predictions</h4>
              <p className="text-xs text-gray-500 mt-1">5:12 mins</p>
            </div>
          </div>
          
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="h-40 bg-gray-100 flex items-center justify-center">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <div className="p-3">
              <h4 className="text-sm font-medium text-gray-800">Managing Your Fields</h4>
              <p className="text-xs text-gray-500 mt-1">4:30 mins</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
  
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-blue-800 text-white z-10 shadow-lg transform transition-transform duration-300 ease-in-out">
        <div className="flex items-center justify-center h-16 border-b border-blue-700">
          <h1 className="text-xl font-bold">Crop Prediction</h1>
        </div>
        <div className="p-4">
          <div className="flex items-center space-x-2 mb-6">
            <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
              U
            </div>
            <div>
              <h2 className="text-sm font-medium">Farmer User</h2>
              <p className="text-xs text-blue-300">farmer@example.com</p>
            </div>
          </div>
          
          <nav className="space-y-1">
            <button
              className={`flex items-center space-x-3 w-full px-4 py-2.5 rounded-lg ${
                activeTab === 'dashboard' ? 'bg-blue-700' : 'hover:bg-blue-700'
              }`}
              onClick={() => setActiveTab('dashboard')}
            >
              <Home className="w-5 h-5" />
              <span>Dashboard</span>
            </button>
            
            <button
              className={`flex items-center space-x-3 w-full px-4 py-2.5 rounded-lg ${
                activeTab === 'predictions' ? 'bg-blue-700' : 'hover:bg-blue-700'
              }`}
              onClick={() => setActiveTab('predictions')}
            >
              <BarChart2 className="w-5 h-5" />
              <span>Predictions</span>
            </button>
            
            <button
              className={`flex items-center space-x-3 w-full px-4 py-2.5 rounded-lg ${
                activeTab === 'fields' ? 'bg-blue-700' : 'hover:bg-blue-700'
              }`}
              onClick={() => setActiveTab('fields')}
            >
              <Map className="w-5 h-5" />
              <span>My Fields</span>
            </button>
            
            <button
              className={`flex items-center space-x-3 w-full px-4 py-2.5 rounded-lg ${
                activeTab === 'messages' ? 'bg-blue-700' : 'hover:bg-blue-700'
              }`}
              onClick={() => setActiveTab('messages')}
            >
              <MessageCircle className="w-5 h-5" />
              <span>Messages</span>
              {messages.filter(m => m.unread).length > 0 && (
                <span className="ml-auto bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {messages.filter(m => m.unread).length}
                </span>
              )}
            </button>
            
            <button
              className={`flex items-center space-x-3 w-full px-4 py-2.5 rounded-lg ${
                activeTab === 'resources' ? 'bg-blue-700' : 'hover:bg-blue-700'
              }`}
              onClick={() => setActiveTab('resources')}
            >
              <FileText className="w-5 h-5" />
              <span>Resources</span>
            </button>
            
            <button
              className={`flex items-center space-x-3 w-full px-4 py-2.5 rounded-lg ${
                activeTab === 'profile' ? 'bg-blue-700' : 'hover:bg-blue-700'
              }`}
              onClick={() => setActiveTab('profile')}
            >
              <User className="w-5 h-5" />
              <span>Profile</span>
            </button>
            
            <button
              className={`flex items-center space-x-3 w-full px-4 py-2.5 rounded-lg ${
                activeTab === 'help' ? 'bg-blue-700' : 'hover:bg-blue-700'
              }`}
              onClick={() => setActiveTab('help')}
            >
              <HelpCircle className="w-5 h-5" />
              <span>Help & Support</span>
            </button>
          </nav>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <button className="flex items-center space-x-3 w-full px-4 py-2.5 rounded-lg hover:bg-blue-700 text-blue-200">
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="ml-64 p-6">
        <div className="mb-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800">
              {activeTab === 'dashboard' && 'Dashboard'}
              {activeTab === 'predictions' && 'Crop Predictions'}
              {activeTab === 'fields' && 'My Fields'}
              {activeTab === 'messages' && 'Messages'}
              {activeTab === 'resources' && 'Resources'}
              {activeTab === 'profile' && 'Profile'}
              {activeTab === 'help' && 'Help & Support'}
            </h1>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-9 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <div className="absolute left-3 top-2.5 text-gray-400">
                  <Search className="w-4 h-4" />
                </div>
              </div>
              <button className="relative p-2 text-gray-400 hover:text-gray-500">
                {messages.filter(m => m.unread).length > 0 && (
                  <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
                )}
                <span className="sr-only">Notifications</span>
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </button>
            </div>
          </div>
        </div>
        
        {/* Content based on active tab */}
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'predictions' && renderPredictions()}
        {activeTab === 'fields' && renderFields()}
        {activeTab === 'messages' && renderMessages()}
        {activeTab === 'resources' && renderResources()}
        {activeTab === 'profile' && renderProfile()}
        {activeTab === 'help' && renderHelp()}
      </div>
    </div>
  );
}
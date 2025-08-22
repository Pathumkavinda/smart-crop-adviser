"use client"

import { useState } from 'react';
import { 
  BarChart, 
  LineChart, 
  PieChart, 
  AreaChart, 
  Area,
  Pie, 
  Cell, 
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceArea,
  ReferenceLine,
  Label,
  Brush
} from 'recharts';
import { 
  Search, 
  Users, 
  Book, 
  FileText, 
  BarChart2, 
  Home, 
  Settings, 
  LogOut, 
  Plus, 
  Database, 
  Edit, 
  Trash2, 
  ArrowDown, 
  ArrowUp, 
  Filter, 
  Download, 
  Upload 
} from 'lucide-react';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [expandedSection, setExpandedSection] = useState('predictions');
  
  // Mock data
  const crops = ['Rice', 'Corn', 'Wheat', 'Sugarcane', 'Cotton'];
  const recentPredictions = [
    { id: 1, user: 'John Doe', crop: 'Rice', variety: 'BG 300', status: 'Success', date: '14/07/2025', accuracy: '89%' },
    { id: 2, user: 'Jane Smith', crop: 'Corn', variety: 'Pioneer 1234', status: 'Success', date: '13/07/2025', accuracy: '92%' },
    { id: 3, user: 'Robert Brown', crop: 'Wheat', variety: 'Triticum A', status: 'Success', date: '12/07/2025', accuracy: '87%' },
    { id: 4, user: 'Emily Wilson', crop: 'Sugarcane', variety: 'CO-62175', status: 'Failed', date: '11/07/2025', accuracy: '0%' },
  ];
  
  const userStats = [
    { name: 'Farmers', value: 1250, color: '#8884d8' },
    { name: 'Advisors', value: 150, color: '#82ca9d' },
    { name: 'Admins', value: 25, color: '#ffc658' },
  ];
  
  const predictionData = [
    { name: 'Rice', predictions: 450, color: '#8884d8' },
    { name: 'Corn', predictions: 320, color: '#82ca9d' },
    { name: 'Wheat', predictions: 280, color: '#ffc658' },
    { name: 'Sugarcane', predictions: 210, color: '#ff8042' },
    { name: 'Cotton', predictions: 190, color: '#0088fe' },
  ];

  // Extended data for the last 12 months
  const monthlyPredictions = [
    { name: 'Aug', count: 145, successful: 112, failed: 33, rice: 65, corn: 35, wheat: 20, sugarcane: 15, cotton: 10 },
    { name: 'Sep', count: 178, successful: 143, failed: 35, rice: 80, corn: 42, wheat: 25, sugarcane: 18, cotton: 13 },
    { name: 'Oct', count: 213, successful: 175, failed: 38, rice: 95, corn: 53, wheat: 32, sugarcane: 20, cotton: 13 },
    { name: 'Nov', count: 232, successful: 186, failed: 46, rice: 105, corn: 58, wheat: 36, sugarcane: 22, cotton: 11 },
    { name: 'Dec', count: 198, successful: 158, failed: 40, rice: 90, corn: 50, wheat: 28, sugarcane: 18, cotton: 12 },
    { name: 'Jan', count: 125, successful: 95, failed: 30, rice: 55, corn: 32, wheat: 18, sugarcane: 12, cotton: 8 },
    { name: 'Feb', count: 156, successful: 125, failed: 31, rice: 68, corn: 42, wheat: 23, sugarcane: 15, cotton: 8 },
    { name: 'Mar', count: 189, successful: 160, failed: 29, rice: 82, corn: 48, wheat: 29, sugarcane: 18, cotton: 12 },
    { name: 'Apr', count: 215, successful: 180, failed: 35, rice: 98, corn: 54, wheat: 32, sugarcane: 20, cotton: 11 },
    { name: 'May', count: 253, successful: 215, failed: 38, rice: 115, corn: 62, wheat: 38, sugarcane: 24, cotton: 14 },
    { name: 'Jun', count: 278, successful: 240, failed: 38, rice: 128, corn: 72, wheat: 42, sugarcane: 22, cotton: 14 },
    { name: 'Jul', count: 162, successful: 135, failed: 27, rice: 72, corn: 40, wheat: 26, sugarcane: 15, cotton: 9 }
  ];
  
  const cropPrices = [
    { crop: 'Rice', variety: 'BG 300', price: '24.50', change: '+1.2', status: 'up' },
    { crop: 'Corn', variety: 'Pioneer 1234', price: '18.75', change: '-0.5', status: 'down' },
    { crop: 'Wheat', variety: 'Triticum A', price: '22.30', change: '+0.8', status: 'up' },
    { crop: 'Sugarcane', variety: 'CO-62175', price: '12.45', change: '+2.1', status: 'up' },
    { crop: 'Cotton', variety: 'DCH-32', price: '56.20', change: '-1.3', status: 'down' },
  ];
  
  const users = [
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Farmer', predictions: 24, status: 'Active' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'Advisor', predictions: 0, status: 'Active' },
    { id: 3, name: 'Robert Brown', email: 'robert@example.com', role: 'Farmer', predictions: 15, status: 'Inactive' },
    { id: 4, name: 'Emily Wilson', email: 'emily@example.com', role: 'Farmer', predictions: 32, status: 'Active' },
    { id: 5, name: 'Michael Lee', email: 'michael@example.com', role: 'Admin', predictions: 0, status: 'Active' },
  ];
  
  const resources = [
    { id: 1, name: 'Crop Cultivation Guide 2025.pdf', type: 'PDF', size: '2.4 MB', uploaded: '10/07/2025' },
    { id: 2, name: 'Agro-Ecological Zones Map.jpg', type: 'Image', size: '1.8 MB', uploaded: '05/07/2025' },
    { id: 3, name: 'Fertilizer Application Instructions.docx', type: 'Document', size: '890 KB', uploaded: '02/07/2025' },
    { id: 4, name: 'Weather Forecast Report - July 2025.pdf', type: 'PDF', size: '1.2 MB', uploaded: '01/07/2025' },
  ];
  
  // Chart filter states
  const [activeFilter, setActiveFilter] = useState('all');
  const [showPredictionTypes, setShowPredictionTypes] = useState(false);
  const [showCropBreakdown, setShowCropBreakdown] = useState(false);
  
  const toggleSection = (section) => {
    if (expandedSection === section) {
      setExpandedSection(null);
    } else {
      setExpandedSection(section);
    }
  };
  
  // Custom tooltip for the chart
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 shadow-md rounded-md">
          <p className="text-sm font-semibold text-gray-700">{label}</p>
          <div className="mt-1">
            {payload.map((entry, index) => (
              <p key={index} className="text-xs" style={{ color: entry.color }}>
                {entry.name}: {entry.value}
              </p>
            ))}
          </div>
          {showPredictionTypes && payload.find(p => p.name === "Total") && (
            <div className="mt-1 pt-1 border-t border-gray-200">
              <p className="text-xs text-green-600">
                Success Rate: {Math.round((payload.find(p => p.name === "Successful").value / payload.find(p => p.name === "Total").value) * 100)}%
              </p>
            </div>
          )}
        </div>
      );
    }
    return null;
  };
  
  // Calculate monthly average
  const averagePredictions = Math.round(monthlyPredictions.reduce((sum, item) => sum + item.count, 0) / monthlyPredictions.length);
  
  // Find min and max values
  const maxCount = Math.max(...monthlyPredictions.map(item => item.count));
  const minCount = Math.min(...monthlyPredictions.map(item => item.count));
  
  // Calculate trend: compare last 3 months average with previous 3 months
  const last3MonthsAvg = monthlyPredictions.slice(-3).reduce((sum, item) => sum + item.count, 0) / 3;
  const previous3MonthsAvg = monthlyPredictions.slice(-6, -3).reduce((sum, item) => sum + item.count, 0) / 3;
  const trendPercentage = ((last3MonthsAvg - previous3MonthsAvg) / previous3MonthsAvg) * 100;
  
  const renderDashboard = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div className="bg-white p-6 rounded-xl shadow-sm col-span-full">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">Welcome to Admin Dashboard</h2>
          <div className="flex space-x-2">
            <button className="bg-indigo-50 hover:bg-indigo-100 text-indigo-600 px-3 py-1 rounded-md text-sm font-medium flex items-center">
              <Download className="w-4 h-4 mr-1" /> Export
            </button>
            <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded-md text-sm font-medium flex items-center">
              <Upload className="w-4 h-4 mr-1" /> Update ML Model
            </button>
          </div>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <div className="flex items-center">
          <div className="p-3 rounded-full bg-blue-50 text-blue-600">
            <Users className="w-6 h-6" />
          </div>
          <div className="ml-4">
            <h3 className="text-sm font-medium text-gray-500">Total Users</h3>
            <p className="text-2xl font-semibold text-gray-800">1,425</p>
            <p className="text-xs text-green-600">+3.2% from last month</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <div className="flex items-center">
          <div className="p-3 rounded-full bg-green-50 text-green-600">
            <BarChart2 className="w-6 h-6" />
          </div>
          <div className="ml-4">
            <h3 className="text-sm font-medium text-gray-500">Predictions (This Month)</h3>
            <p className="text-2xl font-semibold text-gray-800">162</p>
            <p className="text-xs text-red-600">-41.7% from last month</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <div className="flex items-center">
          <div className="p-3 rounded-full bg-purple-50 text-purple-600">
            <Database className="w-6 h-6" />
          </div>
          <div className="ml-4">
            <h3 className="text-sm font-medium text-gray-500">Supported Crops</h3>
            <p className="text-2xl font-semibold text-gray-800">5</p>
            <p className="text-xs text-gray-500">Rice, Corn, Wheat, Sugarcane, Cotton</p>
          </div>
        </div>
      </div>
      
      {/* Enhanced Monthly Predictions Chart */}
      <div className="bg-white p-6 rounded-xl shadow-sm lg:col-span-2">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-800">Monthly Predictions</h3>
          <div className="flex space-x-2 text-sm">
            <button 
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1 rounded-md ${activeFilter === 'all' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700'}`}
            >
              All Time
            </button>
            <button 
              onClick={() => setActiveFilter('6months')}
              className={`px-3 py-1 rounded-md ${activeFilter === '6months' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700'}`}
            >
              6 Months
            </button>
            <button 
              onClick={() => setActiveFilter('3months')}
              className={`px-3 py-1 rounded-md ${activeFilter === '3months' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700'}`}
            >
              3 Months
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="text-sm text-gray-500">Average/Month</div>
            <div className="text-xl font-semibold text-gray-800">{averagePredictions}</div>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="text-sm text-gray-500">3-Month Trend</div>
            <div className={`text-xl font-semibold ${trendPercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {trendPercentage >= 0 ? '+' : ''}{trendPercentage.toFixed(1)}%
            </div>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="text-sm text-gray-500">Highest Month</div>
            <div className="text-xl font-semibold text-gray-800">{maxCount} (Jun)</div>
          </div>
        </div>
        
        <div className="flex space-x-4 mb-4">
          <div className="flex items-center">
            <input 
              type="checkbox" 
              id="show-types" 
              className="mr-2"
              checked={showPredictionTypes}
              onChange={() => setShowPredictionTypes(!showPredictionTypes)}
            />
            <label htmlFor="show-types" className="text-sm text-gray-600">Show Success/Failure</label>
          </div>
          <div className="flex items-center">
            <input 
              type="checkbox" 
              id="show-crops" 
              className="mr-2"
              checked={showCropBreakdown}
              onChange={() => setShowCropBreakdown(!showCropBreakdown)}
            />
            <label htmlFor="show-crops" className="text-sm text-gray-600">Show Crop Breakdown</label>
          </div>
        </div>
        
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={monthlyPredictions.slice(activeFilter === '3months' ? -3 : activeFilter === '6months' ? -6 : 0)}
              margin={{ top: 10, right: 30, left: 10, bottom: 30 }}
            >
              <defs>
                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#8884d8" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="colorSuccess" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4ade80" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#4ade80" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="colorFailed" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f87171" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#f87171" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="colorRice" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#8884d8" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="colorCorn" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#82ca9d" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="colorWheat" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ffc658" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#ffc658" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="colorSugarcane" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ff8042" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#ff8042" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="colorCotton" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0088fe" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#0088fe" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              
              <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
              <XAxis 
                dataKey="name" 
                tick={{fontSize: 12}} 
                tickMargin={10}
              >
                <Label value="Month" position="insideBottom" offset={-15} />
              </XAxis>
              <YAxis 
                tick={{fontSize: 12}}
                tickMargin={10}
              >
                <Label value="Predictions" angle={-90} position="insideLeft" style={{ textAnchor: 'middle' }} />
              </YAxis>
              
              <Tooltip content={<CustomTooltip />} />
              <Legend verticalAlign="top" height={36} />
              
              {/* Reference line for average */}
              <ReferenceLine 
                y={averagePredictions} 
                stroke="#666" 
                strokeDasharray="3 3"
                isFront={false}
              >
                <Label 
                  value="Average" 
                  position="insideBottomRight" 
                  fill="#666" 
                  fontSize={10}
                />
              </ReferenceLine>
              
              {/* Highlight current month */}
              <ReferenceArea 
                x1="Jun" 
                x2="Jul" 
                fill="#8884d8" 
                fillOpacity={0.1} 
              />
              
              {showPredictionTypes ? (
                <>
                  <Area 
                    type="monotone" 
                    dataKey="count" 
                    name="Total" 
                    stroke="#8884d8" 
                    fillOpacity={0} 
                    strokeWidth={2} 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="successful" 
                    name="Successful" 
                    stroke="#4ade80" 
                    fill="url(#colorSuccess)" 
                    strokeWidth={1.5} 
                    stackId="1"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="failed" 
                    name="Failed" 
                    stroke="#f87171" 
                    fill="url(#colorFailed)" 
                    strokeWidth={1.5} 
                    stackId="1"
                  />
                </>
              ) : showCropBreakdown ? (
                <>
                  <Area 
                    type="monotone" 
                    dataKey="rice" 
                    name="Rice" 
                    stroke="#8884d8" 
                    fill="url(#colorRice)" 
                    stackId="2"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="corn" 
                    name="Corn" 
                    stroke="#82ca9d" 
                    fill="url(#colorCorn)" 
                    stackId="2"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="wheat" 
                    name="Wheat" 
                    stroke="#ffc658" 
                    fill="url(#colorWheat)" 
                    stackId="2"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="sugarcane" 
                    name="Sugarcane" 
                    stroke="#ff8042" 
                    fill="url(#colorSugarcane)" 
                    stackId="2"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="cotton" 
                    name="Cotton" 
                    stroke="#0088fe" 
                    fill="url(#colorCotton)" 
                    stackId="2"
                  />
                </>
              ) : (
                <Area 
                  type="monotone" 
                  dataKey="count" 
                  name="Predictions" 
                  stroke="#8884d8" 
                  fill="url(#colorCount)" 
                  strokeWidth={2}
                />
              )}
              
              <Brush 
                dataKey="name" 
                height={20} 
                stroke="#8884d8" 
                startIndex={activeFilter === '3months' ? 0 : activeFilter === '6months' ? 0 : 6}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        
        <div className="mt-4 text-xs text-gray-500 flex justify-between items-center">
          <div>Last 12 months of prediction data</div>
          <button className="text-indigo-600 hover:text-indigo-800 text-sm">View Detailed Reports →</button>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <h3 className="text-lg font-medium text-gray-800 mb-4">Users by Role</h3>
        <div className="h-64 flex justify-center items-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={userStats}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {userStats.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle">
                <tspan x="50%" dy="-10" fontSize="12" fill="#666">Total Users</tspan>
                <tspan x="50%" dy="25" fontSize="18" fontWeight="bold" fill="#333">1,425</tspan>
              </text>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* Recent Predictions */}
      <div className="bg-white p-6 rounded-xl shadow-sm col-span-full">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-800">Recent Predictions</h3>
          <button className="text-sm text-indigo-600 hover:text-indigo-800">View All</button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Crop</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Variety</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Accuracy</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentPredictions.map((prediction) => (
                <tr key={prediction.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{prediction.user}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{prediction.crop}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{prediction.variety}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      prediction.status === 'Success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {prediction.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{prediction.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{prediction.accuracy}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Crop Prices */}
      <div className="bg-white p-6 rounded-xl shadow-sm col-span-full">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-800">Current Crop Prices</h3>
          <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded-md text-sm font-medium flex items-center">
            <Plus className="w-4 h-4 mr-1" /> Add Price
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Crop</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Variety</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price ($/kg)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Change</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
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
                      {price.status === 'up' ? <ArrowUp className="w-4 h-4 mr-1" /> : <ArrowDown className="w-4 h-4 mr-1" />}
                      {price.change}%
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button className="text-indigo-600 hover:text-indigo-900">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="text-red-600 hover:text-red-900">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
  
  const renderUsers = () => (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">User Management</h2>
        <div className="flex space-x-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Search users..."
              className="pl-9 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            <div className="absolute left-3 top-2.5 text-gray-400">
              <Search className="w-4 h-4" />
            </div>
          </div>
          <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center">
            <Plus className="w-4 h-4 mr-1" /> Add User
          </button>
        </div>
      </div>
      
      <div className="flex items-center space-x-2 mb-4">
        <Filter className="w-4 h-4 text-gray-500" />
        <span className="text-sm text-gray-500">Filter by:</span>
        <select className="border border-gray-300 rounded-md text-sm py-1 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
          <option value="">All Roles</option>
          <option value="farmer">Farmer</option>
          <option value="advisor">Advisor</option>
          <option value="admin">Admin</option>
        </select>
        <select className="border border-gray-300 rounded-md text-sm py-1 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Predictions</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-semibold">
                      {user.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{user.name}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    user.role === 'Admin' ? 'bg-purple-100 text-purple-800' : 
                    user.role === 'Advisor' ? 'bg-blue-100 text-blue-800' : 
                    'bg-green-100 text-green-800'
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.predictions}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    user.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {user.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button className="text-indigo-600 hover:text-indigo-900">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button className="text-red-600 hover:text-red-900">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm text-gray-500">
          Showing <span className="font-medium">1</span> to <span className="font-medium">5</span> of <span className="font-medium">1,425</span> users
        </div>
        <div className="flex space-x-2">
          <button className="border border-gray-300 rounded-md px-3 py-1 text-sm">Previous</button>
          <button className="bg-indigo-600 text-white rounded-md px-3 py-1 text-sm">Next</button>
        </div>
      </div>
    </div>
  );
  
  const renderPredictions = () => (
    <div>
      <div className="bg-white p-6 rounded-xl shadow-sm mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">Prediction Analytics</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 border border-gray-200 rounded-lg">
            <h3 className="text-lg font-medium text-gray-800 mb-3">Predictions by Crop</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={predictionData}>
                  {predictionData.map((entry, index) => (
                    <rect 
                      key={`rect-${index}`}
                      x={45 + index * 80} 
                      y={50 + index * 20} 
                      width={40} 
                      height={175 - index * 25} 
                      fill={entry.color} 
                      rx={4} 
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="p-4 border border-gray-200 rounded-lg">
            <h3 className="text-lg font-medium text-gray-800 mb-3">Prediction Success Rate</h3>
            <div className="h-64 flex justify-center items-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Success', value: 75, color: '#4ade80' },
                      { name: 'Failed', value: 25, color: '#f87171' }
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={0}
                    outerRadius={80}
                    dataKey="value"
                  >
                    {[
                      { name: 'Success', value: 75, color: '#4ade80' },
                      { name: 'Failed', value: 25, color: '#f87171' }
                    ].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle">
                    <tspan x="50%" dy="-10" fontSize="14" fill="#666">Success Rate</tspan>
                    <tspan x="50%" dy="25" fontSize="24" fontWeight="bold" fill="#333">75%</tspan>
                  </text>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
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
                className="pl-9 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
              <div className="absolute left-3 top-2.5 text-gray-400">
                <Search className="w-4 h-4" />
              </div>
            </div>
            <button className="bg-indigo-50 hover:bg-indigo-100 text-indigo-600 px-4 py-2 rounded-md text-sm font-medium flex items-center">
              <Download className="w-4 h-4 mr-1" /> Export
            </button>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 mb-4">
          <Filter className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-500">Filter by:</span>
          <select className="border border-gray-300 rounded-md text-sm py-1 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
            <option value="">All Crops</option>
            <option value="rice">Rice</option>
            <option value="corn">Corn</option>
            <option value="wheat">Wheat</option>
            <option value="sugarcane">Sugarcane</option>
            <option value="cotton">Cotton</option>
          </select>
          <select className="border border-gray-300 rounded-md text-sm py-1 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
            <option value="">All Status</option>
            <option value="success">Success</option>
            <option value="failed">Failed</option>
          </select>
          <input 
            type="date" 
            className="border border-gray-300 rounded-md text-sm py-1 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Crop</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Variety</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Accuracy</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentPredictions.map((prediction) => (
                <tr key={prediction.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">#{prediction.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{prediction.user}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{prediction.crop}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{prediction.variety}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      prediction.status === 'Success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {prediction.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{prediction.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{prediction.accuracy}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button className="text-indigo-600 hover:text-indigo-900">View</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Showing <span className="font-medium">1</span> to <span className="font-medium">4</span> of <span className="font-medium">1,450</span> predictions
          </div>
          <div className="flex space-x-2">
            <button className="border border-gray-300 rounded-md px-3 py-1 text-sm">Previous</button>
            <button className="bg-indigo-600 text-white rounded-md px-3 py-1 text-sm">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
  
  const renderCrops = () => (
    <div>
      <div className="bg-white p-6 rounded-xl shadow-sm mb-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Crop Management</h2>
          <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center">
            <Plus className="w-4 h-4 mr-1" /> Add New Crop
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {crops.map((crop, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-medium text-gray-800">{crop}</h3>
                  <p className="text-sm text-gray-500 mt-1">Multiple varieties available</p>
                </div>
                <div className="flex space-x-1">
                  <button className="p-1 text-indigo-600 hover:bg-indigo-50 rounded">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button className="p-1 text-red-600 hover:bg-red-50 rounded">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="mt-4 text-sm text-gray-600">
                <div className="flex justify-between items-center mb-1">
                  <span>Prediction Success Rate:</span>
                  <span className="font-medium">82%</span>
                </div>
                <div className="flex justify-between items-center mb-1">
                  <span>Total Predictions:</span>
                  <span className="font-medium">{predictionData.find(p => p.name === crop)?.predictions || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Current Price:</span>
                  <span className="font-medium">${cropPrices.find(p => p.crop === crop)?.price || '0.00'}</span>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-gray-100 flex justify-end">
                <button className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">ML Model Management</h2>
        
        <div className="border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-medium text-gray-800">Current ML Model</h3>
              <p className="text-sm text-gray-500">Version 2.4.1 - Last updated on 01/07/2025</p>
            </div>
            <div className="flex space-x-2">
              <button className="bg-indigo-50 hover:bg-indigo-100 text-indigo-600 px-4 py-2 rounded-md text-sm font-medium flex items-center">
                <Download className="w-4 h-4 mr-1" /> Export Model
              </button>
              <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center">
                <Upload className="w-4 h-4 mr-1" /> Update Model
              </button>
            </div>
          </div>
          
          <div className="mt-4 bg-gray-50 rounded-lg p-4">
            <h4 className="text-md font-medium text-gray-700 mb-2">Model Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Algorithm:</span>
                  <span className="text-sm font-medium">Random Forest Classifier</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Training Accuracy:</span>
                  <span className="text-sm font-medium">87.5%</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Validation Accuracy:</span>
                  <span className="text-sm font-medium">84.2%</span>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Supported Crops:</span>
                  <span className="text-sm font-medium">{crops.join(", ")}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Training Dataset Size:</span>
                  <span className="text-sm font-medium">8,104 records</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Last Re-training:</span>
                  <span className="text-sm font-medium">01/07/2025</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6">
            <h4 className="text-md font-medium text-gray-700 mb-2">Model Performance</h4>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Crop</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precision</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recall</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">F1 Score</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {crops.map((crop, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{crop}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{(0.8 + Math.random() * 0.15).toFixed(2)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{(0.75 + Math.random() * 0.2).toFixed(2)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{(0.78 + Math.random() * 0.17).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
  
  const renderResources = () => (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Resource Management</h2>
        <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center">
          <Plus className="w-4 h-4 mr-1" /> Upload Resource
        </button>
      </div>
      
      <div className="flex items-center space-x-2 mb-4">
        <Filter className="w-4 h-4 text-gray-500" />
        <span className="text-sm text-gray-500">Filter by:</span>
        <select className="border border-gray-300 rounded-md text-sm py-1 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
          <option value="">All Types</option>
          <option value="pdf">PDF</option>
          <option value="document">Document</option>
          <option value="image">Image</option>
        </select>
        <div className="relative ml-auto">
          <input
            type="text"
            placeholder="Search resources..."
            className="pl-9 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
          <div className="absolute left-3 top-2.5 text-gray-400">
            <Search className="w-4 h-4" />
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Uploaded On</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {resources.map((resource) => (
              <tr key={resource.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      {resource.type === 'PDF' ? (
                        <FileText className="h-5 w-5 text-red-500" />
                      ) : resource.type === 'Image' ? (
                        <FileText className="h-5 w-5 text-blue-500" />
                      ) : (
                        <FileText className="h-5 w-5 text-green-500" />
                      )}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{resource.name}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{resource.type}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{resource.size}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{resource.uploaded}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button className="text-indigo-600 hover:text-indigo-900">View</button>
                    <button className="text-indigo-600 hover:text-indigo-900">
                      <Download className="w-4 h-4" />
                    </button>
                    <button className="text-red-600 hover:text-red-900">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm text-gray-500">
          Showing <span className="font-medium">1</span> to <span className="font-medium">4</span> of <span className="font-medium">24</span> resources
        </div>
        <div className="flex space-x-2">
          <button className="border border-gray-300 rounded-md px-3 py-1 text-sm">Previous</button>
          <button className="bg-indigo-600 text-white rounded-md px-3 py-1 text-sm">Next</button>
        </div>
      </div>
    </div>
  );
  
  const renderSettings = () => (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">System Settings</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border border-gray-200 rounded-lg p-4">
          <h3 className="text-lg font-medium text-gray-800 mb-3">General Settings</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">System Name</label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                value="Crop Prediction System"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">System Logo</label>
              <div className="flex items-center">
                <div className="h-12 w-12 bg-gray-100 rounded-md flex items-center justify-center mr-3">
                  <FileText className="h-6 w-6 text-gray-400" />
                </div>
                <button className="bg-indigo-50 hover:bg-indigo-100 text-indigo-600 px-3 py-1 rounded-md text-sm font-medium">
                  Change
                </button>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Default Language</label>
              <select className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                <option value="en">English</option>
                <option value="fr">French</option>
                <option value="es">Spanish</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Default Currency</label>
              <select className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                <option value="usd">USD ($)</option>
                <option value="eur">EUR (€)</option>
                <option value="gbp">GBP (£)</option>
              </select>
            </div>
            
            <div className="flex justify-end">
              <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium">
                Save Changes
              </button>
            </div>
          </div>
        </div>
        
        <div className="border border-gray-200 rounded-lg p-4">
          <h3 className="text-lg font-medium text-gray-800 mb-3">Notification Settings</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-700">Email Notifications</h4>
                <p className="text-xs text-gray-500">Send email notifications for important system events</p>
              </div>
              <div className="relative inline-block w-10 mr-2 align-middle select-none">
                <input type="checkbox" name="toggle" id="toggle-1" className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer" defaultChecked />
                <label htmlFor="toggle-1" className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"></label>
              </div>
              <style jsx>{`
                .toggle-checkbox:checked {
                  right: 0;
                  border-color: #4f46e5;
                }
                .toggle-checkbox:checked + .toggle-label {
                  background-color: #4f46e5;
                }
              `}</style>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-700">SMS Notifications</h4>
                <p className="text-xs text-gray-500">Send SMS alerts for critical updates</p>
              </div>
              <div className="relative inline-block w-10 mr-2 align-middle select-none">
                <input type="checkbox" name="toggle" id="toggle-2" className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer" />
                <label htmlFor="toggle-2" className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"></label>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-700">Daily Reports</h4>
                <p className="text-xs text-gray-500">Send daily summary reports to admins</p>
              </div>
              <div className="relative inline-block w-10 mr-2 align-middle select-none">
                <input type="checkbox" name="toggle" id="toggle-3" className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer" defaultChecked />
                <label htmlFor="toggle-3" className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"></label>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-700">User Registration Notifications</h4>
                <p className="text-xs text-gray-500">Notify admins when new users register</p>
              </div>
              <div className="relative inline-block w-10 mr-2 align-middle select-none">
                <input type="checkbox" name="toggle" id="toggle-4" className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer" defaultChecked />
                <label htmlFor="toggle-4" className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"></label>
              </div>
            </div>
            
            <div className="flex justify-end">
              <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium">
                Save Changes
              </button>
            </div>
          </div>
        </div>
        
        <div className="border border-gray-200 rounded-lg p-4">
          <h3 className="text-lg font-medium text-gray-800 mb-3">Backup & Maintenance</h3>
          
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-700">Database Backup</h4>
              <p className="text-xs text-gray-500 mb-2">Schedule automatic database backups</p>
              <select className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-700">Last Backup</h4>
              <p className="text-xs text-gray-500">14/07/2025 03:15 AM</p>
              <div className="mt-2">
                <button className="bg-indigo-50 hover:bg-indigo-100 text-indigo-600 px-3 py-1 rounded-md text-sm font-medium mr-2">
                  Backup Now
                </button>
                <button className="bg-indigo-50 hover:bg-indigo-100 text-indigo-600 px-3 py-1 rounded-md text-sm font-medium">
                  Restore
                </button>
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-700">System Maintenance</h4>
              <p className="text-xs text-gray-500 mb-2">Schedule system maintenance window</p>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="date"
                  className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                <input
                  type="time"
                  className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
            
            <div className="flex justify-end">
              <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium">
                Save Changes
              </button>
            </div>
          </div>
        </div>
        
        <div className="border border-gray-200 rounded-lg p-4">
          <h3 className="text-lg font-medium text-gray-800 mb-3">ML Model Settings</h3>
          
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-700">Automatic Retraining</h4>
              <p className="text-xs text-gray-500 mb-2">Schedule automatic model retraining</p>
              <select className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="biannually">Bi-annually</option>
                <option value="manually">Manually</option>
              </select>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-700">Prediction Confidence Threshold</h4>
              <p className="text-xs text-gray-500 mb-2">Minimum confidence score for predictions</p>
              <input
                type="range"
                min="0"
                max="100"
                defaultValue="75"
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-700">Algorithm Selection</h4>
              <p className="text-xs text-gray-500 mb-2">Select the machine learning algorithm</p>
              <select className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                <option value="rf">Random Forest</option>
                <option value="svm">Support Vector Machine</option>
                <option value="nn">Neural Network</option>
                <option value="ensemble">Ensemble</option>
              </select>
            </div>
            
            <div className="flex justify-end">
              <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
  
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-indigo-800 text-white z-10 shadow-lg transform transition-transform duration-300 ease-in-out">
        <div className="flex items-center justify-center h-16 border-b border-indigo-700">
          <h1 className="text-xl font-bold">Crop Prediction</h1>
        </div>
        <div className="p-4">
          <div className="flex items-center space-x-2 mb-6">
            <div className="h-10 w-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold">
              A
            </div>
            <div>
              <h2 className="text-sm font-medium">Admin User</h2>
              <p className="text-xs text-indigo-300">admin@example.com</p>
            </div>
          </div>
          
          <nav className="space-y-1">
            <button
              className={`flex items-center space-x-3 w-full px-4 py-2.5 rounded-lg ${
                activeTab === 'dashboard' ? 'bg-indigo-700' : 'hover:bg-indigo-700'
              }`}
              onClick={() => setActiveTab('dashboard')}
            >
              <Home className="w-5 h-5" />
              <span>Dashboard</span>
            </button>
            
            <button
              className={`flex items-center space-x-3 w-full px-4 py-2.5 rounded-lg ${
                activeTab === 'users' ? 'bg-indigo-700' : 'hover:bg-indigo-700'
              }`}
              onClick={() => setActiveTab('users')}
            >
              <Users className="w-5 h-5" />
              <span>Users</span>
            </button>
            
            <button
              className={`flex items-center space-x-3 w-full px-4 py-2.5 rounded-lg ${
                activeTab === 'predictions' ? 'bg-indigo-700' : 'hover:bg-indigo-700'
              }`}
              onClick={() => setActiveTab('predictions')}
            >
              <BarChart2 className="w-5 h-5" />
              <span>Predictions</span>
            </button>
            
            <button
              className={`flex items-center space-x-3 w-full px-4 py-2.5 rounded-lg ${
                activeTab === 'crops' ? 'bg-indigo-700' : 'hover:bg-indigo-700'
              }`}
              onClick={() => setActiveTab('crops')}
            >
              <Database className="w-5 h-5" />
              <span>Crops & ML Model</span>
            </button>
            
            <button
              className={`flex items-center space-x-3 w-full px-4 py-2.5 rounded-lg ${
                activeTab === 'resources' ? 'bg-indigo-700' : 'hover:bg-indigo-700'
              }`}
              onClick={() => setActiveTab('resources')}
            >
              <Book className="w-5 h-5" />
              <span>Resources</span>
            </button>
            
            <button
              className={`flex items-center space-x-3 w-full px-4 py-2.5 rounded-lg ${
                activeTab === 'settings' ? 'bg-indigo-700' : 'hover:bg-indigo-700'
              }`}
              onClick={() => setActiveTab('settings')}
            >
              <Settings className="w-5 h-5" />
              <span>Settings</span>
            </button>
          </nav>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <button className="flex items-center space-x-3 w-full px-4 py-2.5 rounded-lg hover:bg-indigo-700 text-indigo-200">
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
              {activeTab === 'users' && 'User Management'}
              {activeTab === 'predictions' && 'Prediction Analytics'}
              {activeTab === 'crops' && 'Crop & ML Model Management'}
              {activeTab === 'resources' && 'Resource Management'}
              {activeTab === 'settings' && 'Settings'}
            </h1>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-9 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                <div className="absolute left-3 top-2.5 text-gray-400">
                  <Search className="w-4 h-4" />
                </div>
              </div>
              <button className="relative p-2 text-gray-400 hover:text-gray-500">
                <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
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
        {activeTab === 'users' && renderUsers()}
        {activeTab === 'predictions' && renderPredictions()}
        {activeTab === 'crops' && renderCrops()}
        {activeTab === 'resources' && renderResources()}
        {activeTab === 'settings' && renderSettings()}
      </div>
    </div>
  );
}
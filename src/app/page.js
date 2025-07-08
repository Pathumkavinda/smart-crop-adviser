'use client';
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
// TODO: Create AuthContext for Next.js
// import { useAuth } from '@/contexts/AuthContext';

// Replace lucide-react icons with simple SVG components
const IconLeaf = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
    <path d="M11 20A7 7 0 0 1 4 13c0-3.4 2.2-6.2 5.2-7.2A7 7 0 0 0 16 13c0 3.4-2.2 6.2-5.2 7.2"/>
    <path d="M15.5 9.5a4 4 0 0 0-6.5 4.5"/>
    <path d="M22 12c0 5.5-4.5 10-10 10S2 17.5 2 12 6.5 2 12 2s10 4.5 10 10z"/>
  </svg>
);

const IconBarChart = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
    <rect x="3" y="3" width="18" height="18" rx="2"/>
    <path d="M8 15v-6"/>
    <path d="M12 15V9"/>
    <path d="M16 15v-3"/>
  </svg>
);

const IconMap = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
    <path d="M3 6l6-3 6 3 6-3v15l-6 3-6-3-6 3V6z"/>
    <path d="M9 3v15"/>
    <path d="M15 6v15"/>
  </svg>
);

const IconCloud = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
    <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/>
    <path d="M12 12v9"/>
    <path d="m8 17 4 4 4-4"/>
  </svg>
);

const IconDatabase = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
    <ellipse cx="12" cy="5" rx="9" ry="3"/>
    <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/>
    <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
  </svg>
);

const IconArrowRight = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
    <path d="M5 12h14"/>
    <path d="m12 5 7 7-7 7"/>
  </svg>
);

const IconUsers = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);

export default function Home() {
  // Mock authentication state until we implement the actual auth context
  const currentUser = null;

  return (
    <div>
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="md:flex md:items-center md:justify-between">
            <div className="md:w-1/2">
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
                Smart Crop Adviser for Sri Lankan Agriculture
              </h1>
              <p className="text-xl md:text-2xl mb-6 text-green-100">
                Get personalized crop recommendations based on your soil conditions,
                location, and season.
              </p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                {currentUser ? (
                  <Link
                    href="/adviser"
                    className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-green-700 bg-white hover:bg-green-50"
                  >
                    Start Analysis
                    <IconArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                ) : (
                  <Link
                    href="/register"
                    className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-green-700 bg-white hover:bg-green-50"
                  >
                    Get Started
                    <IconArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                )}
                <Link
                  href="/info"
                  className="inline-flex items-center justify-center px-6 py-3 border border-white text-base font-medium rounded-md text-white hover:bg-green-800"
                >
                  Learn More
                </Link>
              </div>
            </div>
            <div className="hidden md:block md:w-1/2">
              <div className="relative h-[400px] w-full bg-green-700/20 rounded-lg flex items-center justify-center">
                {/* Replace with a gradient background and text instead of missing image */}
                <div className="text-white text-center p-8">
                  <div className="text-4xl font-bold mb-3">Sustainable Farming</div>
                  <p className="text-green-100">Better crops, better yields, better future</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base font-semibold text-green-600 tracking-wide uppercase">Features</h2>
            <p className="mt-1 text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight">
              Why use Smart Crop Adviser?
            </p>
            <p className="max-w-xl mt-5 mx-auto text-xl text-gray-500">
              Our system helps farmers make data-driven decisions to improve yields and reduce risks.
            </p>
          </div>
          <div className="mt-16">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
                      <IconLeaf className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="ml-5">
                      <h3 className="text-lg font-medium text-gray-900">Personalized Recommendations</h3>
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-base text-gray-500">
                      Get crop recommendations tailored to your specific soil conditions,
                      location, and season for better yields.
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
                      <IconMap className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="ml-5">
                      <h3 className="text-lg font-medium text-gray-900">Local Adaptation</h3>
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-base text-gray-500">
                      Designed specifically for Sri Lankan agro-ecological zones,
                      taking into account local growing conditions.
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-purple-100 rounded-md p-3">
                      <IconDatabase className="h-6 w-6 text-purple-600" />
                    </div>
                    <div className="ml-5">
                      <h3 className="text-lg font-medium text-gray-900">Data-Driven Insights</h3>
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-base text-gray-500">
                      Powered by machine learning and comprehensive agricultural data
                      for accurate, science-based recommendations.
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-yellow-100 rounded-md p-3">
                      <IconCloud className="h-6 w-6 text-yellow-600" />
                    </div>
                    <div className="ml-5">
                      <h3 className="text-lg font-medium text-gray-900">Weather Integration</h3>
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-base text-gray-500">
                      Incorporates local weather data to enhance recommendations
                      based on current conditions.
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-red-100 rounded-md p-3">
                      <IconBarChart className="h-6 w-6 text-red-600" />
                    </div>
                    <div className="ml-5">
                      <h3 className="text-lg font-medium text-gray-900">Visual Analytics</h3>
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-base text-gray-500">
                      Easy-to-understand charts and visualizations to help you
                      make better farming decisions.
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-indigo-100 rounded-md p-3">
                      <IconUsers className="h-6 w-6 text-indigo-600" />
                    </div>
                    <div className="ml-5">
                      <h3 className="text-lg font-medium text-gray-900">Community Knowledge</h3>
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-base text-gray-500">
                      Benefit from the collective wisdom of agricultural experts
                      and successful farming practices.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base font-semibold text-green-600 tracking-wide uppercase">Process</h2>
            <p className="mt-1 text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight">
              How It Works
            </p>
            <p className="max-w-xl mt-5 mx-auto text-xl text-gray-500">
              Get your personalized crop recommendations in just a few simple steps.
            </p>
          </div>
          <div className="mt-16">
            <div className="relative">
              <div className="relative z-10">
                <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
                  <div className="text-center">
                    <div className="mx-auto h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                      <span className="text-2xl font-bold text-green-600">1</span>
                    </div>
                    <h3 className="mt-6 text-xl font-medium text-gray-900">Input Soil Data</h3>
                    <p className="mt-2 text-base text-gray-500">
                      Enter your soil parameters (pH, N, P, K), location, and season.
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="mx-auto h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                      <span className="text-2xl font-bold text-green-600">2</span>
                    </div>
                    <h3 className="mt-6 text-xl font-medium text-gray-900">AI Analysis</h3>
                    <p className="mt-2 text-base text-gray-500">
                      Our system analyzes your data using machine learning algorithms.
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="mx-auto h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                      <span className="text-2xl font-bold text-green-600">3</span>
                    </div>
                    <h3 className="mt-6 text-xl font-medium text-gray-900">Get Recommendations</h3>
                    <p className="mt-2 text-base text-gray-500">
                      Receive detailed crop recommendations, fertilizer advice, and management tips.
                    </p>
                  </div>
                </div>
              </div>
              <div className="hidden md:block absolute top-1/2 w-full h-0.5 bg-gray-200 transform -translate-y-1/2"></div>
            </div>
            <div className="mt-16 text-center">
              {currentUser ? (
                <Link
                  href="/adviser"
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
                >
                  Start Your Analysis
                  <IconArrowRight className="ml-2 h-5 w-5" />
                </Link>
              ) : (
                <Link
                  href="/register"
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
                >
                  Create Your Account
                  <IconArrowRight className="ml-2 h-5 w-5" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base font-semibold text-green-600 tracking-wide uppercase">Testimonials</h2>
            <p className="mt-1 text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight">
              What Farmers Are Saying
            </p>
          </div>
          <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            <div className="bg-white overflow-hidden shadow rounded-lg p-6">
              <div className="flex items-center mb-4">
                <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                  <span className="text-xl font-bold text-green-600">KP</span>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Kumara Perera</h3>
                  <p className="text-sm text-gray-500">Vegetable Farmer, Nuwara Eliya</p>
                </div>
              </div>
              <p className="text-gray-600">
                "This system helped me identify the perfect potato varieties for my farm.
                My yield increased by 30% after following the recommendations!"
              </p>
              <div className="mt-4 flex text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
            </div>
            <div className="bg-white overflow-hidden shadow rounded-lg p-6">
              <div className="flex items-center mb-4">
                <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                  <span className="text-xl font-bold text-green-600">SF</span>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Saman Fernando</h3>
                  <p className="text-sm text-gray-500">Rice Farmer, Polonnaruwa</p>
                </div>
              </div>
              <p className="text-gray-600">
                "The fertilizer recommendations saved me money while improving
                my crop health. This is exactly what Sri Lankan farmers need!"
              </p>
              <div className="mt-4 flex text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
            </div>
            <div className="bg-white overflow-hidden shadow rounded-lg p-6">
              <div className="flex items-center mb-4">
                <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                  <span className="text-xl font-bold text-green-600">NT</span>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Nisha Thilakarathna</h3>
                  <p className="text-sm text-gray-500">Mixed Crop Farmer, Kandy</p>
                </div>
              </div>
              <p className="text-gray-600">
                "The soil analysis and management tips were spot on! I've been farming
                for 15 years and this system taught me new techniques that actually work."
              </p>
              <div className="mt-4 flex text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-green-700">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            <span className="block">Ready to improve your farming?</span>
            <span className="block text-green-100">Start using Smart Crop Adviser today.</span>
          </h2>
          <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
            {currentUser ? (
              <div className="inline-flex rounded-md shadow">
                <Link
                  href="/adviser"
                  className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-green-600 bg-white hover:bg-green-50"
                >
                  Get Started
                  <IconArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </div>
            ) : (
              <div className="inline-flex rounded-md shadow">
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-green-600 bg-white hover:bg-green-50"
                >
                  Sign Up Free
                  <IconArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </div>
            )}
            <div className="ml-3 inline-flex rounded-md shadow">
              <Link
                href="/info"
                className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-500"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
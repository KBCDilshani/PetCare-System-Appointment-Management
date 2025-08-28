import { useState } from 'react'
import { Link } from 'react-router-dom'

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('pets')

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <Link to="/admin/pet" className="btn-primary">
          Add New Pet
        </Link>
      </div>

      <div className="card">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('pets')}
              className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'pets'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Manage Pets
            </button>
            <button
              onClick={() => setActiveTab('requests')}
              className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'requests'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Adoption Requests
            </button>
          </nav>
        </div>

        <div className="mt-6">
          {activeTab === 'pets' && (
            <div className="space-y-4">
              <h2 className="text-lg font-medium text-gray-900">Available Pets</h2>
              {/* Pet management content */}
            </div>
          )}

          {activeTab === 'requests' && (
            <div className="space-y-4">
              <h2 className="text-lg font-medium text-gray-900">Pending Requests</h2>
              {/* Adoption requests content */}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
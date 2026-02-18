"use client"

import { useLocation, useNavigate } from "react-router-dom"
import { useEffect } from "react"

export default function AdvertiseSuccess() {
  const location = useLocation()
  const navigate = useNavigate()
  const { listing, plan } = location.state || {}

  useEffect(() => {
    if (!listing || !plan) {
      navigate("/advertise")
    }
  }, [listing, plan, navigate])

  if (!listing || !plan) {
    return null
  }

  return (
    <div className="max-w-2xl mx-auto p-6 text-center">
      <div className="bg-white rounded-lg shadow-md p-8">
        <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-white text-2xl">✓</span>
        </div>

        <h1 className="text-3xl font-bold text-green-600 mb-4">Payment Successful!</h1>

        <p className="text-gray-600 mb-6">
          Your listing &quot;{listing.name}&quot; has been successfully promoted with the {plan.name} package.
        </p>

        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="font-semibold mb-2">Promotion Details:</h3>
          <div className="text-sm text-gray-600 space-y-1">
            <p>Plan: {plan.name}</p>
            <p>Duration: {plan.duration}</p>
            <p>Amount Paid: ${plan.price}</p>
            <p>Status: Active</p>
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => navigate("/show-listings")}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            View My Listings
          </button>

          <button
            onClick={() => navigate("/advertise")}
            className="w-full border border-gray-300 py-3 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Promote Another Listing
          </button>
        </div>
      </div>
    </div>
  )
}

"use client"

import { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import { Link, useNavigate } from "react-router-dom"

export default function Advertise() {
  const { currentUser } = useSelector((state) => state.user)
  const [userListings, setUserListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (!currentUser) {
      navigate("/sign-in")
      return
    }
    fetchUserListings()
  }, [currentUser, navigate])

  const fetchUserListings = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/user/listings/${currentUser._id}`)
      const data = await res.json()

      if (data.success === false) {
        setError(data.message)
        return
      }

      // Filter only approved listings
      const approvedListings = data.filter((listing) => listing.approved === true)
      setUserListings(approvedListings)
    } catch (error) {
      setError("Failed to fetch listings")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg">Loading your listings...</div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Advertise Your Properties</h1>
        <p className="text-gray-600">Promote your approved listings to reach more potential buyers and renters.</p>
      </div>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">{error}</div>}

      {userListings.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg mb-4">You don&apos;t have any approved listings to advertise yet.</div>
          <Link
            to="/create-listing"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition duration-200"
          >
            Create Your First Listing
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {userListings.map((listing) => (
            <div key={listing._id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <img
                src={listing.imageUrls[0] || "/placeholder.svg?height=200&width=300"}
                alt={listing.name}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2 truncate">{listing.name}</h3>
                <p className="text-gray-600 text-sm mb-2 truncate">{listing.address}</p>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xl font-bold text-green-600">
                    ${listing.regularPrice.toLocaleString()}
                    {listing.type === "rent" && "/month"}
                  </span>
                  <span className="text-sm text-gray-500 capitalize">{listing.type}</span>
                </div>
                <div className="flex gap-2 text-sm text-gray-600 mb-4">
                  <span>{listing.bedrooms} beds</span>
                  <span>•</span>
                  <span>{listing.bathrooms} baths</span>
                </div>
                <Link
                  to={`/advertise/promote/${listing._id}`}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-200 text-center block"
                >
                  Promote This Listing
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

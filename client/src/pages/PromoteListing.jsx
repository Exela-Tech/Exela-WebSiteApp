"use client"

import { useEffect, useState } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { useSelector } from "react-redux"

export default function PromoteListing() {
  const { id } = useParams()
  const { currentUser } = useSelector((state) => state.user)
  const [listing, setListing] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedPlan, setSelectedPlan] = useState("featured")
  const navigate = useNavigate()

  const promotionPlans = [
    {
      id: "featured",
      name: "Featured",
      price: 29,
      duration: "7 days",
      features: [
        "Featured in search results",
        "Homepage banner placement",
        "Priority in category listings",
        "Basic analytics",
      ],
      popular: false,
    },
    {
      id: "premium",
      name: "Premium",
      price: 59,
      duration: "14 days",
      features: [
        "All Featured benefits",
        "Top of search results",
        "Social media promotion",
        "Advanced analytics",
        "Email marketing inclusion",
      ],
      popular: true,
    },
    {
      id: "spotlight",
      name: "Spotlight",
      price: 99,
      duration: "30 days",
      features: [
        "All Premium benefits",
        "Dedicated homepage section",
        "Newsletter feature",
        "Professional photography tips",
        "Priority customer support",
        "Extended analytics",
      ],
      popular: false,
    },
  ]

  useEffect(() => {
    if (!currentUser) {
      navigate("/sign-in")
      return
    }
    if (id) {
      fetchListing()
    }
  }, [id]) // Remove currentUser and navigate from dependencies

  const fetchListing = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/listing/get/${id}`)
      const data = await res.json()

      console.log("Fetched listing data:", data) // Debug log

      if (data.success === false) {
        console.log("Listing fetch failed:", data.message)
        setListing(null)
        setLoading(false)
        return
      }

      // Check if user owns this listing - but don't redirect, just show error
      if (data.userRef !== currentUser._id) {
        console.log("User doesn't own this listing")
        setListing(null)
        setLoading(false)
        return
      }

      setListing(data)
    } catch (error) {
      console.error("Error fetching listing:", error)
      setListing(null)
    } finally {
      setLoading(false)
    }
  }

  const handleProceedToPayment = () => {
    const selectedPlanData = promotionPlans.find((p) => p.id === selectedPlan)
    navigate(`/advertise/payment/${id}`, {
      state: {
        listing,
        plan: selectedPlanData,
      },
    })
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Loading listing details...</p>
        </div>
      </div>
    )
  }

  if (!listing) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4 text-red-600">Unable to Load Listing</h2>
          <p className="text-gray-600 mb-4">This listing may not exist or you do&apos;t have permission to promote it.</p>
          <Link to="/advertise" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
            Back to Advertise
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Listing Preview */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Promote Your Listing</h1>
        <div className="flex flex-col md:flex-row gap-6">
          <img
            src={listing.imageUrls[0] || "/placeholder.svg?height=200&width=300"}
            alt={listing.name}
            className="w-full md:w-64 h-48 object-cover rounded-lg"
          />
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">{listing.name}</h2>
            <p className="text-gray-600 mb-2">{listing.address}</p>
            <div className="flex items-center gap-4 mb-2">
              <span className="text-2xl font-bold text-green-600">
                ${listing.regularPrice.toLocaleString()}
                {listing.type === "rent" && "/month"}
              </span>
              <span className="text-sm text-gray-500 capitalize bg-gray-100 px-2 py-1 rounded">{listing.type}</span>
            </div>
            <div className="flex gap-4 text-sm text-gray-600">
              <span>{listing.bedrooms} beds</span>
              <span>•</span>
              <span>{listing.bathrooms} baths</span>
              {listing.parking && (
                <>
                  <span>•</span>
                  <span>Parking</span>
                </>
              )}
              {listing.furnished && (
                <>
                  <span>•</span>
                  <span>Furnished</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Promotion Plans */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Choose Your Promotion Plan</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {promotionPlans.map((plan) => (
            <div
              key={plan.id}
              className={`relative bg-white rounded-lg shadow-md p-6 cursor-pointer transition-all ${
                selectedPlan === plan.id ? "ring-2 ring-blue-500 transform scale-105" : "hover:shadow-lg"
              } ${plan.popular ? "border-2 border-blue-500" : ""}`}
              onClick={() => setSelectedPlan(plan.id)}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-gray-800 mb-2">{plan.name}</h3>
                <div className="text-3xl font-bold text-blue-600 mb-1">${plan.price}</div>
                <div className="text-gray-600 text-sm">{plan.duration}</div>
              </div>

              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center text-sm text-gray-600">
                    <svg
                      className="w-4 h-4 text-green-500 mr-2 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>

              <div className="text-center">
                <div
                  className={`w-4 h-4 rounded-full mx-auto ${selectedPlan === plan.id ? "bg-blue-500" : "bg-gray-300"}`}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between items-center">
        <Link to="/advertise" className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600">
          Back to Listings
        </Link>
        <button
          onClick={handleProceedToPayment}
          className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 font-medium"
        >
          Proceed to Payment - ${promotionPlans.find((p) => p.id === selectedPlan)?.price}
        </button>
      </div>
    </div>
  )
}

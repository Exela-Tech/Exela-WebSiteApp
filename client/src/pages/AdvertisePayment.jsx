"use client"

import { useEffect, useState } from "react"
import { useParams, useLocation, useNavigate } from "react-router-dom"
import { useSelector } from "react-redux"

export default function AdvertisePayment() {
  const { id: listingId } = useParams()
  const { id: _id } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { currentUser } = useSelector((state) => state.user)
  const [loading, setLoading] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState("card")

  // Get data from location state
  const { listing, plan } = location.state || {}

  useEffect(() => {
    if (!currentUser) {
      navigate("/sign-in")
      return
    }

    // Add a small delay to ensure state is properly set
    const timer = setTimeout(() => {
      if (!listing || !plan) {
        console.log("Missing data - listing:", !!listing, "plan:", !!plan)
        navigate("/advertise")
      }
    }, 100)

    return () => clearTimeout(timer)
  },[currentUser,listing,plan,navigate])
  }, [currentUser]) // Remove listing, plan, navigate from dependencies

  const handlePayment = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Simulate payment processing
      console.log("Processing payment for:", { listing: listing.name, plan: plan.name, amount: plan.price })

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Navigate to success page with data
      navigate("/advertise/success", {
        state: {
          listing,
          plan,
          paymentMethod,
        },
      })
    } catch (error) {
      console.error("Payment failed:", error)
      alert("Payment failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // Show loading while checking data
  if (!listing || !plan) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Loading payment details...</p>
          <button onClick={() => navigate("/advertise")} className="mt-4 text-blue-600 hover:underline">
            Go back to Advertise
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">Complete Your Payment</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Order Summary */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Order Summary</h2>

          <div className="border-b pb-4 mb-4">
            <div className="flex gap-4">
              <img
                src={listing.imageUrls?.[0] || "/placeholder.svg?height=100&width=150"}
                alt={listing.name}
                className="w-20 h-16 object-cover rounded"
              />
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800">{listing.name}</h3>
                <p className="text-sm text-gray-600">{listing.address}</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Promotion Plan:</span>
              <span className="font-medium">{plan.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Duration:</span>
              <span className="font-medium">{plan.duration}</span>
            </div>
            <div className="flex justify-between text-lg font-bold border-t pt-3">
              <span>Total:</span>
              <span className="text-blue-600">${plan.price}</span>
            </div>
          </div>
        </div>

        {/* Payment Form */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Payment Details</h2>

          <form onSubmit={handlePayment}>
            {/* Payment Method Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">Payment Method</label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="card"
                    checked={paymentMethod === "card"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mr-2"
                  />
                  <span>Credit/Debit Card</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="paypal"
                    checked={paymentMethod === "paypal"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mr-2"
                  />
                  <span>PayPal</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="mobile"
                    checked={paymentMethod === "mobile"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mr-2"
                  />
                  <span>Mobile Money</span>
                </label>
              </div>
            </div>

            {/* Card Payment Form */}
            {paymentMethod === "card" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
                  <input
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                    <input
                      type="text"
                      placeholder="MM/YY"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
                    <input
                      type="text"
                      placeholder="123"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cardholder Name</label>
                  <input
                    type="text"
                    placeholder="John Doe"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
            )}

            {/* PayPal */}
            {paymentMethod === "paypal" && (
              <div className="text-center py-8">
                <div className="bg-blue-50 rounded-lg p-6">
                  <p className="text-gray-600 mb-4">You will be redirected to PayPal to complete your payment.</p>
                  <div className="text-4xl mb-2">💳</div>
                </div>
              </div>
            )}

            {/* Mobile Money */}
            {paymentMethod === "mobile" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
                  <input
                    type="tel"
                    placeholder="+256 700 000 000"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Provider</label>
                  <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="mtn">MTN Mobile Money</option>
                    <option value="airtel">Airtel Money</option>
                  </select>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4 mt-6">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="flex-1 bg-gray-500 text-white py-3 px-6 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                    Processing...
                  </div>
                ) : (
                  `Pay $${plan.price}`
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

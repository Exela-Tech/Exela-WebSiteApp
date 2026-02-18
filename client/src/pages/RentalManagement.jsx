"use client"

import { useState, useEffect } from "react"
import { useSelector } from "react-redux"
import { Link, useNavigate, useLocation } from "react-router-dom"
import {
  Home,
  DollarSign,
  FileText,
  Users,
  ArrowRight,
  Search,
  Plus,
  Calendar,
  Settings,
  Clock,
  CheckCircle,
  AlertTriangle,
} from "lucide-react"

export default function RentalManagement() {
  const { currentUser } = useSelector((state) => state.user)
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, _setFilterStatus] = useState("all")
  const navigate = useNavigate()
  const location = useLocation()

  console.log("RentalManagement component rendered")

  // Check if we're in posting path mode
  const isPostingPath = location.search.includes("postingPath=true")

  // Parse query parameters
  const queryParams = new URLSearchParams(location.search)
  const subNavFilterType = queryParams.get("subNavFilterType") || "all"

  useEffect(() => {
    console.log("RentalManagement useEffect called")
    // Fetch user's rental properties if logged in
    if (currentUser) {
      fetchProperties()
    } else {
      setLoading(false)
    }
  }, [currentUser, location.search]) // Added location.search to re-fetch when URL parameters change

  const fetchProperties = async () => {
    try {
      setLoading(true)
      console.log("Fetching properties...")

      // Fetch properties from the API with userRef filter to get all user's listings
      if (currentUser) {
        const response = await fetch(`/api/listing/get?userRef=${currentUser._id}`, {
          method: "GET",
          credentials: "include",
        })

        if (!response.ok) {
          throw new Error("Failed to fetch properties")
        }

        const data = await response.json()
        setProperties(data)
        console.log("Properties loaded:", data.length)
      }
      setLoading(false)
    } catch (error) {
      console.error("Error fetching properties:", error)
      // Fallback to placeholder data if API fails
      setProperties([
        {
          _id: "1",
          name: "Modern Apartment in Downtown",
          address: "123 Main St, New York, NY",
          imageUrls: ["https://cdn.pixabay.com/photo/2016/11/18/17/46/house-1836070_1280.jpg"],
          regularPrice: 2500,
          rentalStatus: "occupied",
          tenant: "John Smith",
          leaseEnd: "2023-12-31",
          nextPayment: "2023-06-01",
          approved: true,
        },
        {
          _id: "2",
          name: "Cozy Studio Near Campus",
          address: "789 College Blvd, Boston, MA",
          imageUrls: ["https://cdn.pixabay.com/photo/2014/07/31/21/41/apartment-1867187_1280.jpg"],
          regularPrice: 1200,
          rentalStatus: "vacant",
          tenant: null,
          leaseEnd: null,
          nextPayment: null,
          approved: false,
        },
        {
          _id: "3",
          name: "Suburban Family Home",
          address: "456 Oak St, Chicago, IL",
          imageUrls: ["https://cdn.pixabay.com/photo/2016/11/29/03/53/house-1867187_1280.jpg"],
          regularPrice: 3200,
          rentalStatus: "occupied",
          tenant: "Jane Doe",
          leaseEnd: "2024-05-15",
          nextPayment: "2023-06-01",
          approved: true,
        },
      ])
      setLoading(false)
    }
  }

  const handlePostProperty = () => {
    console.log("Post property button clicked")

    // If user is not logged in, redirect to login page with return URL to post-listing-preview
    if (!currentUser) {
      console.log("User not logged in, redirecting to rental manager login")
      const returnUrl = "/post-listing-preview"

      // Use the correct path that matches the route in App.jsx
      navigate(`/rental-manager/login?url=${encodeURIComponent(returnUrl)}`)
    } else {
      // If user is logged in, go directly to post listing preview
      console.log("User logged in, redirecting to post listing preview")
      navigate("/post-listing-preview")
    }
  }

  const filteredProperties = properties.filter((property) => {
    const matchesSearch =
      property.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.address?.toLowerCase().includes(searchTerm.toLowerCase())

    // Filter by approval status if specified
    const matchesApproval =
      subNavFilterType === "all" ||
      (subNavFilterType === "approved" && property.approved) ||
      (subNavFilterType === "pending" && !property.approved) ||
      (subNavFilterType === "occupied" && property.rentalStatus === "occupied") ||
      (subNavFilterType === "vacant" && property.rentalStatus === "vacant") ||
      (subNavFilterType === "maintenance" && property.rentalStatus === "maintenance")

    return matchesSearch && matchesApproval
  })

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "occupied":
        return "bg-green-100 text-green-800"
      case "vacant":
        return "bg-yellow-100 text-yellow-800"
      case "maintenance":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getApprovalBadgeClass = (approved) => {
    return approved ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"
  }

  // If we're in posting path mode and user is logged in, show properties view
  const showPropertiesView = isPostingPath || currentUser

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Navigation Bar */}
      <div className="border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-blue-600">Rental Manager</h1>
            </div>
            <div className="flex space-x-4">
              <button className="text-blue-600 font-medium">Contact sales</button>
              <button
                onClick={handlePostProperty}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
              >
                Post your listing
              </button>
            </div>
          </div>
        </div>
      </div>

      {showPropertiesView ? (
        /* Properties View (when user is logged in and in posting path) */
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Dashboard Navigation */}
          <div className="mb-8 border-b">
            <div className="flex space-x-8">
              <Link
                to="/rental-manager/properties?postingPath=true"
                className="pb-4 px-1 border-b-2 border-blue-600 text-blue-600 font-medium"
              >
                Properties
              </Link>
              <Link to="/rental-manager/tenants" className="pb-4 px-1 text-gray-500 hover:text-gray-700">
                Tenants
              </Link>
              <Link to="/rental-manager/leases" className="pb-4 px-1 text-gray-500 hover:text-gray-700">
                Leases
              </Link>
              <Link to="/rental-manager/payments" className="pb-4 px-1 text-gray-500 hover:text-gray-700">
                Payments
              </Link>
              <Link to="/rental-manager/maintenance" className="pb-4 px-1 text-gray-500 hover:text-gray-700">
                Maintenance
              </Link>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">My Listings</h2>
            <p className="text-gray-600">Manage your rental properties and listings in one place.</p>
          </div>

          {/* Filter Tabs */}
          <div className="border-b mb-6">
            <div className="flex space-x-8 overflow-x-auto">
              <Link
                to="/rental-manager/properties?postingPath=true&subNavFilterType=all"
                className={`pb-4 px-1 whitespace-nowrap ${subNavFilterType === "all" ? "border-b-2 border-blue-600 text-blue-600 font-medium" : "text-gray-500"}`}
              >
                All
              </Link>
              <Link
                to="/rental-manager/properties?postingPath=true&subNavFilterType=approved"
                className={`pb-4 px-1 whitespace-nowrap ${subNavFilterType === "approved" ? "border-b-2 border-blue-600 text-blue-600 font-medium" : "text-gray-500"}`}
              >
                Approved
              </Link>
              <Link
                to="/rental-manager/properties?postingPath=true&subNavFilterType=pending"
                className={`pb-4 px-1 whitespace-nowrap ${subNavFilterType === "pending" ? "border-b-2 border-blue-600 text-blue-600 font-medium" : "text-gray-500"}`}
              >
                Pending Approval
              </Link>
              <Link
                to="/rental-manager/properties?postingPath=true&subNavFilterType=occupied"
                className={`pb-4 px-1 whitespace-nowrap ${subNavFilterType === "occupied" ? "border-b-2 border-blue-600 text-blue-600 font-medium" : "text-gray-500"}`}
              >
                Occupied
              </Link>
              <Link
                to="/rental-manager/properties?postingPath=true&subNavFilterType=vacant"
                className={`pb-4 px-1 whitespace-nowrap ${subNavFilterType === "vacant" ? "border-b-2 border-blue-600 text-blue-600 font-medium" : "text-gray-500"}`}
              >
                Vacant
              </Link>
              <Link
                to="/rental-manager/properties?postingPath=true&subNavFilterType=maintenance"
                className={`pb-4 px-1 whitespace-nowrap ${subNavFilterType === "maintenance" ? "border-b-2 border-blue-600 text-blue-600 font-medium" : "text-gray-500"}`}
              >
                Maintenance
              </Link>
            </div>
          </div>

          {/* Search and Add Property */}
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
            <div className="relative w-full sm:w-auto">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search properties..."
                className="pl-10 pr-4 py-2 border rounded-md w-full sm:w-80"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button
              onClick={handlePostProperty}
              className="w-full sm:w-auto flex items-center justify-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
            >
              <Plus className="mr-2 h-5 w-5" />
              Add Property
            </button>
          </div>

          {/* Properties List */}
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading your properties...</p>
            </div>
          ) : filteredProperties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProperties.map((property) => (
                <div key={property._id} className="bg-white rounded-lg shadow-md overflow-hidden border">
                  <div className="relative">
                    <div
                      className="h-48 bg-cover bg-center"
                      style={{ backgroundImage: `url(${property.imageUrls[0]})` }}
                    ></div>
                    {/* Approval Status Badge */}
                    <div className="absolute top-2 right-2">
                      <div
                        className={`flex items-center px-2 py-1 rounded-full text-xs font-semibold ${getApprovalBadgeClass(property.approved)}`}
                      >
                        {property.approved ? (
                          <>
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Approved
                          </>
                        ) : (
                          <>
                            <Clock className="h-3 w-3 mr-1" />
                            Pending Approval
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold mb-1">{property.name}</h3>
                    <p className="text-gray-500 text-sm mb-3">{property.address}</p>
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-gray-700 font-medium">
                        ${property.regularPrice}
                        {property.type === "rent" ? "/month" : ""}
                      </span>
                      {property.rentalStatus && (
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadgeClass(property.rentalStatus)}`}
                        >
                          {property.rentalStatus.charAt(0).toUpperCase() + property.rentalStatus.slice(1)}
                        </span>
                      )}
                    </div>

                    {/* Approval Status Message */}
                    {!property.approved && (
                      <div className="bg-amber-50 border border-amber-200 rounded-md p-2 mb-3">
                        <div className="flex items-start">
                          <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 mr-2 flex-shrink-0" />
                          <p className="text-xs text-amber-800">
                            This listing is pending approval by an administrator and is not visible to the public yet.
                          </p>
                        </div>
                      </div>
                    )}

                    {property.rentalStatus === "occupied" && (
                      <div className="border-t pt-3 mt-3">
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Tenant:</span> {property.tenant}
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Lease ends:</span>{" "}
                          {property.leaseEnd ? new Date(property.leaseEnd).toLocaleDateString() : "N/A"}
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Next payment:</span>{" "}
                          {property.nextPayment ? new Date(property.nextPayment).toLocaleDateString() : "N/A"}
                        </p>
                      </div>
                    )}
                    <div className="mt-4 flex justify-between">
                      <Link
                        to={`/listing/${property._id}`}
                        className="text-blue-600 text-sm font-medium hover:underline"
                      >
                        View Details
                      </Link>
                      <div className="flex space-x-2">
                        <button className="text-blue-600 text-sm font-medium hover:underline flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {property.rentalStatus === "occupied" ? "Manage Lease" : "List Property"}
                        </button>
                        <button className="text-gray-500 text-sm font-medium hover:underline flex items-center">
                          <Settings className="h-4 w-4 mr-1" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <Home className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No properties found</h3>
              <p className="text-gray-500 mb-6">
                {searchTerm || subNavFilterType !== "all"
                  ? "Try adjusting your search or filters"
                  : "Get started by adding your first property"}
              </p>
              <button
                onClick={handlePostProperty}
                className="inline-flex items-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition font-medium"
              >
                <Plus className="mr-2 h-5 w-5" />
                Add Property
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Marketing View (when user is not logged in or not in posting path) */
        <>
          {/* Hero Section */}
          <div className="bg-gradient-to-r from-gray-100 to-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div>
                  <h2 className="text-4xl font-bold text-gray-800 mb-6">
                    Level up your landlording simply and confidently
                  </h2>
                  <p className="text-lg text-gray-600 mb-8">
                    Take the extra legwork out of running your rental. From leases and payments to maintenance and
                    move-out, Rental Manager has the tools to help you get more done.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <button
                      onClick={handlePostProperty}
                      className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition font-medium"
                    >
                      Get started
                    </button>
                    <div className="flex items-center mt-4 sm:mt-0">
                      <span className="text-gray-600 mr-2">Already have an account?</span>
                      <Link to="/sign-in" className="text-blue-600 font-medium hover:underline">
                        Sign in
                      </Link>
                    </div>
                  </div>
                </div>
                <div className="hidden md:block">
                  <img
                    src="https://cdn.pixabay.com/photo/2017/08/01/00/38/man-2562325_1280.jpg"
                    alt="Landlord managing property"
                    className="rounded-lg shadow-lg"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Features Section */}
          <div className="bg-blue-900 text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
              <div className="mb-12">
                <h2 className="text-3xl font-bold mb-6">Rent like a pro with Rental Manager</h2>
                <p className="text-lg max-w-3xl">
                  Posting a listing is just the beginning. Build and sign leases, screen tenants, collect rent and fill
                  vacancies with over 30 million monthly visitors.
                </p>
                <button
                  onClick={handlePostProperty}
                  className="mt-6 bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition font-medium"
                >
                  Get started for free
                </button>
                <div className="mt-4 flex items-center">
                  <Link to="#" className="text-white font-medium hover:underline flex items-center">
                    View paid services <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <div className="bg-white text-gray-800 p-6 rounded-lg shadow-md">
                  <div className="mb-4 text-blue-600">
                    <Home className="h-10 w-10" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">Post listings & find renters quickly and easily</h3>
                  <p className="mb-4">Create listings in minutes to reach the most visitors of any rentals network.</p>
                  <Link to="#" className="text-blue-600 font-medium hover:underline">
                    Learn more
                  </Link>
                </div>

                <div className="bg-white text-gray-800 p-6 rounded-lg shadow-md">
                  <div className="mb-4 text-blue-600">
                    <FileText className="h-10 w-10" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">Create & send leases for signing</h3>
                  <p className="mb-4">
                    Build a new lease online or upload your own for signing. Our lease tools make it simple.
                  </p>
                  <Link to="#" className="text-blue-600 font-medium hover:underline">
                    Learn more
                  </Link>
                </div>

                <div className="bg-white text-gray-800 p-6 rounded-lg shadow-md">
                  <div className="mb-4 text-blue-600">
                    <DollarSign className="h-10 w-10" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Reliable Payments</h3>
                  <p className="mb-4">Get paid on time with automatic rent collection and payment tracking.</p>
                  <Link to="#" className="text-blue-600 font-medium hover:underline">
                    Learn more
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Benefits Section */}
          <div className="bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-800 mb-4">Why use Rental Manager?</h2>
                <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                  Our all-in-one platform helps landlords save time, reduce stress, and maximize rental income.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="bg-blue-100 text-blue-600 rounded-full p-4 inline-flex mb-4">
                    <Users className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Quality Tenants</h3>
                  <p className="text-gray-600">
                    Screen tenants with background and credit checks to find reliable renters.
                  </p>
                </div>

                <div className="text-center">
                  <div className="bg-blue-100 text-blue-600 rounded-full p-4 inline-flex mb-4">
                    <DollarSign className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Reliable Payments</h3>
                  <p className="text-gray-600">Get paid on time with automatic rent collection and payment tracking.</p>
                </div>

                <div className="text-center">
                  <div className="bg-blue-100 text-blue-600 rounded-full p-4 inline-flex mb-4">
                    <FileText className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Digital Leases</h3>
                  <p className="text-gray-600">
                    Create, send, and sign leases online with legally binding e-signatures.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="bg-blue-600 text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
              <h2 className="text-3xl font-bold mb-4">Ready to simplify your rental management?</h2>
              <p className="text-xl mb-8 max-w-3xl mx-auto">
                Join thousands of landlords who are saving time and increasing profits with our platform.
              </p>
              <button
                onClick={handlePostProperty}
                className="bg-white text-blue-600 px-8 py-3 rounded-md font-medium hover:bg-gray-100 transition"
              >
                Get started for free
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

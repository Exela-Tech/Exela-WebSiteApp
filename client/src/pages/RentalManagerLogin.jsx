"use client"

import { useState, useEffect } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { signInStart, signInSuccess, signInFailure } from "../redux/user/userSlice"
import OAuth from "../components/OAuth"
import FacebookAuth from "../components/FacebookAuth"

function RentalManagerLogin() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [activeTab, setActiveTab] = useState("signin")
  const { loading, error, currentUser } = useSelector((state) => state.user)
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const location = useLocation()

  console.log("RentalManagerLogin component rendered")

  // Get redirect URL from query parameters if it exists
  const queryParams = new URLSearchParams(location.search)
  const redirectUrl = queryParams.get("url") || "/rental-manager"

  console.log("Redirect URL:", redirectUrl)

  // If user is already logged in, redirect to the redirect URL
  useEffect(() => {
    if (currentUser) {
      console.log("User already logged in, redirecting to:", redirectUrl)
      navigate(redirectUrl)
    }
  }, [currentUser, navigate, redirectUrl])

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      console.log("Submitting login form with data:", formData)
      dispatch(signInStart())
      const response = await fetch("/api/auth/signin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })
      const data = await response.json()
      if (data.success === false) {
        dispatch(signInFailure(data.message))
        return
      }
      dispatch(signInSuccess(data))
      navigate(redirectUrl) // Navigate to the redirect URL after successful sign-in
    } catch (error) {
      dispatch(signInFailure(error.message))
    }
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      {/* Left side - Sign in form */}
      <div className="w-full md:w-1/2 p-6 md:p-12 flex flex-col">
        <div className="mb-8">
          <Link to="/" className="flex items-center">
            <span className="text-2xl font-bold text-blue-600">Estate</span>
            <span className="text-2xl font-bold text-slate-700">App</span>
          </Link>
        </div>

        <div className="max-w-md mx-auto w-full">
          <h1 className="text-2xl font-bold mb-6">Sign up for Estate Rental Manager</h1>

          {/* Tabs */}
          <div className="flex border-b mb-6">
            <button
              className={`pb-2 px-4 ${activeTab === "signin" ? "border-b-2 border-blue-500 text-blue-600 font-medium" : "text-gray-500"}`}
              onClick={() => setActiveTab("signin")}
            >
              Sign in
            </button>
            <button
              className={`pb-2 px-4 ${activeTab === "newaccount" ? "border-b-2 border-blue-500 text-blue-600 font-medium" : "text-gray-500"}`}
              onClick={() => setActiveTab("newaccount")}
            >
              New account
            </button>
          </div>

          {activeTab === "signin" ? (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  placeholder="Enter email"
                  className="w-full p-3 border border-gray-300 rounded-md"
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  placeholder="Enter password"
                  className="w-full p-3 border border-gray-300 rounded-md"
                  onChange={handleChange}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-md font-medium mt-2"
              >
                {loading ? "Loading..." : "Sign in"}
              </button>

              <div className="text-center">
                <Link to="/forgot-password" className="text-blue-600 hover:underline text-sm">
                  Forgot your password?
                </Link>
              </div>

              <div className="mt-4">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">Or connect with</span>
                  </div>
                </div>

                <div className="mt-4 grid gap-3">
                  <OAuth />
                  <FacebookAuth />
                </div>
              </div>

              {error && <p className="text-red-500 mt-3 text-center">{error}</p>}
            </form>
          ) : (
            <div className="text-center py-8">
              <p className="mb-4">Create a new account to get started</p>
              <Link
                to={`/sign-up${redirectUrl !== "/" ? `?redirect=${encodeURIComponent(redirectUrl)}` : ""}`}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-md font-medium inline-block"
              >
                Create account
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Right side - Marketing content */}
      <div className="w-full md:w-1/2 bg-blue-50 p-6 md:p-12 flex items-center">
        <div className="max-w-md mx-auto">
          <div className="mb-6">
            <div className="flex items-center">
              <span className="text-xl font-bold text-blue-600">Estate</span>
              <span className="text-xl font-bold text-slate-700">Rental Manager</span>
            </div>
          </div>

          <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
            It&apos;s easier than ever
            <br />
            to be a landlord.
          </h2>

          <p className="text-gray-700 mb-8">
            Save time with our property management tools that help you get what you need — signed leases and rent
            payments.
          </p>

          <div className="mt-8">
            <img
              src="https://cdn.pixabay.com/photo/2016/11/18/17/46/house-1836070_1280.jpg"
              alt="Property management illustration"
              className="max-w-full h-auto rounded-lg shadow-md"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default RentalManagerLogin

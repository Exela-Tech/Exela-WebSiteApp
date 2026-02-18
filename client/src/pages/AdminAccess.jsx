"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useSelector } from "react-redux"

export default function AdminAccess() {
  const { currentUser } = useSelector((state) => state.user)
  const [secretKey, setSecretKey] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!currentUser) {
      setError("You must be logged in to request admin access")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/user/promote-admin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: currentUser.email,
          secretKey,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to grant admin access")
      }

      setSuccess(true)
      setTimeout(() => {
        navigate("/admin")
      }, 2000)
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  if (!currentUser) {
    return (
      <div className="p-6 max-w-lg mx-auto">
        <h1 className="text-3xl font-semibold text-center my-7">Admin Access</h1>
        <p className="text-red-500 mb-4">You must be logged in to request admin access</p>
        <button
          onClick={() => navigate("/sign-in")}
          className="bg-slate-700 text-white p-3 rounded-lg uppercase hover:opacity-95 w-full"
        >
          Sign In
        </button>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h1 className="text-3xl font-semibold text-center my-7">Admin Access</h1>

      {success ? (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          <p>Admin access granted successfully! Redirecting to admin dashboard...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="font-semibold">User Email:</label>
            <input type="text" value={currentUser.email} disabled className="border p-3 rounded-lg bg-gray-100" />
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-semibold">Admin Secret Key:</label>
            <input
              type="password"
              value={secretKey}
              onChange={(e) => setSecretKey(e.target.value)}
              className="border p-3 rounded-lg"
              placeholder="Enter the admin secret key"
              required
            />
            <p className="text-sm text-gray-500">
              This key is required to grant admin privileges. Contact the system administrator if you don&apos;t have it.
            </p>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              <p>{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="bg-slate-700 text-white p-3 rounded-lg uppercase hover:opacity-95 disabled:opacity-80"
          >
            {loading ? "Processing..." : "Request Admin Access"}
          </button>
        </form>
      )}
    </div>
  )
}

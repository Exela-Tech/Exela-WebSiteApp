"use client"

import { useNavigate } from "react-router-dom"
import { useState } from "react"

function ForgotPassword() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState({ type: "", text: "" })
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validate email
    if (!email) {
      setMessage({ type: "error", text: "Please enter your email address" })
      return
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setMessage({ type: "error", text: "Please enter a valid email address" })
      return
    }

    setIsLoading(true)
    setMessage({ type: "", text: "" })

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage({
          type: "success",
          text: "Password reset instructions have been sent to your email",
        })

        // Navigate after 3 seconds
        setTimeout(() => {
          navigate("/sign-in")
        }, 3000)
      } else {
        setMessage({
          type: "error",
          text: data.message || "Failed to send reset email. Please try again.",
        })
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: "Something went wrong. Please try again later.",
      })
      console.error("Error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="d-flex justify-content-center align-items-center bg-secondary vh-100">
      <div className="bg-white p-4 rounded w-100" style={{ maxWidth: "400px" }}>
        <h4 className="text-center mb-4">Reset Your Password</h4>

        {message.text && (
          <div className={`alert ${message.type === "error" ? "alert-danger" : "alert-success"} mb-3`}>
            {message.text}
          </div>
        )}

        <p className="text-muted mb-4">
          Enter your email address and we&apos;ll send you instructions to reset your password.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="email" className="form-label">
              <strong>Email Address</strong>
            </label>
            <input
              type="email"
              placeholder="Enter your email"
              autoComplete="email"
              name="email"
              className="form-control"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                setMessage({ type: "", text: "" })
              }}
              disabled={isLoading}
            />
          </div>

          <button type="submit" className="btn btn-primary w-100" disabled={isLoading}>
            {isLoading ? "Sending..." : "Send Reset Instructions"}
          </button>

          <div className="mt-3 text-center">
            <a href="/sign-in" className="text-decoration-none">
              Back to Sign In
            </a>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ForgotPassword

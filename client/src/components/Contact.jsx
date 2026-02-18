"use client"

import { useEffect, useState } from "react"

function Contact({ listing }) {
  const [landlord, setLandlord] = useState(null)
  const [selectedMethod, setSelectedMethod] = useState(null)
  const [message, setMessage] = useState("")
  const [subject, setSubject] = useState("")
  const [senderName, setSenderName] = useState("")
  const [senderEmail, setSenderEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState(null)

  useEffect(() => {
    const fetchLandlord = async () => {
      try {
        const res = await fetch(`/api/user/${listing.userRef}`)
        const data = await res.json()
        setLandlord(data)
        // Set default subject
        setSubject(`Inquiry about ${listing.name}`)
      } catch (error) {
        console.log(error)
      }
    }
    fetchLandlord()
  }, [listing.userRef, listing.name])

  // Format phone number for display
  const formatPhoneNumber = (phone) => {
    if (!phone) return null
    const cleaned = phone.replace(/\D/g, "")
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
    }
    return phone
  }

  // Handle method selection
  const handleMethodSelect = (method) => {
    setSelectedMethod(method)
    setSubmitStatus(null)
  }

  // Handle phone call
  const handlePhoneCall = () => {
    const cleanPhone = landlord.phone.replace(/\D/g, "")
    window.open(`tel:${cleanPhone}`, "_self")
  }

  // Handle WhatsApp
  const handleWhatsApp = () => {
    const cleanPhone = landlord.phone.replace(/\D/g, "")
    const whatsappMessage = `Hi ${landlord.username}! I'm interested in your property "${listing.name}". Could you please provide more details?`
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(whatsappMessage)}`, "_blank")
  }

  // Handle email submission
  const handleEmailSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus(null)

    try {
      const response = await fetch("/api/contact/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          to: landlord.email,
          subject: subject,
          message: message,
          senderName: senderName,
          senderEmail: senderEmail,
          propertyName: listing.name,
          propertyId: listing._id,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setSubmitStatus({ type: "success", message: "Email sent successfully!" })
        // Reset form
        setMessage("")
        setSenderName("")
        setSenderEmail("")
        setSelectedMethod(null)
      } else {
        setSubmitStatus({ type: "error", message: data.message || "Failed to send email" })
      }
    } catch (error) {
      setSubmitStatus({ type: "error", message: "Failed to send email. Please try again." })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle mailto fallback
  const handleMailtoFallback = () => {
    const emailBody = `Hi ${landlord.username},

${message}

Best regards,
${senderName}
${senderEmail ? `Email: ${senderEmail}` : ""}

---
Property: ${listing.name}
Property ID: ${listing._id}`

    const mailtoUrl = `mailto:${landlord.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(emailBody)}`
    window.open(mailtoUrl, "_self")
  }

  if (!landlord) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-10 bg-gray-200 rounded mb-2"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-semibold mb-4 text-gray-800">
        Contact <span className="text-blue-600">{landlord.username}</span>
      </h3>

      {/* Always show contact information */}
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <h4 className="font-semibold text-gray-800 mb-3">Contact Information</h4>
        <div className="space-y-2">
          <div className="flex items-center">
            <span className="text-lg mr-2">📧</span>
            <span className="text-gray-700">{landlord.email}</span>
          </div>
          {landlord.phone && (
            <div className="flex items-center">
              <span className="text-lg mr-2">📱</span>
              <span className="text-gray-700">{formatPhoneNumber(landlord.phone)}</span>
            </div>
          )}
        </div>
      </div>

      {!selectedMethod ? (
        // Contact method selection
        <div className="space-y-4">
          <p className="text-gray-600 mb-4">Choose how you&apos;d like to contact the landlord:</p>

          {/* Contact Options */}
          <div className="space-y-3">
            {/* Email Option */}
            <div
              onClick={() => handleMethodSelect("email")}
              className="border-2 border-gray-200 rounded-lg p-4 hover:border-blue-500 hover:bg-blue-50 cursor-pointer transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="text-2xl mr-3">📧</span>
                  <div>
                    <h4 className="font-semibold text-gray-800">Send Email</h4>
                    <p className="text-sm text-gray-600">Compose a detailed message</p>
                  </div>
                </div>
                <span className="text-blue-600 font-medium">Select →</span>
              </div>
            </div>

            {/* Phone Options (if available) */}
            {landlord.phone && (
              <>
                {/* Direct Call */}
                <div
                  onClick={handlePhoneCall}
                  className="border-2 border-gray-200 rounded-lg p-4 hover:border-green-500 hover:bg-green-50 cursor-pointer transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">📞</span>
                      <div>
                        <h4 className="font-semibold text-gray-800">Call Now</h4>
                        <p className="text-sm text-gray-600">{formatPhoneNumber(landlord.phone)}</p>
                      </div>
                    </div>
                    <span className="text-green-600 font-medium">Call →</span>
                  </div>
                </div>

                {/* WhatsApp */}
                <div
                  onClick={handleWhatsApp}
                  className="border-2 border-gray-200 rounded-lg p-4 hover:border-green-500 hover:bg-green-50 cursor-pointer transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">💬</span>
                      <div>
                        <h4 className="font-semibold text-gray-800">WhatsApp Message</h4>
                        <p className="text-sm text-gray-600">Quick messaging via WhatsApp</p>
                      </div>
                    </div>
                    <span className="text-green-600 font-medium">Message →</span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Back to listing button */}
          <button
            onClick={() => window.history.back()}
            className="w-full mt-4 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
          >
            ← Back to Listing
          </button>
        </div>
      ) : (
        // Email composition form
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold">Send Email to {landlord.username}</h4>
            <button onClick={() => setSelectedMethod(null)} className="text-gray-500 hover:text-gray-700">
              ← Back
            </button>
          </div>

          <form onSubmit={handleEmailSubmit} className="space-y-4">
            {/* Sender Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="senderName" className="block text-sm font-medium text-gray-700 mb-1">
                  Your Name *
                </label>
                <input
                  type="text"
                  id="senderName"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  required
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your full name"
                />
              </div>
              <div>
                <label htmlFor="senderEmail" className="block text-sm font-medium text-gray-700 mb-1">
                  Your Email *
                </label>
                <input
                  type="email"
                  id="senderEmail"
                  value={senderEmail}
                  onChange={(e) => setSenderEmail(e.target.value)}
                  required
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="your.email@example.com"
                />
              </div>
            </div>

            {/* Subject */}
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                Subject
              </label>
              <input
                type="text"
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Message */}
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                Message *
              </label>
              <textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                rows="6"
                className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder={`Hi ${landlord.username},

I'm interested in your property "${listing.name}". Could you please provide more details about:

- Availability dates
- Viewing schedule
- Additional amenities
- Lease terms

Thank you for your time!`}
              />
            </div>

            {/* Status Messages */}
            {submitStatus && (
              <div
                className={`p-3 rounded-lg ${
                  submitStatus.type === "success"
                    ? "bg-green-100 text-green-700 border border-green-300"
                    : "bg-red-100 text-red-700 border border-red-300"
                }`}
              >
                {submitStatus.message}
              </div>
            )}

            {/* Submit Buttons */}
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Sending...
                  </span>
                ) : (
                  "📧 Send Email"
                )}
              </button>

              <button
                type="button"
                onClick={handleMailtoFallback}
                className="flex-1 bg-gray-600 text-white px-4 py-3 rounded-lg hover:bg-gray-700 transition-colors"
              >
                📬 Open in Email App
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}

export default Contact

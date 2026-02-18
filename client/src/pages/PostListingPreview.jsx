"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useSelector } from "react-redux"
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from "firebase/storage"
import { app } from "../firebase.js"
import { Home, MapPin, Square, ArrowRight, Camera, AlertCircle, Upload, Check, X } from "lucide-react"

export default function PostListingPreview() {
  const { currentUser } = useSelector((state) => state.user)
  const navigate = useNavigate()
  const [activeStep, setActiveStep] = useState(1)
  const [files, setFiles] = useState([])
  const [uploading, setUploading] = useState(false)
  const [imageUploadError, setImageUploadError] = useState(false)
  const [submitLoading, setSubmitLoading] = useState(false)
  const [submitError, setSubmitError] = useState(null)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    propertyType: "house",
    address: "",
    bedrooms: 3,
    bathrooms: 2,
    squareFootage: "",
    imageUrls: [],
    name: "",
    description: "",
    regularPrice: 1000,
    discountPrice: 0,
    offer: false,
    parking: false,
    furnished: false,
    type: "rent",
    rentalManagement: true, // Flag to indicate this is a landlord property
  })

  // Validation state
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})

  // Check if user is logged in, if not redirect to login
  useEffect(() => {
    if (!currentUser) {
      console.log("User not logged in, redirecting to login")
      const returnUrl = "/post-listing-preview"
      navigate(`/rental-manager/login?url=${encodeURIComponent(returnUrl)}`)
    }
  }, [currentUser, navigate])

  // Generate name and description based on property details
  useEffect(() => {
    if (formData.address && formData.propertyType && formData.bedrooms) {
      // Generate a name based on property details
      const bedroomText = formData.bedrooms === 0 ? "Studio" : `${formData.bedrooms} bedroom`
      const name = `${bedroomText} ${formData.propertyType} for ${formData.type} in ${formData.address.split(",")[0]}`

      // Generate a description based on property details
      const description = `Beautiful ${bedroomText} ${formData.propertyType} ${
        formData.type === "rent" ? "for rent" : "for sale"
      } with ${formData.bathrooms} bathroom${formData.bathrooms > 1 ? "s" : ""}${
        formData.squareFootage ? ` and ${formData.squareFootage} sq ft of space` : ""
      }. Located at ${formData.address}.${formData.parking ? " Includes parking." : ""}${
        formData.furnished ? " Fully furnished." : ""
      }`

      setFormData((prev) => ({
        ...prev,
        name,
        description,
      }))
    }
  }, [
    formData.address,
    formData.propertyType,
    formData.bedrooms,
    formData.bathrooms,
    formData.squareFootage,
    formData.type,
    formData.parking,
    formData.furnished,
  ])

  // Handle property type selection
  const handlePropertyTypeSelect = (type) => {
    setFormData({
      ...formData,
      propertyType: type,
    })
    setTouched({
      ...touched,
      propertyType: true,
    })
  }

  // Handle bedroom selection
  const handleBedroomSelect = (count) => {
    setFormData({
      ...formData,
      bedrooms: count,
    })
    setTouched({
      ...touched,
      bedrooms: true,
    })
  }

  // Handle bathroom selection
  const handleBathroomSelect = (count) => {
    setFormData({
      ...formData,
      bathrooms: count,
    })
    setTouched({
      ...touched,
      bathrooms: true,
    })
  }

  // Handle property type selection
  const handlePropertyTypeChange = (type) => {
    setFormData({
      ...formData,
      type,
    })
  }

  // Handle checkbox changes
  const handleCheckboxChange = (e) => {
    const { id, checked } = e.target
    setFormData({
      ...formData,
      [id]: checked,
    })
  }

  // Handle input changes
  const handleInputChange = (e) => {
    const { id, value } = e.target
    setFormData({
      ...formData,
      [id]: value,
    })
    setTouched({
      ...touched,
      [id]: true,
    })

    // Clear error when user types
    if (errors[id]) {
      setErrors({
        ...errors,
        [id]: null,
      })
    }
  }

  // Handle input blur for validation
  const handleBlur = (e) => {
    const { id } = e.target
    setTouched({
      ...touched,
      [id]: true,
    })
    validateField(id, formData[id])
  }

  // Validate a single field
  const validateField = (field, value) => {
    const newErrors = { ...errors }

    switch (field) {
      case "address":
        if (!value.trim()) {
          newErrors.address = "Address is required"
        } else if (value.length < 5) {
          newErrors.address = "Please enter a complete address"
        } else {
          newErrors.address = null
        }
        break
      case "squareFootage":
        if (value && (isNaN(value) || value <= 0)) {
          newErrors.squareFootage = "Please enter a valid number"
        } else {
          newErrors.squareFootage = null
        }
        break
      case "regularPrice":
        if (!value || isNaN(value) || value <= 0) {
          newErrors.regularPrice = "Please enter a valid price"
        } else {
          newErrors.regularPrice = null
        }
        break
      default:
        break
    }

    setErrors(newErrors)
    return !newErrors[field]
  }

  // Validate all fields
  const validateForm = () => {
    const newErrors = {}
    let isValid = true

    // Address validation
    if (!formData.address.trim()) {
      newErrors.address = "Address is required"
      isValid = false
    } else if (formData.address.length < 5) {
      newErrors.address = "Please enter a complete address"
      isValid = false
    }

    // Square footage validation (optional field)
    if (formData.squareFootage && (isNaN(formData.squareFootage) || formData.squareFootage <= 0)) {
      newErrors.squareFootage = "Please enter a valid number"
      isValid = false
    }

    // Price validation
    if (!formData.regularPrice || isNaN(formData.regularPrice) || formData.regularPrice <= 0) {
      newErrors.regularPrice = "Please enter a valid price"
      isValid = false
    }

    // Image validation
    if (formData.imageUrls.length === 0) {
      newErrors.images = "Please upload at least one image"
      isValid = false
    }

    setErrors(newErrors)
    return isValid
  }

  // Handle image upload
  const handleImageSubmit = () => {
    if (files.length > 0 && files.length + formData.imageUrls.length < 7) {
      setUploading(true)
      setImageUploadError(false)
      const promises = []

      for (let i = 0; i < files.length; i++) {
        promises.push(storeImage(files[i]))
      }
      Promise.all(promises)
        .then((urls) => {
          setFormData({
            ...formData,
            imageUrls: formData.imageUrls.concat(urls),
          })
          setImageUploadError(false)
          setUploading(false)
        })
        .catch((err) => {
          console.error("Image upload error:", err)
          setImageUploadError("Image upload failed (2MB max per image)")
          setUploading(false)

          setTimeout(() => {
            setImageUploadError(false)
          }, 4000)
        })
    } else {
      setImageUploadError("You can only upload up to 6 images per listing")
      setUploading(false)

      setTimeout(() => {
        setImageUploadError(false)
      }, 4000)
    }
  }

  // Store image in Firebase
  const storeImage = async (file) => {
    return new Promise((resolve, reject) => {
      const storage = getStorage(app)
      const fileName = new Date().getTime() + file.name
      const storageRef = ref(storage, fileName)
      const uploadTask = uploadBytesResumable(storageRef, file)
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          console.log(`Upload is ${progress}% done`)
        },
        (error) => {
          console.error("Storage error:", error)
          reject(error)
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            resolve(downloadURL)
          })
        },
      )
    })
  }

  // Remove image
  const handleRemoveImage = (index) => {
    setFormData({
      ...formData,
      imageUrls: formData.imageUrls.filter((_, i) => i !== index),
    })
  }

  // Submit the form to create a new property listing
  const handleSubmit = async () => {
    // Validate form before proceeding
    if (!validateForm()) {
      // Mark all fields as touched to show errors
      const allTouched = {}
      Object.keys(formData).forEach((key) => {
        allTouched[key] = true
      })
      setTouched(allTouched)
      return
    }

    setSubmitLoading(true)
    setSubmitError(null)

    try {
      // Prepare the listing data
      const listingData = {
        ...formData,
        userRef: currentUser._id,
      }

      // Send the data to the server
      const res = await fetch("/api/listing/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(listingData),
        credentials: "include",
      })

      const data = await res.json()

      setSubmitLoading(false)

      if (data.success === false || !res.ok) {
        setSubmitError(data.message || "Failed to create listing")
        return
      }

      // Show success message
      setSubmitSuccess(true)

      // Redirect to the rental manager dashboard after a short delay
      setTimeout(() => {
        // Navigate directly to the rental manager page with the postingPath parameter
        navigate("/rental-manager?postingPath=true")
      }, 1000) // Reduced from 2000ms to 1000ms for faster redirect
    } catch (error) {
      console.error("Error creating listing:", error)
      setSubmitError(error.message || "Something went wrong")
      setSubmitLoading(false)
    }
  }

  // If user is not logged in, don't render the component
  if (!currentUser) {
    return null
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Header */}
      <div className="border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-blue-600">Post Your Rental</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-gray-50 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center overflow-x-auto">
            <div className="flex items-center">
              <div
                className={`${
                  activeStep === 1 ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"
                } rounded-full w-8 h-8 flex items-center justify-center font-medium`}
              >
                1
              </div>
              <span className={`ml-2 font-medium ${activeStep === 1 ? "text-blue-600" : "text-gray-600"}`}>
                Property Details
              </span>
            </div>
            <div className="h-px bg-gray-300 w-12 mx-4"></div>
            <div className="flex items-center">
              <div
                className={`${
                  activeStep === 2 ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"
                } rounded-full w-8 h-8 flex items-center justify-center font-medium`}
              >
                2
              </div>
              <span className={`ml-2 font-medium ${activeStep === 2 ? "text-blue-600" : "text-gray-600"}`}>
                Photos & Pricing
              </span>
            </div>
            <div className="h-px bg-gray-300 w-12 mx-4"></div>
            <div className="flex items-center">
              <div
                className={`${
                  activeStep === 3 ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"
                } rounded-full w-8 h-8 flex items-center justify-center font-medium`}
              >
                3
              </div>
              <span className={`ml-2 font-medium ${activeStep === 3 ? "text-blue-600" : "text-gray-600"}`}>
                Review & Publish
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-grow bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Step 1: Property Details */}
          {activeStep === 1 && (
            <>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Tell us about your property</h2>

              <div className="space-y-6">
                {/* Property Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Property Type</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div
                      onClick={() => handlePropertyTypeSelect("house")}
                      className={`border rounded-lg p-4 hover:border-blue-500 cursor-pointer ${
                        formData.propertyType === "house" ? "bg-blue-50 border-blue-500" : ""
                      }`}
                    >
                      <Home
                        className={`h-6 w-6 ${
                          formData.propertyType === "house" ? "text-blue-600" : "text-gray-400"
                        } mb-2`}
                      />
                      <span className={`text-sm ${formData.propertyType === "house" ? "font-medium" : ""}`}>House</span>
                    </div>
                    <div
                      onClick={() => handlePropertyTypeSelect("apartment")}
                      className={`border rounded-lg p-4 hover:border-blue-500 cursor-pointer ${
                        formData.propertyType === "apartment" ? "bg-blue-50 border-blue-500" : ""
                      }`}
                    >
                      <Home
                        className={`h-6 w-6 ${
                          formData.propertyType === "apartment" ? "text-blue-600" : "text-gray-400"
                        } mb-2`}
                      />
                      <span className={`text-sm ${formData.propertyType === "apartment" ? "font-medium" : ""}`}>
                        Apartment
                      </span>
                    </div>
                    <div
                      onClick={() => handlePropertyTypeSelect("condo")}
                      className={`border rounded-lg p-4 hover:border-blue-500 cursor-pointer ${
                        formData.propertyType === "condo" ? "bg-blue-50 border-blue-500" : ""
                      }`}
                    >
                      <Home
                        className={`h-6 w-6 ${
                          formData.propertyType === "condo" ? "text-blue-600" : "text-gray-400"
                        } mb-2`}
                      />
                      <span className={`text-sm ${formData.propertyType === "condo" ? "font-medium" : ""}`}>Condo</span>
                    </div>
                    <div
                      onClick={() => handlePropertyTypeSelect("townhouse")}
                      className={`border rounded-lg p-4 hover:border-blue-500 cursor-pointer ${
                        formData.propertyType === "townhouse" ? "bg-blue-50 border-blue-500" : ""
                      }`}
                    >
                      <Home
                        className={`h-6 w-6 ${
                          formData.propertyType === "townhouse" ? "text-blue-600" : "text-gray-400"
                        } mb-2`}
                      />
                      <span className={`text-sm ${formData.propertyType === "townhouse" ? "font-medium" : ""}`}>
                        Townhouse
                      </span>
                    </div>
                  </div>
                </div>

                {/* For Rent or Sale */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Listing Type</label>
                  <div className="flex space-x-4">
                    <div
                      onClick={() => handlePropertyTypeChange("rent")}
                      className={`flex-1 border rounded-lg p-4 hover:border-blue-500 cursor-pointer ${
                        formData.type === "rent" ? "bg-blue-50 border-blue-500" : ""
                      }`}
                    >
                      <span className={`text-sm ${formData.type === "rent" ? "font-medium text-blue-600" : ""}`}>
                        For Rent
                      </span>
                    </div>
                    <div
                      onClick={() => handlePropertyTypeChange("sale")}
                      className={`flex-1 border rounded-lg p-4 hover:border-blue-500 cursor-pointer ${
                        formData.type === "sale" ? "bg-blue-50 border-blue-500" : ""
                      }`}
                    >
                      <span className={`text-sm ${formData.type === "sale" ? "font-medium text-blue-600" : ""}`}>
                        For Sale
                      </span>
                    </div>
                  </div>
                </div>

                {/* Address */}
                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                    Property Address
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="text"
                      id="address"
                      placeholder="Enter your property address"
                      className={`pl-10 pr-4 py-2 border rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        touched.address && errors.address ? "border-red-500" : ""
                      }`}
                      value={formData.address}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                    />
                  </div>
                  {touched.address && errors.address && (
                    <div className="mt-1 text-red-500 text-sm flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.address}
                    </div>
                  )}
                </div>

                {/* Bedrooms & Bathrooms */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bedrooms</label>
                    <div className="flex space-x-2">
                      {[0, 1, 2, 3, 4, 5].map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => handleBedroomSelect(num)}
                          className={`flex-1 py-2 border rounded-md ${
                            formData.bedrooms === num ? "bg-blue-50 border-blue-500 text-blue-600" : "text-gray-700"
                          }`}
                        >
                          {num === 0 ? "Studio" : num}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bathrooms</label>
                    <div className="flex space-x-2">
                      {[1, 1.5, 2, 2.5, 3, 3.5].map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => handleBathroomSelect(num)}
                          className={`flex-1 py-2 border rounded-md ${
                            formData.bathrooms === num ? "bg-blue-50 border-blue-500 text-blue-600" : "text-gray-700"
                          }`}
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Square Footage */}
                <div>
                  <label htmlFor="squareFootage" className="block text-sm font-medium text-gray-700 mb-1">
                    Square Footage
                  </label>
                  <div className="relative">
                    <Square className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="text"
                      id="squareFootage"
                      placeholder="Enter square footage"
                      className={`pl-10 pr-4 py-2 border rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        touched.squareFootage && errors.squareFootage ? "border-red-500" : ""
                      }`}
                      value={formData.squareFootage}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                    />
                  </div>
                  {touched.squareFootage && errors.squareFootage && (
                    <div className="mt-1 text-red-500 text-sm flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.squareFootage}
                    </div>
                  )}
                </div>

                {/* Features */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Features</label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="parking"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        checked={formData.parking}
                        onChange={handleCheckboxChange}
                      />
                      <label htmlFor="parking" className="ml-2 block text-sm text-gray-700">
                        Parking Available
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="furnished"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        checked={formData.furnished}
                        onChange={handleCheckboxChange}
                      />
                      <label htmlFor="furnished" className="ml-2 block text-sm text-gray-700">
                        Furnished
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="offer"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        checked={formData.offer}
                        onChange={handleCheckboxChange}
                      />
                      <label htmlFor="offer" className="ml-2 block text-sm text-gray-700">
                        Special Offer
                      </label>
                    </div>
                  </div>
                </div>

                {/* Continue Button */}
                <div className="pt-6">
                  <button
                    type="button"
                    onClick={() => setActiveStep(2)}
                    className="w-full bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition font-medium flex items-center justify-center"
                  >
                    Continue <ArrowRight className="ml-2 h-5 w-5" />
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Step 2: Photos & Pricing */}
          {activeStep === 2 && (
            <>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Add photos and set pricing</h2>

              <div className="space-y-6">
                {/* Photos Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Property Photos <span className="text-red-500">*</span>
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    {formData.imageUrls.length === 0 ? (
                      <>
                        <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 mb-2">Add photos to get more responses</p>
                        <p className="text-gray-500 text-sm mb-4">The first image will be the cover (max 6 images)</p>
                      </>
                    ) : (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                        {formData.imageUrls.map((url, index) => (
                          <div key={url} className="relative group">
                            <img
                              src={url || "/placeholder.svg"}
                              alt={`Property ${index + 1}`}
                              className="h-24 w-full object-cover rounded-md"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(index)}
                              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="h-4 w-4" />
                            </button>
                            {index === 0 && (
                              <span className="absolute bottom-1 left-1 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                                Cover
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row gap-2 justify-center">
                      <input
                        type="file"
                        onChange={(e) => setFiles(e.target.files)}
                        className="hidden"
                        id="images"
                        accept="image/*"
                        multiple
                      />
                      <label
                        htmlFor="images"
                        className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 cursor-pointer inline-flex items-center justify-center"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Browse Photos
                      </label>
                      <button
                        type="button"
                        onClick={handleImageSubmit}
                        disabled={!files.length || uploading}
                        className={`${
                          !files.length || uploading
                            ? "bg-gray-300 cursor-not-allowed"
                            : "bg-blue-600 hover:bg-blue-700"
                        } text-white px-4 py-2 rounded-md transition inline-flex items-center justify-center`}
                      >
                        {uploading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Upload className="h-4 w-4 mr-2" />
                            Upload
                          </>
                        )}
                      </button>
                    </div>

                    {imageUploadError && <p className="text-red-500 text-sm mt-2">{imageUploadError}</p>}
                    {touched.images && errors.images && <p className="text-red-500 text-sm mt-2">{errors.images}</p>}
                  </div>
                </div>

                {/* Pricing */}
                <div>
                  <label htmlFor="regularPrice" className="block text-sm font-medium text-gray-700 mb-1">
                    {formData.type === "rent" ? "Monthly Rent" : "Listing Price"}{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">$</span>
                    </div>
                    <input
                      type="number"
                      id="regularPrice"
                      placeholder={formData.type === "rent" ? "Enter monthly rent" : "Enter listing price"}
                      className={`pl-7 pr-4 py-2 border rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        touched.regularPrice && errors.regularPrice ? "border-red-500" : ""
                      }`}
                      value={formData.regularPrice}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      min="1"
                    />
                  </div>
                  {touched.regularPrice && errors.regularPrice && (
                    <div className="mt-1 text-red-500 text-sm flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.regularPrice}
                    </div>
                  )}
                </div>

                {/* Discounted Price (if offer is checked) */}
                {formData.offer && (
                  <div>
                    <label htmlFor="discountPrice" className="block text-sm font-medium text-gray-700 mb-1">
                      Discounted Price
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">$</span>
                      </div>
                      <input
                        type="number"
                        id="discountPrice"
                        placeholder="Enter discounted price"
                        className="pl-7 pr-4 py-2 border rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={formData.discountPrice}
                        onChange={handleInputChange}
                        min="0"
                      />
                    </div>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="pt-6 flex justify-between">
                  <button
                    type="button"
                    onClick={() => setActiveStep(1)}
                    className="px-6 py-3 border border-gray-300 rounded-md hover:bg-gray-50 transition font-medium"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveStep(3)}
                    className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition font-medium flex items-center"
                  >
                    Continue <ArrowRight className="ml-2 h-5 w-5" />
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Step 3: Review & Publish */}
          {activeStep === 3 && (
            <>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Review and publish your listing</h2>

              <div className="space-y-6">
                {/* Preview Card */}
                <div className="border rounded-lg overflow-hidden shadow-sm">
                  {/* Cover Image */}
                  {formData.imageUrls.length > 0 ? (
                    <div
                      className="h-48 bg-cover bg-center"
                      style={{ backgroundImage: `url(${formData.imageUrls[0]})` }}
                    ></div>
                  ) : (
                    <div className="h-48 bg-gray-200 flex items-center justify-center">
                      <Camera className="h-12 w-12 text-gray-400" />
                    </div>
                  )}

                  {/* Listing Details */}
                  <div className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-semibold">
                          {formData.bedrooms === 0 ? "Studio" : `${formData.bedrooms} bedroom`} {formData.bathrooms}{" "}
                          bath {formData.propertyType}
                        </h3>
                        <p className="text-gray-500">{formData.address}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold">
                          ${formData.regularPrice.toLocaleString()}
                          {formData.type === "rent" && <span className="text-sm font-normal">/month</span>}
                        </p>
                        {formData.offer && (
                          <p className="text-sm text-green-600">
                            ${(formData.regularPrice - formData.discountPrice).toLocaleString()} off
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="mt-4">
                      <h4 className="font-medium">Features</h4>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                          {formData.bedrooms === 0 ? "Studio" : `${formData.bedrooms} Bedrooms`}
                        </span>
                        <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                          {formData.bathrooms} Bathrooms
                        </span>
                        {formData.squareFootage && (
                          <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                            {formData.squareFootage} sq ft
                          </span>
                        )}
                        {formData.parking && (
                          <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">Parking</span>
                        )}
                        {formData.furnished && (
                          <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">Furnished</span>
                        )}
                      </div>
                    </div>

                    <div className="mt-4">
                      <h4 className="font-medium">Description</h4>
                      <p className="text-gray-600 text-sm mt-1">{formData.description}</p>
                    </div>
                  </div>
                </div>

                {/* Success/Error Messages */}
                {submitSuccess && (
                  <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded flex items-center">
                    <Check className="h-5 w-5 mr-2" />
                    <div className="flex-1">
                      <p className="font-medium">Your listing has been successfully created!</p>
                      <p className="text-sm mt-1">You&apos;ll be redirected to your listings dashboard in a moment.</p>
                    </div>
                    <button
                      onClick={() => navigate("/rental-manager?postingPath=true")}
                      className="ml-4 bg-green-600 text-white px-3 py-1 rounded-md text-sm hover:bg-green-700 transition"
                    >
                      View My Listings
                    </button>
                  </div>
                )}

                {submitError && (
                  <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded flex items-center">
                    <AlertCircle className="h-5 w-5 mr-2" />
                    <span>{submitError}</span>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="pt-6 flex justify-between">
                  <button
                    type="button"
                    onClick={() => setActiveStep(2)}
                    className="px-6 py-3 border border-gray-300 rounded-md hover:bg-gray-50 transition font-medium"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={submitLoading || submitSuccess}
                    className={`${
                      submitLoading || submitSuccess
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700"
                    } text-white px-6 py-3 rounded-md transition font-medium flex items-center`}
                  >
                    {submitLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Publishing...
                      </>
                    ) : (
                      <>Publish Listing</>
                    )}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

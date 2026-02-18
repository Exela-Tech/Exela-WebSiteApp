"use client"

import { useEffect, useState, useMemo } from "react"
import { Link } from "react-router-dom"
import { Swiper, SwiperSlide } from "swiper/react"
import { Navigation, Autoplay } from "swiper/modules"
import SwiperCore from "swiper"
import "swiper/css/bundle"
import ListingItem from "../components/ListingItem"

export default function Home() {
  const [offerListings, setOfferListings] = useState([])
  const [saleListings, setSaleListings] = useState([])
  const [rentListings, setRentListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  SwiperCore.use([Navigation, Autoplay])

  // Memoize slider listings for better performance
  const sliderListings = useMemo(() => {
    const listings = []

    // Add first and last from each category
    if (offerListings.length > 0) {
      listings.push(offerListings[0])
      if (offerListings.length > 1) {
        listings.push(offerListings[offerListings.length - 1])
      }
    }
    if (rentListings.length > 0) {
      listings.push(rentListings[0])
      if (rentListings.length > 1) {
        listings.push(rentListings[rentListings.length - 1])
      }
    }
    if (saleListings.length > 0) {
      listings.push(saleListings[0])
      if (saleListings.length > 1) {
        listings.push(saleListings[saleListings.length - 1])
      }
    }

    return listings
  }, [offerListings, rentListings, saleListings])

  useEffect(() => {
    const fetchAllListings = async () => {
      try {
        setLoading(true)

        // Fetch all listings in parallel for better performance
        const [offerRes, rentRes, saleRes] = await Promise.all([
          fetch("/api/listing/get?offer=true&limit=4"),
          fetch("/api/listing/get?type=rent&limit=4"),
          fetch("/api/listing/get?type=sale&limit=4"),
        ])

        // Add these debug logs
        console.log("Offer response status:", offerRes.status)
        console.log("Rent response status:", rentRes.status)
        console.log("Sale response status:", saleRes.status)

        if (!offerRes.ok || !rentRes.ok || !saleRes.ok) {
          throw new Error("Failed to fetch listings")
        }

        const [offerData, rentData, saleData] = await Promise.all([offerRes.json(), rentRes.json(), saleRes.json()])

        // Add these debug logs
        console.log("Offer listings:", offerData)
        console.log("Rent listings:", rentData)
        console.log("Sale listings:", saleData)

        setOfferListings(Array.isArray(offerData) ? offerData : offerData.listings || [])
        setRentListings(Array.isArray(rentData) ? rentData : rentData.listings || [])
        setSaleListings(Array.isArray(saleData) ? saleData : saleData.listings || [])
      } catch (error) {
        console.error("Error fetching listings:", error)
        setError("Failed to load listings. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchAllListings()
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-600 text-lg">Loading properties...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 max-w-6xl mx-auto">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>
      </div>
    )
  }

  return (
    <div>
      {/* Hero Section with Background Slider */}
      <div className="relative h-screen overflow-hidden">
        {/* Background Image Slider */}
        {sliderListings.length > 0 && (
          <Swiper
            navigation
            loop={true}
            autoplay={{
              delay: 4000,
              disableOnInteraction: false,
            }}
            modules={[Navigation, Autoplay]}
            className="absolute inset-0 h-full w-full z-10"
          >
            {sliderListings.map((listing, index) => (
              <SwiperSlide key={`slider-${listing._id}-${index}`}>
                <div
                  style={{
                    background: `url(${listing.imageUrls[0]}) center no-repeat`,
                    backgroundSize: "cover",
                    filter: "brightness(1.1) contrast(1.1)",
                  }}
                  className="h-full w-full"
                ></div>
              </SwiperSlide>
            ))}
          </Swiper>
        )}

        {/* Dark Overlay for better text readability */}
        <div className="absolute inset-0 bg-black bg-opacity-25 z-20"></div>

        {/* Hero Content - Fixed positioning */}
        <div className="absolute inset-0 z-30 flex flex-col justify-center items-center text-center px-4">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-white font-bold text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl mb-6 drop-shadow-2xl leading-tight animate-fade-in">
              Find your next <span className="text-blue-400">perfect</span>
              <br />
              place with ease
            </h1>
            <div className="text-gray-100 text-sm sm:text-base md:text-lg lg:text-xl mb-8 max-w-3xl mx-auto drop-shadow-lg bg-black bg-opacity-40 p-4 md:p-6 rounded-lg backdrop-blur-sm animate-fade-in-delay">
              Exela Realtors&apos; Estate is the best place to find your next perfect place to live.
              <br />
              We have a wide range of beautiful properties for you to choose from.
            </div>
            <Link
              to={"/search"}
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 md:py-4 md:px-8 rounded-lg text-base md:text-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 animate-fade-in-delay-2"
            >
              Let&apos;s get started
            </Link>
          </div>
        </div>
      </div>

      {/* Listing results for offer, sale, and rent */}
      <div className="max-w-6xl mx-auto p-3 flex flex-col gap-8 my-10">
        {offerListings && offerListings.length > 0 && (
          <div>
            <div className="my-3">
              <h2 className="text-2xl font-semibold text-slate-600">Recent offers</h2>
              <Link className="text-sm text-blue-800 hover:underline" to={"/search?offer=true"}>
                Show more offers
              </Link>
            </div>
            <div className="flex flex-wrap gap-4">
              {offerListings.map((listing) => (
                <ListingItem listing={listing} key={listing._id} />
              ))}
            </div>
          </div>
        )}
        {rentListings && rentListings.length > 0 && (
          <div>
            <div className="my-3">
              <h2 className="text-2xl font-semibold text-slate-600">Recent places for rent</h2>
              <Link className="text-sm text-blue-800 hover:underline" to={"/search?type=rent"}>
                Show more places for rent
              </Link>
            </div>
            <div className="flex flex-wrap gap-4">
              {rentListings.map((listing) => (
                <ListingItem listing={listing} key={listing._id} />
              ))}
            </div>
          </div>
        )}
        {saleListings && saleListings.length > 0 && (
          <div>
            <div className="my-3">
              <h2 className="text-2xl font-semibold text-slate-600">Recent places for sale</h2>
              <Link className="text-sm text-blue-800 hover:underline" to={"/search?type=sale"}>
                Show more places for sale
              </Link>
            </div>
            <div className="flex flex-wrap gap-4">
              {saleListings.map((listing) => (
                <ListingItem listing={listing} key={listing._id} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

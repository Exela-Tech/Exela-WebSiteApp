# Exela Realtors

A full-stack real estate platform that connects landlords, tenants, buyers, and sellers — streamlining property listing, rental, and management services across **Uganda and East Africa**.

The project includes a **REST API**, a **React web app**, and a **React Native (Expo) mobile app**, all sharing the same backend.

---

## Features

| Feature | Description |
|--------|-------------|
| **Browse properties** | View available properties for rent or sale without an account |
| **Property listings** | Landlords and agents can create and manage listings (login required) |
| **Image slideshows** | Listings include multiple images and key property details |
| **Admin approval** | All listings are reviewed and approved before going live |
| **Authentication** | Sign up, sign in, password reset, and optional Firebase/OAuth |
| **Search & filter** | Filter by location, price, type (rent/sale), and more |
| **Role-based access** | Admin, landlord, and tenant roles with appropriate permissions |
| **Rental management** | Landlords manage their listed properties from the app |
| **Contact & support** | Contact form with email delivery via the API |
| **Advertise & promote** | Paid promotion flow for listings |

---

## Tech Stack

| Layer | Technologies |
|-------|----------------|
| **API** | Node.js, Express, MongoDB (Mongoose), JWT, cookie-parser, Nodemailer |
| **Web client** | React 18, Vite, Tailwind CSS, Redux Toolkit, React Router, Firebase (auth), Swiper |
| **Mobile app** | React Native, Expo, React Navigation, Redux Toolkit, Firebase |
| **Auth** | JWT (HTTP-only cookies), optional Firebase Auth |
| **Database** | MongoDB (e.g. Atlas) |

---

## Project structure

```
Exela-WebSiteApp/
├── api/                 # Node.js + Express backend
│   ├── controllers/     # Auth, contact, listing, user
│   ├── models/          # User, Listing (Mongoose)
│   ├── routes/          # API route definitions
│   ├── utils/           # Helpers, migration, JWT verification
│   ├── scripts/         # Token generation, listing status updates
│   └── index.js         # Entry point
├── client/              # React (Vite) web app
│   ├── src/
│   │   ├── components/  # Shared + admin components
│   │   ├── pages/       # Route pages (Home, Search, Profile, etc.)
│   │   ├── redux/       # Redux store and slices
│   │   └── utils/       # API helpers
│   └── vite.config.js   # Dev server + API proxy
├── mobile-app/          # React Native (Expo) app
│   ├── src/
│   │   ├── screens/     # App screens
│   │   ├── components/  # Reusable UI
│   │   ├── config/      # API, Firebase, constants
│   │   └── redux/       # Store and slices
│   └── App.js
└── README.md
```

---

## Prerequisites

- **Node.js** 18+ and npm
- **MongoDB** (local or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas))
- **Expo CLI** (for mobile): `npm install -g expo-cli` (optional; `npx expo start` works without it)

---

## Environment variables

### API (`api/.env`)

Create `api/.env` with:

```env
MONGO='Your mongo_uri '
JWT_SECRET=your-secure-jwt-secret
ADMIN_SECRET_KEY=your-admin-secret-for-force-admin

# Email (contact form + password reset)
EMAIL_USERNAME=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# Optional: frontend URL for password-reset links
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

### Web client (`client/.env`)

Create `client/.env` with Vite-prefixed variables:

```env
VITE_FIREBASE_API_KEY=your-firebase-api-key
```

Add other Firebase config (e.g. `VITE_FIREBASE_AUTH_DOMAIN`) if you move them to env.

### Mobile app (`mobile-app/`)

- Update `src/config/api.js` (or use env) so `API_BASE_URL` points to your API (e.g. `http://YOUR_IP:3000/api` when testing on device).
- Configure Firebase in `firebase.js` / `src/config/firebaseAuth.js` as needed.

---

## Installation & running

### 1. Clone and install dependencies

```bash
git https://github.com/Exela-Tech/Exela-WebSiteApp.git
cd Exela-WebSiteApp
```

### 2. API (backend)

```bash
cd api
npm install
cp .env.example .env   # if you have one; otherwise create .env as above
npm run dev            # nodemon, port 3000
```

Or run once: `node index.js`.  
Ensure `api/.env` has `MONGO` and `JWT_SECRET` at minimum.

### 3. Web client

```bash
cd client
npm install
# Add client/.env with VITE_FIREBASE_API_KEY (and any other VITE_ vars)
npm run dev            # Vite dev server, typically http://localhost:5173
```

In development, Vite proxies `/api` to `http://localhost:3000`, so the API must be running.

**Production build:**

```bash
npm run build
npm run preview       # optional: preview production build
```

### 4. Mobile app (Expo)

```bash
cd mobile-app
npm install
npx expo start
```

Then press `a` for Android or `i` for iOS simulator, or scan the QR code with Expo Go.  
Ensure the device/simulator can reach the API URL configured in `mobile-app/src/config/api.js`.

---

## Main scripts

| Where | Script | Purpose |
|-------|--------|--------|
| **api** | `npm run dev` | Start API with nodemon (port 3000) |
| **api** | `node index.js` | Start API once |
| **client** | `npm run dev` | Start Vite dev server |
| **client** | `npm run build` | Production build |
| **client** | `npm run preview` | Preview production build |
| **mobile-app** | `npx expo start` | Start Expo dev server |
| **mobile-app** | `npx expo start --android` | Run on Android |
| **mobile-app** | `npx expo start --ios` | Run on iOS |

---

## API overview

- **Base URL (dev):** `http://localhost:3000`
- **Auth:** `/api/auth` — signup, signin, signout, password reset
- **Users:** `/api/user` — profile, update
- **Listings:** `/api/listing` — get, create, update, delete (with approval workflow)
- **Contact:** `/api/contact` — contact form submission (Nodemailer)
- **Debug:** `/api/debug` — health check and dev helpers

Auth uses JWT in HTTP-only cookies; the web client sends credentials via the proxy.

---

## Roadmap / ideas

- Push notifications (mobile)
- Map view for listings
- In-app messaging
- Additional payment providers for promotions

---

## Author

**Jonus Green**  
Web & Mobile Developer  
GitHub: [@jonusgreen](https://github.com/jonusgreen)

---

## License

This project is licensed under the **MIT License**.

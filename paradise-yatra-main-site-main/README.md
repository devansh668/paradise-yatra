# Paradise Yatra Travel Platform

Welcome to the **Paradise Yatra** project repository! This is a comprehensive travel agency platform built for a premier travel agency in Dehradun, India. The platform is designed to provide an exceptional user experience for browsing customized travel packages, trending destinations, luxury holidays, and engaging travel blogs.

## Project Structure

The workspace is divided into two primary directories within `paradise-yatra-main-site-main`:

1. **Frontend** (`ParadiseYatra-3f9e3de458766b6e46e903f1eef6ab5af5200888`)
2. **Backend** (`paradise-yatra-backend-master`)

---

## Frontend (Next.js)

The frontend is a modern, high-performance web application built to deliver a premium, fast, and visually stunning experience to users.

### Tech Stack
- **Framework:** Next.js 14 (App Router)
- **Library:** React
- **Styling:** Tailwind CSS
- **Components:** Custom UI components with Shadcn UI aesthetics
- **Icons:** Lucide React
- **Performance:** Native lazy-loading (`createLazyComponent`), Next/Image optimization

### Key Features
- **Dynamic Content:** Seamless integration with backend APIs to fetch travel packages, destinations, holidays, and blogs.
- **Premium Aesthetics:** Sleek animations, high-contrast dark-mode luxury package sections, glassmorphism UI elements, and modern typography.
- **Responsive Design:** Completely mobile-optimized with swipe-to-scroll carousels, responsive grids, and adaptive layouts.
- **Interactive Galleries:** Built-in auto-scrolling galleries, snapshot image carousels, and hover-triggered dynamic visuals.
- **SEO Optimized:** Clean semantic HTML, text-rich informational sections, and performant server-side/static rendering considerations.

### Running the Frontend
```bash
cd paradise-yatra-main-site-main/ParadiseYatra-3f9e3de458766b6e46e903f1eef6ab5af5200888
npm install
npm run dev
```
The frontend runs by default on `http://localhost:3000`.

---

## Backend (Node.js & Express)

The backend provides a robust REST API tailored to manage the agency's dynamic inventory of travel packages and media content.

### Tech Stack
- **Environment:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB (via Mongoose)
- **Media Storage:** Cloudinary
- **Authentication:** JWT (JSON Web Tokens), bcryptjs
- **Other:** CORS, dotenv, multer

### Key Features
- **Comprehensive API:** Endpoints to manage packages, luxury deals, trending destinations, holiday types, and blog entries.
- **Admin Panel Ready:** APIs restricted by authentication middleware for safe content updates.
- **Image Management:** Direct integration with Cloudinary for handling media uploads via `multer-storage-cloudinary`.
- **CORS Support:** Safely processes cross-origin requests, allowing the frontend to securely fetch data directly or via Next.js proxies.

### Running the Backend
```bash
cd paradise-yatra-main-site-main/paradise-yatra-backend-master
npm install
npm run dev
```
The backend runs by default on `http://127.0.0.1:5001`.

---

## Environment Variables Configuration

To run both services locally, ensure your `.env` and `.env.local` files are properly set up.

### Frontend (`.env.local`)
```env
NEXT_PUBLIC_BACKEND_URL=http://127.0.0.1:5001
```

### Backend (`.env`)
```env
PORT=5001
MONGODB_URI=<Your MongoDB Atlas Connection String>
CLIENT_ORIGIN=http://localhost:3000
NODE_ENV=development
# Cloudinary Keys
CLOUDINARY_CLOUD_NAME=<Your Cloud Name>
CLOUDINARY_API_KEY=<Your API Key>
CLOUDINARY_API_SECRET=<Your API Secret>
# JWT Keys
JWT_SECRET=<Your Secure Secret>
```

---

## Recent Notable Upgrades
- Added an interactive "Who We Are" image carousel section on the homepage.
- Re-themed all primary action buttons ("View Details") and Pricing text across package cards to a signature vibrant Blue (`text-blue-600` and gradient buttons) for better UI consistency.
- Resolved Next.js SSR hydration mismatches in the footer layout.
- Stripped raw HTML tags from rich-text API descriptions to ensure clean UI presentation in the Luxury Packages cards.
- Configured backend CORS rules to support `http://localhost:3000` regardless of the production flag, mitigating frontend timeout and fetch errors.

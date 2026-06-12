# SANJI GAMING — COD Mobile Account Marketplace
## Full-Stack Build Prompt

---

## 1. Project Overview

Build a full-stack web platform called **"SANJI GAMING"** for posting Call of Duty Mobile account listings. The platform has two sides:

- **Admin Panel** — create, edit, delete, and manage listing posts; mark posts as "Sold"
- **Public Posting Site** — visitors browse listings, view full post details, and contact the admin via WhatsApp

This is a **listing/showcase site**, not a payment-processing marketplace. All transactions happen off-platform via WhatsApp.

---

## 2. Recommended Tech Stack

Reuse the same stack as the AccSwap / AntiGravity 2.0 project for consistency:

- **Frontend:** React 18 + Vite, Tailwind CSS, Framer Motion (animations/transitions)
- **Backend:** Node.js + Express
- **Database:** MongoDB (Atlas)
- **Media storage:** Cloudinary (image + video hosting, auto-compression)
- **Auth:** JWT for admin login (single admin account, no public registration needed)
- **State management:** React Context or Zustand (lightweight)
- **Hosting:** Vercel (frontend) + Render/Railway (backend) + MongoDB Atlas (DB)

---

## 3. Data Model — `Post`

```js
{
  _id: ObjectId,
  title: String,                // e.g. "Legendary AK Skin Account - Level 150"
  description: String,          // rich text / multiline
  mediaType: "images" | "video",
  images: [String],              // max 3 Cloudinary URLs (if mediaType = "images")
  video: String,                  // single Cloudinary URL, max 20MB (if mediaType = "video")
  accountPlatform: "activision" | "google" | "apple" | "facebook" | "line",
  accountAccess: [String],       // e.g. ["Email access", "Original email change allowed", "Full access"]
  price: Number,
  status: "available" | "sold",
  createdAt: Date,
  updatedAt: Date
}
```

### Platform → Auto Icon/Badge Mapping
When admin selects `accountPlatform`, auto-display the corresponding logo/badge on the post card and detail view:

| accountPlatform | Display Badge |
|---|---|
| activision | Activision logo + "Activision Linked" |
| google | Google "G" logo + "Google Linked" |
| apple | Apple logo + "Apple ID Linked" |
| facebook | Facebook "f" logo + "Facebook Linked" |
| line | LINE logo + "LINE Linked" |

---

## 4. Media Upload Rules

- If admin uploads **images**: max **3 images**, each compressed/optimized via Cloudinary
- If admin uploads a **video**: max **1 video, 20MB limit**, and image upload is disabled for that post
- Enforce mutually exclusive choice in the UI — a toggle: "Upload Images (max 3)" vs "Upload Video (max 20MB)"
- Show upload progress bar and file size validation before submission

---

## 5. Admin Panel Features

- **Login page** — JWT-based, single admin account (env-stored credentials)
- **Dashboard** — grid/list of all posts with status badges (Available / Sold)
- **Create Post** form:
  - Title
  - Description (textarea)
  - Media type toggle (images/video) + uploader
  - Account platform selector (dropdown with auto icon preview)
  - Account access tags (multi-select or tag input, e.g. "Email access", "No KIA", "All region")
  - Price
- **Edit Post** — same form, pre-filled, with ability to replace media
- **Delete Post** — confirmation modal before deletion
- **Mark as Sold** — one-click toggle that updates `status` to "sold" and visually marks the post (e.g. red "SOLD" ribbon overlay) on the public site

---

## 6. Public Posting Site Features

- **Home/Feed page** — responsive grid of post cards (image/video thumbnail, title, price, platform badge, status)
- **Post Detail page** (opens on click):
  - Full image gallery (carousel/lightbox for up to 3 images) or video player
  - Full description
  - Account platform badge with auto-generated icon
  - Account access list
  - Price
  - **"Sold" overlay** if status = sold (post remains visible but marked, not removable from feed unless admin deletes)
  - **WhatsApp Contact Button** (see below)
- **Filter/Sort** (optional nice-to-have): filter by platform, status, price range

---

## 7. WhatsApp Integration

Each post detail view includes a prominent **"Check Availability on WhatsApp"** button.

- Use a `wa.me` deep link: `https://wa.me/<ADMIN_PHONE_NUMBER>?text=<ENCODED_MESSAGE>`
- The message is **auto-generated** from the post title, e.g.:
  ```
  Hi, is this account still available? "Legendary AK Skin Account - Level 150"
  ```
- `ADMIN_PHONE_NUMBER` is stored in admin settings/env config
- Button opens WhatsApp Web or the mobile app depending on device

---

## 8. UI/UX Design Direction

- Modern, dark-themed gaming aesthetic (matches AccSwap's editorial dark style — electric accent color, e.g. teal or neon green/orange for CTAs)
- Card-based grid layout for the feed, with hover animations (Framer Motion scale/fade)
- Status badges: green "Available" / red "SOLD" ribbon
- Clean typography pairing (e.g. a bold display font for titles, clean sans-serif for body)
- Sticky WhatsApp button on post detail (floating action button style, WhatsApp green)
- Mobile-first responsive design — most visitors will browse from phones

---

## 9. Suggested Folder Structure

```
sanji-gaming/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── PostCard.jsx
│   │   │   ├── PostDetail.jsx
│   │   │   ├── WhatsAppButton.jsx
│   │   │   ├── PlatformBadge.jsx
│   │   │   └── MediaUploader.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── PostDetailPage.jsx
│   │   │   ├── AdminLogin.jsx
│   │   │   ├── AdminDashboard.jsx
│   │   │   └── AdminPostForm.jsx
│   │   └── context/AuthContext.jsx
├── server/                 # Express backend
│   ├── models/Post.js
│   ├── routes/posts.js
│   ├── routes/auth.js
│   ├── middleware/auth.js
│   └── config/cloudinary.js
└── README.md
```

---

## 10. Build Order (Suggested)

1. Scaffold backend: Express server, MongoDB connection, Post model, CRUD routes
2. Add Cloudinary integration for image/video upload with size/count validation
3. Build admin auth (JWT login, protected routes)
4. Build Admin Dashboard + Create/Edit/Delete Post forms
5. Build Public Home feed (post cards)
6. Build Post Detail page with media gallery/player, platform badge, WhatsApp button
7. Implement "Mark as Sold" toggle + sold overlay styling
8. Polish UI with Framer Motion transitions and responsive layout
9. Deploy (Vercel + Render/Railway + Atlas)

---

## 11. Environment Variables Needed

```
MONGO_URI=
JWT_SECRET=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
ADMIN_WHATSAPP_NUMBER=
ADMIN_USERNAME=
ADMIN_PASSWORD_HASH=
```

# Quick Deployment Guide

Follow these steps to deploy Urgent Note Sender to production.

## Step 1: Set up MongoDB Atlas

1. Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a database user
3. Whitelist all IPs (`0.0.0.0/0`)
4. Copy your connection string

## Step 2: Deploy Backend to Render

### Using Render Dashboard:

1. Go to https://dashboard.render.com/
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Fill in:
   - **Name**: `urgent-note-sender-backend`
   - **Root Directory**: (leave blank)
   - **Build Command**: `cd server && npm install`
   - **Start Command**: `cd server && npm start`

5. Add Environment Variables:
   ```
   PORT=10000
   MONGO_URI=<your-mongodb-atlas-connection-string>
   JWT_SECRET=<generate-a-random-32-char-string>
   CLIENT_ORIGIN=https://your-app.vercel.app
   NODE_ENV=production
   ```

6. Click "Create Web Service"
7. **Copy your backend URL** (e.g., `https://urgent-note-sender-backend.onrender.com`)

## Step 3: Deploy Frontend to Vercel

### Using Vercel Dashboard:

1. Go to https://vercel.com/dashboard
2. Click "Add New..." → "Project"
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

5. Add Environment Variable:
   ```
   VITE_API_BASE_URL=<your-render-backend-url>
   ```
   (Use the URL you copied from Step 2)

6. Click "Deploy"
7. **Copy your frontend URL** (e.g., `https://urgent-note-sender.vercel.app`)

## Step 4: Update Backend CORS

1. Go back to Render dashboard
2. Open your backend service
3. Go to "Environment" tab
4. Update `CLIENT_ORIGIN` with your Vercel URL from Step 3
5. Save (this will redeploy automatically)

## Step 5: Test Your Deployment

1. Visit your Vercel URL
2. Register a new account
3. Login
4. Add a friend and send a note
5. ✅ Success!

## Troubleshooting

- **CORS errors?** Make sure `CLIENT_ORIGIN` on backend matches your Vercel URL exactly
- **Backend not connecting?** Check your MongoDB connection string and IP whitelist
- **Render cold starts?** Free tier services sleep after inactivity - first request may take 30-60 seconds

## URLs to Configure

| Service | Environment Variable | Value |
|---------|---------------------|-------|
| Render Backend | `CLIENT_ORIGIN` | Your Vercel frontend URL |
| Vercel Frontend | `VITE_API_BASE_URL` | Your Render backend URL |

Both services will auto-deploy when you push to the `main` branch!

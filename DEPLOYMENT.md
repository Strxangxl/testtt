# Deployment Guide

This guide covers deploying the Urgent Note Sender MERN application with the frontend on Vercel and the backend on Render.

## Prerequisites

- GitHub repository connected to Vercel and Render
- MongoDB Atlas account (for production database)
- Vercel account
- Render account

## Backend Deployment (Render)

### 1. Set up MongoDB Atlas

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster (or use an existing one)
3. Create a database user with read/write permissions
4. Get your connection string (it should look like: `mongodb+srv://username:password@cluster.mongodb.net/urgent-note-sender?retryWrites=true&w=majority`)
5. Add `0.0.0.0/0` to the IP whitelist (for Render to connect)

### 2. Deploy to Render

#### Option A: Using the Dashboard

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "New +" and select "Web Service"
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: `urgent-note-sender-backend`
   - **Region**: Oregon (US West) or your preferred region
   - **Branch**: `main`
   - **Root Directory**: Leave blank (we'll use build/start commands with cd)
   - **Runtime**: Node
   - **Build Command**: `cd server && npm install`
   - **Start Command**: `cd server && npm start`
   - **Instance Type**: Free (or your preference)

5. Add Environment Variables:
   - `PORT`: `10000` (Render uses this port by default)
   - `MONGO_URI`: Your MongoDB Atlas connection string
   - `JWT_SECRET`: Generate a secure random string (e.g., use `openssl rand -base64 32`)
   - `CLIENT_ORIGIN`: (Leave blank for now, we'll add this after frontend deployment)
   - `NODE_ENV`: `production`

6. Click "Create Web Service"
7. Wait for the deployment to complete
8. Note your backend URL (e.g., `https://urgent-note-sender-backend.onrender.com`)

#### Option B: Using render.yaml

The repository includes a `render.yaml` file for automated deployment:

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "New +" and select "Blueprint"
3. Connect your GitHub repository
4. Render will detect the `render.yaml` file
5. Configure the required environment variables:
   - `MONGO_URI`: Your MongoDB Atlas connection string
   - `CLIENT_ORIGIN`: (Add after frontend deployment)
6. Click "Apply" to deploy

### 3. Verify Backend Deployment

Visit `https://your-backend-url.onrender.com/health` - you should see:
```json
{"status": "ok"}
```

## Frontend Deployment (Vercel)

### 1. Deploy to Vercel

#### Option A: Using Vercel CLI

```bash
# Install Vercel CLI if you haven't already
npm i -g vercel

# Login to Vercel
vercel login

# Deploy from the project root
vercel

# Follow the prompts:
# - Set up and deploy? Yes
# - Which scope? Your account/team
# - Link to existing project? No
# - Project name? urgent-note-sender (or your preferred name)
# - Directory? ./ (root)
# - Override settings? No

# For production deployment
vercel --prod
```

#### Option B: Using Vercel Dashboard

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New..." → "Project"
3. Import your GitHub repository
4. Configure the project:
   - **Framework Preset**: Vite
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

5. Add Environment Variable:
   - `VITE_API_BASE_URL`: Your Render backend URL (e.g., `https://urgent-note-sender-backend.onrender.com`)

6. Click "Deploy"
7. Wait for deployment to complete
8. Note your frontend URL (e.g., `https://urgent-note-sender.vercel.app`)

### 2. Update Backend CORS Configuration

1. Go back to your Render dashboard
2. Navigate to your backend service
3. Go to "Environment" tab
4. Update the `CLIENT_ORIGIN` variable:
   - Set it to your Vercel frontend URL (e.g., `https://urgent-note-sender.vercel.app`)
5. Save changes (this will trigger a redeployment)

### 3. Verify Frontend Deployment

1. Visit your Vercel URL
2. Register a new account
3. Test the authentication flow
4. Add a friend and send a note
5. Verify that real-time notifications work

## Post-Deployment Configuration

### Configure Custom Domains (Optional)

#### Vercel (Frontend)
1. Go to Project Settings → Domains
2. Add your custom domain
3. Configure DNS as instructed by Vercel

#### Render (Backend)
1. Go to your service → Settings
2. Click "Custom Domains"
3. Add your custom domain
4. Configure DNS with the provided CNAME record
5. Update `CLIENT_ORIGIN` and `VITE_API_BASE_URL` accordingly

### Security Considerations

1. **JWT_SECRET**: Ensure you're using a strong, randomly generated secret in production
2. **MongoDB**: Use a strong password and enable IP whitelisting if possible
3. **CORS**: Keep `CLIENT_ORIGIN` limited to your actual frontend domain(s)
4. **HTTPS**: Both Vercel and Render provide HTTPS by default - ensure all API calls use HTTPS

### Monitoring and Logs

#### Render Logs
- Go to your service in Render dashboard
- Click "Logs" tab to view real-time logs
- Use for debugging backend issues

#### Vercel Logs
- Go to your project in Vercel dashboard
- Click on a deployment → "Functions" or "Build Logs"
- Use for debugging frontend build or runtime issues

## Environment Variables Summary

### Backend (Render)
```
PORT=10000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/urgent-note-sender?retryWrites=true&w=majority
JWT_SECRET=your-random-secret-at-least-32-chars
CLIENT_ORIGIN=https://your-frontend.vercel.app
NODE_ENV=production
```

### Frontend (Vercel)
```
VITE_API_BASE_URL=https://your-backend.onrender.com
```

## Troubleshooting

### Backend not connecting to MongoDB
- Verify MongoDB Atlas connection string is correct
- Check IP whitelist includes `0.0.0.0/0`
- Check database user credentials

### CORS errors in browser
- Verify `CLIENT_ORIGIN` on backend matches your Vercel URL exactly
- Make sure backend has been redeployed after updating `CLIENT_ORIGIN`
- Check browser console for the exact origin being sent

### Frontend can't reach backend
- Verify `VITE_API_BASE_URL` is set correctly on Vercel
- Check backend `/health` endpoint is accessible
- Ensure backend service is running on Render

### Cold starts on Render (Free tier)
- Free tier services spin down after inactivity
- First request after inactivity may take 30-60 seconds
- Consider upgrading to paid tier for production use

## Continuous Deployment

Both Vercel and Render support automatic deployments:

- **Vercel**: Automatically deploys on push to `main` branch (frontend)
- **Render**: Automatically deploys on push to `main` branch (backend)

To enable/configure:
1. Ensure your repository is connected to both services
2. Both services will watch for changes to your repository
3. Push to `main` branch will trigger automatic deployments

## Useful Commands

```bash
# View backend logs
# (Go to Render dashboard → your service → Logs)

# View frontend deployment logs
# (Go to Vercel dashboard → your project → deployments → select deployment)

# Redeploy backend manually
# (Go to Render dashboard → your service → Manual Deploy → "Deploy latest commit")

# Redeploy frontend manually
# (Go to Vercel dashboard → your project → deployments → "Redeploy")
```

## Success Checklist

- [ ] MongoDB Atlas cluster created and connection string obtained
- [ ] Backend deployed to Render with all environment variables set
- [ ] Backend health check endpoint returns `{"status": "ok"}`
- [ ] Frontend deployed to Vercel with API URL configured
- [ ] Frontend can load and displays login/register page
- [ ] User registration works
- [ ] User login works
- [ ] Friend requests can be sent and accepted
- [ ] Notes can be sent and received
- [ ] Real-time notifications appear in inbox
- [ ] Browser notifications prompt appears (if supported)
- [ ] Both services have automatic deployment enabled

## Next Steps

- Set up custom domains (optional)
- Configure monitoring and alerting
- Set up backup strategy for MongoDB
- Consider upgrading to paid tiers for production workloads
- Implement rate limiting for API endpoints
- Add analytics tracking

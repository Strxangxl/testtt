# Deployment Checklist

Use this checklist to ensure your deployment is complete and successful.

## Pre-Deployment

- [ ] Repository is pushed to GitHub
- [ ] PR #1 has been merged to `main` branch
- [ ] MongoDB Atlas account created
- [ ] Vercel account created
- [ ] Render account created

## MongoDB Atlas Setup

- [ ] Cluster created
- [ ] Database user created with strong password
- [ ] IP whitelist configured (0.0.0.0/0 for Render)
- [ ] Connection string copied and saved securely

## Backend Deployment (Render)

- [ ] New Web Service created on Render
- [ ] GitHub repository connected
- [ ] Build command set: `cd server && npm install`
- [ ] Start command set: `cd server && npm start`
- [ ] Environment variables configured:
  - [ ] `PORT` = `10000`
  - [ ] `MONGO_URI` = MongoDB Atlas connection string
  - [ ] `JWT_SECRET` = Random 32+ character string
  - [ ] `CLIENT_ORIGIN` = (will add after frontend deployment)
  - [ ] `NODE_ENV` = `production`
- [ ] Service deployed successfully
- [ ] Backend URL noted: `https://_____.onrender.com`
- [ ] Health check endpoint tested: `/health` returns `{"status":"ok"}`

## Frontend Deployment (Vercel)

- [ ] New Project created on Vercel
- [ ] GitHub repository imported
- [ ] Root Directory set to: `client`
- [ ] Framework Preset: Vite
- [ ] Build Command: `npm run build`
- [ ] Output Directory: `dist`
- [ ] Environment variable configured:
  - [ ] `VITE_API_BASE_URL` = Render backend URL
- [ ] Project deployed successfully
- [ ] Frontend URL noted: `https://_____.vercel.app`
- [ ] App loads in browser

## CORS Configuration

- [ ] Returned to Render dashboard
- [ ] Opened backend service settings
- [ ] Updated `CLIENT_ORIGIN` with Vercel URL
- [ ] Backend service redeployed
- [ ] CORS working (no errors in browser console)

## Functional Testing

- [ ] User registration works
- [ ] User login works
- [ ] Dashboard loads after login
- [ ] Friend request can be sent
- [ ] Friend request appears for recipient
- [ ] Friend request can be accepted
- [ ] Note can be composed and sent
- [ ] Note appears in recipient's inbox
- [ ] Real-time notification arrives
- [ ] Browser notification permission prompt appears
- [ ] Read receipt works when note is viewed
- [ ] Note disappears after 24 hours (or verify TTL is set)

## Auto-Deployment Setup

- [ ] Vercel connected to GitHub repository
- [ ] Render connected to GitHub repository
- [ ] Test: Push to `main` branch triggers deployments
- [ ] Verified both services auto-deploy successfully

## Optional Enhancements

- [ ] Custom domain configured on Vercel
- [ ] Custom domain configured on Render
- [ ] Environment variables updated with custom domains
- [ ] SSL certificates verified for custom domains
- [ ] Monitoring/alerting configured
- [ ] Backup strategy for MongoDB implemented

## Documentation

- [ ] Backend URL documented for team
- [ ] Frontend URL documented for team
- [ ] Environment variables documented securely
- [ ] MongoDB credentials stored securely (password manager)
- [ ] Deployment process documented for future reference

## Post-Deployment

- [ ] Sent test note to verify end-to-end functionality
- [ ] Monitored logs for any errors
- [ ] Informed stakeholders of deployment
- [ ] Updated any relevant documentation with production URLs

---

## Quick Reference URLs

| Service | URL |
|---------|-----|
| Frontend (Vercel) | `https://_____.vercel.app` |
| Backend (Render) | `https://_____.onrender.com` |
| MongoDB Atlas | https://cloud.mongodb.com |
| Vercel Dashboard | https://vercel.com/dashboard |
| Render Dashboard | https://dashboard.render.com |

## Support

If you encounter issues:
1. Check the [DEPLOYMENT.md](DEPLOYMENT.md) troubleshooting section
2. Review service logs (Render → Logs, Vercel → Deployments → Logs)
3. Verify all environment variables are set correctly
4. Test the `/health` endpoint on the backend
5. Check browser console for CORS or network errors

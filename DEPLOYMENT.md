# 🚀 Deployment Guide - Healthcare App

This guide covers deploying the complete Healthcare application to make it accessible online. We'll use **free tier** services where possible.

## 📋 Deployment Overview

| Component | Service | Free Tier? | URL Format |
|-----------|---------|------------|------------|
| Database | MongoDB Atlas | ✅ 512MB | `mongodb+srv://...` |
| Backend | Railway / Render | ✅ Limited | `https://api.yourapp.com` |
| Web Frontend | Vercel / Netlify | ✅ Unlimited | `https://yourapp.vercel.app` |
| Mobile | Expo EAS | ✅ 15 builds/mo | App Store / Play Store |

---

## Step 1: Database - MongoDB Atlas (Free)

### 1.1 Create Account
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up with Google or email
3. Choose the **FREE** M0 tier

### 1.2 Create Cluster
1. Click "Build a Database"
2. Select **M0 Free Tier**
3. Choose provider: AWS, region: Mumbai (ap-south-1) or closest
4. Cluster name: `healthcare-cluster`

### 1.3 Configure Access
1. **Database Access** → Add Database User
   - Username: `healthcare_admin`
   - Password: Auto-generate (save it!)
   - Role: Read and write to any database

2. **Network Access** → Add IP Address
   - Click "Allow Access from Anywhere" (0.0.0.0/0)
   - For production, whitelist specific IPs

### 1.4 Get Connection String
1. Click "Connect" → "Connect your application"
2. Copy the connection string:
   ```
   mongodb+srv://healthcare_admin:<password>@healthcare-cluster.xxxxx.mongodb.net/healthcare?retryWrites=true&w=majority
   ```
3. Replace `<password>` with your actual password

---

## Step 2: Backend - Render (Free)

### 2.1 Prepare Backend
Add a `render.yaml` file to your project root:

```yaml
# render.yaml
services:
  - type: web
    name: healthcare-api
    env: node
    region: singapore  # closest to India
    plan: free
    buildCommand: cd backend && npm install
    startCommand: cd backend && node src/index.js
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 10000
      - key: MONGODB_URI
        sync: false  # Set manually in dashboard
      - key: JWT_SECRET
        generateValue: true
      - key: LLM_PROVIDER
        value: openai
      - key: OPENAI_API_KEY
        sync: false  # Set manually
```

### 2.2 Deploy to Render
1. Go to [Render.com](https://render.com) and sign up
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: `healthcare-api`
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `node src/index.js`
5. Add Environment Variables:
   - `MONGODB_URI`: Your MongoDB Atlas connection string
   - `JWT_SECRET`: Generate a secure random string (32+ chars)
   - `OPENAI_API_KEY`: Your OpenAI API key (optional)
   - `NODE_ENV`: `production`
6. Click "Create Web Service"

Your API will be available at: `https://healthcare-api.onrender.com`

> ⚠️ **Note**: Free tier spins down after 15 min of inactivity. First request may take 30-60 seconds.

---

## Step 3: Web Frontend - Vercel (Free)

### 3.1 Prepare Frontend
Update `web/.env.production`:

```env
VITE_API_URL=https://healthcare-api.onrender.com/api
```

### 3.2 Deploy to Vercel
1. Go to [Vercel.com](https://vercel.com) and sign up with GitHub
2. Click "Add New Project"
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `web`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Add Environment Variable:
   - `VITE_API_URL`: `https://healthcare-api.onrender.com/api`
6. Click "Deploy"

Your web app will be at: `https://healthcare-web.vercel.app`

### 3.3 Custom Domain (Optional)
1. Go to Project Settings → Domains
2. Add your domain (e.g., `health.yourdomain.com`)
3. Update DNS records as instructed

---

## Step 4: Mobile App - Expo EAS

### 4.1 Install EAS CLI
```bash
npm install -g eas-cli
eas login
```

### 4.2 Configure EAS Build
Create `mobile/eas.json`:

```json
{
  "cli": {
    "version": ">= 5.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "app-bundle"
      },
      "ios": {
        "resourceClass": "m1-medium"
      }
    }
  },
  "submit": {
    "production": {}
  }
}
```

### 4.3 Update API URL
Edit `mobile/src/services/api.js`:

```javascript
const API_BASE_URL = 'https://healthcare-api.onrender.com/api';
```

### 4.4 Build APK (Android)
```bash
cd mobile
eas build --platform android --profile preview
```

This creates a downloadable APK you can share directly!

### 4.5 Build for App Stores (Production)
```bash
# Android (Play Store)
eas build --platform android --profile production

# iOS (App Store) - requires Apple Developer account ($99/year)
eas build --platform ios --profile production
```

---

## Step 5: Environment Variables Summary

### Backend (Render)
| Variable | Value |
|----------|-------|
| `NODE_ENV` | `production` |
| `PORT` | `10000` (Render default) |
| `MONGODB_URI` | Your Atlas connection string |
| `JWT_SECRET` | Random 32+ char string |
| `JWT_EXPIRES_IN` | `1h` |
| `JWT_REFRESH_EXPIRES_IN` | `7d` |
| `LLM_PROVIDER` | `openai` |
| `OPENAI_API_KEY` | Your OpenAI key |
| `MODERATION_ENABLED` | `true` |

### Web Frontend (Vercel)
| Variable | Value |
|----------|-------|
| `VITE_API_URL` | `https://your-api.onrender.com/api` |

---

## Step 6: Post-Deployment Checklist

### ✅ Database
- [ ] MongoDB Atlas cluster created
- [ ] Database user with read/write access
- [ ] Network access configured (0.0.0.0/0 or specific IPs)
- [ ] Connection string copied

### ✅ Backend
- [ ] Deployed to Render/Railway
- [ ] Environment variables set
- [ ] Health check working: `https://your-api.onrender.com/health`
- [ ] API responding: `https://your-api.onrender.com/api`

### ✅ Web Frontend
- [ ] Deployed to Vercel/Netlify
- [ ] API URL environment variable set
- [ ] Login/Register working
- [ ] Chat functionality working

### ✅ Mobile (Optional)
- [ ] EAS configured
- [ ] Preview APK built
- [ ] App functioning with production API

---

## 💰 Cost Estimates

### Free Tier (Development/Demo)
| Service | Monthly Cost |
|---------|-------------|
| MongoDB Atlas M0 | $0 |
| Render Free | $0 |
| Vercel Hobby | $0 |
| Expo EAS | $0 (15 builds) |
| **Total** | **$0** |

### Production (Small Scale ~1000 users)
| Service | Monthly Cost |
|---------|-------------|
| MongoDB Atlas M10 | $57 |
| Render Starter | $7 |
| Vercel Pro | $20 |
| OpenAI API | ~$10-50 |
| **Total** | **~$94-134** |

---

## 🔧 Troubleshooting

### Backend won't start
1. Check Render logs for errors
2. Verify `MONGODB_URI` is correct
3. Ensure `PORT` is set (Render uses `10000`)

### CORS errors
Add your frontend URL to backend CORS config:
```javascript
// backend/src/index.js
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://healthcare-web.vercel.app',
    'https://your-custom-domain.com'
  ]
}));
```

### MongoDB connection fails
1. Check IP whitelist in Atlas
2. Verify username/password
3. Ensure cluster is running

### Slow first request
Free tier services spin down. First request takes 30-60s. For production, upgrade to paid tier.

---

## 🎯 Quick Deploy Commands

```bash
# 1. Push to GitHub (triggers auto-deploy)
git add .
git commit -m "Ready for deployment"
git push origin main

# 2. Seed production database
cd backend
NODE_ENV=production MONGODB_URI="your-atlas-uri" node ../seed/seed.js

# 3. Build mobile APK
cd mobile
eas build --platform android --profile preview
```

---

## 📱 Sharing the App

### Web App
Share the Vercel URL: `https://healthcare-web.vercel.app`

### Mobile APK
1. Download APK from EAS build
2. Share via Google Drive, Dropbox, or direct link
3. Users install by enabling "Install from Unknown Sources"

### Play Store (Optional)
1. Create Google Play Developer account ($25 one-time)
2. Upload AAB from EAS production build
3. Complete store listing and submit for review

---

**🎉 Congratulations! Your Healthcare app is now live!**

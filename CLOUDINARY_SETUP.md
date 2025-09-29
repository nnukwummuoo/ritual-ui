# Cloudinary Setup Guide

## Current Issue
The Cloudinary upload is failing with a 400 Bad Request error because we need to set up an unsigned upload preset.

## Quick Fix (Temporary)
I've added a fallback that converts images to data URLs, so profile updates will work even without Cloudinary.

## Permanent Solution - Set up Cloudinary Upload Preset

### Step 1: Go to Cloudinary Dashboard
1. Visit [https://cloudinary.com/console](https://cloudinary.com/console)
2. Log in with your account
3. Go to your dashboard

### Step 2: Create Upload Preset
1. Go to **Settings** → **Upload** → **Upload presets**
2. Click **"Add upload preset"**
3. Configure the preset:
   - **Preset name**: `ml_default` (or change the name in the code)
   - **Signing Mode**: Select **"Unsigned"**
   - **Folder**: `profile-images` (optional)
   - **Access mode**: **Public**
   - **Resource type**: **Image**
   - **Transformations**: Leave default or add any you want

### Step 3: Update the Code (if needed)
If you use a different preset name, update this line in `src/utils/cloudinary.ts`:
```typescript
uploadPreset: 'your_preset_name_here'
```

### Step 4: Test the Upload
Once the preset is created, the Cloudinary uploads should work properly.

## Current Fallback
Until you set up the upload preset, the system will:
1. Try to upload to Cloudinary
2. If it fails, convert the image to a data URL
3. Store the data URL in the database
4. Allow profile updates to work normally

## Benefits of Cloudinary
- Image optimization and compression
- Multiple format delivery (WebP, AVIF, etc.)
- Responsive images
- CDN delivery for faster loading
- Image transformations

## Current Status
✅ **Working**: Profile updates with temporary data URL fallback
🔄 **In Progress**: Setting up proper Cloudinary upload preset

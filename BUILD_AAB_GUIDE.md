# Build Android App Bundle (AAB) for Google Play Store

## Quick Build (Using PWABuilder - RECOMMENDED)

**This is the easiest way:**

1. Go to **https://www.pwabuilder.com/**
2. Enter your URL: `https://cheppuai.netlify.app`
3. Click **"Start"**
4. In the results, click **"Package For Stores"**
5. Select **"Android"**
6. Choose **"Generate"**
7. Download the **`.aab`** file (App Bundle)
8. Upload directly to Google Play Console!

---

## Manual Build (Using Gradle)

If you want to build manually from this Android project:

### Prerequisites
- Install **Android Studio**
- Install **Java JDK 17** or higher

### Steps

#### 1. Generate a Signing Key (First Time Only)

```powershell
keytool -genkey -v -keystore cheppu-release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias cheppu-key
```

**Important:** Save the keystore file and password securely!

#### 2. Create `keystore.properties`

Create a file named `keystore.properties` in the project root:

```properties
storePassword=YOUR_KEYSTORE_PASSWORD
keyPassword=YOUR_KEY_PASSWORD
keyAlias=cheppu-key
storeFile=cheppu-release-key.jks
```

**Don't commit this file to Git!**

#### 3. Build the App Bundle

```powershell
# Clean build
./gradlew clean

# Build release AAB
./gradlew bundleRelease
```

#### 4. Find Your AAB File

The AAB will be located at:
```
app/build/outputs/bundle/release/app-release.aab
```

---

## Upload to Google Play Store

1. Go to **Google Play Console**: https://play.google.com/console
2. Create a new app or select existing
3. Go to **"Release" → "Production"**
4. Click **"Create new release"**
5. Upload your **`.aab`** file
6. Fill in release details
7. Review and rollout!

---

## Important Notes

### Digital Asset Links
✅ Already configured at:
- `https://cheppuai.netlify.app/.well-known/assetlinks.json`
- SHA256: `FA:C6:17:45:DC:09:03:78:6F:87:E5:A8:F2:39:3A:38:10:6F:B9:29:D9:F8:7F:3B:70:73:27:27:59:12:42:B0`
- Package: `com.cheppu.ai`

### App Details for Play Store
- **Package Name:** com.cheppu.ai
- **App Name:** Cheppu AI
- **Version Code:** 1
- **Version Name:** 1.0.0
- **Min SDK:** 21 (Android 5.0)
- **Target SDK:** 34 (Android 14)

### Before Submitting
- [ ] Add app description (short & full)
- [ ] Upload app icon (512x512 PNG)
- [ ] Upload feature graphic (1024x500)
- [ ] Add screenshots (at least 2)
- [ ] Set content rating
- [ ] Add privacy policy URL
- [ ] Complete store listing

---

## Troubleshooting

### "Unsigned AAB"
- If using PWABuilder, the AAB is already signed with their key
- For manual build, ensure signing config is set in `build.gradle`

### "Package name conflicts"
- Make sure package name is `com.cheppu.ai` everywhere
- Check `AndroidManifest.xml` and `build.gradle`

### "Digital Asset Links verification failed"
- Verify file is accessible: https://cheppuai.netlify.app/.well-known/assetlinks.json
- SHA256 must match your signing key
- Wait 5-10 minutes for Android to verify

---

## Quick Commands

```powershell
# Check if Gradle works
./gradlew --version

# List all tasks
./gradlew tasks

# Build debug APK (for testing)
./gradlew assembleDebug

# Build release AAB (for Play Store)
./gradlew bundleRelease

# Install debug APK to connected device
./gradlew installDebug
```

---

**Recommended: Use PWABuilder for easiest AAB generation!**

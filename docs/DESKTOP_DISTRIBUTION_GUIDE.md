# Orion-9 Desktop Workstation — Packaging, Code Signing & Distribution Architecture

## 1. Overview
Orion-9 is built with **Tauri v2** (`tech.orion9.desktop`) paired with a high-performance React + TypeScript frontend. It delivers native performance, isolated memory boundaries, and zero-trust single sign-on integration.

- **Frontend Core**: React 19 + TypeScript + Vite
- **Native Host**: Tauri v2 (Rust 1.78+)
- **Windows Runtime**: Microsoft Edge WebView2
- **macOS Runtime**: Native WebKit (WKWebView)

---

## 2. Directory Structure & Existing Assets
- **Desktop Application Source**: `D:\ANtigravity\Orion 9`
- **Tauri Configuration**: `D:\ANtigravity\Orion 9\src-tauri\tauri.conf.json`
- **Compiled Windows NSIS Installer**: `D:\ANtigravity\Orion 9\src-tauri\target\release\bundle\nsis\Orion-9_9.0.0_x64-setup.exe` (30,336,791 bytes)
  - **SHA-256**: `e2dfeb480522b9da077bb58e0954d6d8e09f1023fb6af28b8b74b2a8dc23ee70`
- **Compiled Windows MSI Package**: `D:\ANtigravity\Orion 9\src-tauri\target\release\bundle\msi\Orion-9_9.0.0_x64_en-US.msi` (31,117,312 bytes)
  - **SHA-256**: `35d4855010fe340b9c4b23b1f576754eeec36ee0cbbce4fb448cb372e211b49c`
- **Website Public Downloads**: `d:\ANtigravity\Website\public\downloads\`

---

## 3. Windows Packaging & Authenticode Signing

### 3.1 Build Command
From `D:\ANtigravity\Orion 9`:
```bash
# Install frontend and Rust dependencies
npm install

# Build release packages (NSIS .exe and WiX .msi)
npm run tauri build -- --bundles nsis,msi
```

### 3.2 Microsoft Authenticode Signing
Windows requires Authenticode digital signatures to prevent Microsoft SmartScreen warnings.
```powershell
# Sign with Hardware Security Module (HSM) or EV Code Signing Certificate
signtool.exe sign `
  /tr http://timestamp.digicert.com `
  /td sha256 `
  /fd sha256 `
  /a `
  /v "D:\ANtigravity\Orion 9\src-tauri\target\release\bundle\nsis\Orion-9_9.0.0_x64-setup.exe"
```

---

## 4. macOS Packaging, Apple Developer Signing & Notarization

### 4.1 Target Architectures
Tauri v2 supports:
1. **Apple Silicon (`aarch64-apple-darwin`)**: Native for M1, M2, M3, M4 Macs.
2. **Intel (`x86_64-apple-darwin`)**: For legacy Intel Macs.
3. **Universal 2 (`universal-apple-darwin`)**: Fat binary containing both architectures using `lipo`.

### 4.2 Build Commands (on macOS runner)
```bash
# 1. Install Rust targets
rustup target add aarch64-apple-darwin
rustup target add x86_64-apple-darwin

# 2. Build Universal DMG
npm run tauri build -- --target universal-apple-darwin --bundles dmg,app

# Output DMG:
# src-tauri/target/universal-apple-darwin/release/bundle/dmg/Orion-9_9.0.0_universal.dmg
```

### 4.3 Code Signing (Apple Developer ID)
```bash
# Set environment variables for Tauri automated signing
export APPLE_CERTIFICATE="<base64-encoded-Developer-ID-Application.p12>"
export APPLE_CERTIFICATE_PASSWORD="<p12-password>"
export APPLE_SIGNING_IDENTITY="Developer ID Application: Orion Systems Inc (TEAMID)"

# Or manual codesign:
codesign --deep --force --options runtime --sign "Developer ID Application: Orion Systems Inc (TEAMID)" \
  "src-tauri/target/universal-apple-darwin/release/bundle/macos/Orion-9.app"
```

### 4.4 Apple Notarization (`notarytool`)
Gatekeeper on macOS requires notarization for all distributed `.dmg` and `.pkg` files:
```bash
# Submit for notarization
xcrun notarytool submit \
  "src-tauri/target/universal-apple-darwin/release/bundle/dmg/Orion-9_9.0.0_universal.dmg" \
  --apple-id "security@orion9.tech" \
  --team-id "TEAMID" \
  --password "app-specific-apple-id-password" \
  --wait

# Staple notarization ticket to DMG
xcrun stapler staple "src-tauri/target/universal-apple-darwin/release/bundle/dmg/Orion-9_9.0.0_universal.dmg"

# Verify Gatekeeper assessment
spctl -a -t open --context context:primary-signature -v "src-tauri/target/universal-apple-darwin/release/bundle/dmg/Orion-9_9.0.0_universal.dmg"
```

---

## 5. Security & Access Control Policy
1. **Gated Downloads**: Logged-out users clicking any desktop download trigger are routed to `/login?redirect=/download&platform=...`.
2. **Anti-SPA Fallback Protection**: Binary streaming triggers inspect `Content-Type` headers to prevent returning HTML single-page app fallbacks as downloads.
3. **Cryptographic Verification**: Every release card displays the exact SHA-256 hash alongside terminal verification commands (`Get-FileHash` / `shasum -a 256`).
4. **Lifecycle Enforcement**:
   - `published`: Publicly downloadable by authenticated users.
   - `draft`: Only visible and downloadable by verified administrators.
   - `disabled`: Blocked immediately from client downloads.
   - `retired`: Permanently archived; blocked from downloads.

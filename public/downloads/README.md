# Orion-9 Desktop Binary Distribution Directory

This directory hosts compiled Orion-9 workstation binaries for local verification and edge staging.

Large binaries (`*.exe`, `*.msi`, `*.dmg`, `*.pkg`) are ignored by git in compliance with security and repository size guidelines.
For production distributions, upload these packages to your Cloudflare R2 or Firebase / Google Cloud Storage bucket and configure the release URL in the Admin Console (`/admin` -> Desktop Releases).

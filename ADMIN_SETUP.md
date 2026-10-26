# Orion-9 Administrator Authentication & RBAC Setup

Orion-9 enforces administrator access through **Firebase Authentication** and **Cloud Firestore Security Rules** (`firestore.rules`). No hardcoded passwords, secret keys, or backdoor credentials exist in the client application.

## Connected Firebase Project
- **Project ID**: `orion9-dev-db-2026`
- **Auth Domain**: `orion9-dev-db-2026.firebaseapp.com`

## How Administrator Authorization Works

When a user signs in at `/admin/login` (via Email/Password or Google Workspace SSO), `verifyAdminAuthorization()` and `firestore.rules` verify whether the authenticated account holds administrator privileges through one of three mechanisms:

1. **Bootstrapped Project Owner**:
   - Signing in with the verified project owner email (`ayushprakash0021@gmail.com`, with `email_verified == true`) automatically grants administrator privileges in both the client and `firestore.rules`.

2. **Firestore Administrator ACL Registry (`/admins/{uid}`)**:
   - To authorize any Firebase Authentication user as an administrator:
     1. Have the user register an account at `/signup` (or create the user in the Firebase Authentication console) and copy their Firebase `uid`.
     2. In Cloud Firestore (or via an existing administrator in the Orion-9 Admin Console -> **Admin Access** tab), create a document at `/admins/{uid}` with the following fields:
        ```json
        {
          "email": "admin@yourcompany.com",
          "role": "admin",
          "active": true
        }
        ```
     3. Return to `/admin/login` and click **Re-Verify Admin Role** or sign in with that account.

3. **Firebase Custom Token Claim**:
   - Accounts provisioned via Firebase Admin SDK with custom claim `{ "admin": true }` are also recognized immediately by both the client and `firestore.rules`.

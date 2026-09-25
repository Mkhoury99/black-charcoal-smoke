/* Free online catalog storage (Firebase Realtime Database).
 *
 * Setup (about 5 minutes, free Spark plan):
 * 1. Go to https://console.firebase.google.com/ and create a project
 * 2. Build → Realtime Database → Create database → start in test mode
 * 3. Project settings (gear) → Your apps → Web app → register → copy the config
 * 4. Paste your databaseURL below (looks like https://YOUR-PROJECT-default-rtdb.firebaseio.com)
 * 5. In Realtime Database → Rules, use:
 *    {
 *      "rules": {
 *        "catalog": {
 *          ".read": true,
 *          ".write": true
 *        }
 *      }
 *    }
 *    (Anyone with the site URL can write. Same trust model as the admin password
 *    already being in the page. Tighten later with Firebase Auth if you want.)
 * 6. Commit this file and push so GitHub Pages picks it up
 * 7. Open /admin/, sign in, Save once to upload your catalog to the cloud
 *
 * Leave databaseURL empty to keep the old this-browser-only localStorage mode.
 */
window.BCS_BACKEND = {
  // Example: "https://your-project-default-rtdb.firebaseio.com"
  databaseURL: ""
};

import admin from 'firebase-admin';

const noopMessaging = {
  sendEachForMulticast: async () => ({
    successCount: 0,
    failureCount: 0,
    responses: [],
  }),
};

const noopAdmin = {
  auth: () => ({
    verifyIdToken: async () => {
      throw new Error('Firebase not initialized');
    },
  }),
  messaging: () => noopMessaging,
};

let cachedAdmin = null;

function initializeFirebase() {
  if (cachedAdmin) return cachedAdmin;

  try {
    if (!admin.apps.length) {
      const raw = process.env.FIREBASE_SERVICE_ACCOUNT || '';
      if (!raw) {
        console.warn('FCM not configured: FIREBASE_SERVICE_ACCOUNT is missing. Notifications disabled.');
        cachedAdmin = noopAdmin;
        return cachedAdmin;
      }
      const parsed = JSON.parse(raw);
      if (parsed.private_key) {
        parsed.private_key = parsed.private_key.replace(/\\n/g, '\n');
      }
      admin.initializeApp({ credential: admin.credential.cert(parsed) });
    }
    cachedAdmin = admin;
  } catch (err) {
    console.error('FCM init failed. Notifications disabled:', err.message);
    cachedAdmin = noopAdmin;
  }

  return cachedAdmin;
}

export default new Proxy(
  {},
  {
    get(_target, prop) {
      const instance = initializeFirebase();
      const value = instance[prop];
      return typeof value === 'function' ? value.bind(instance) : value;
    },
  }
);

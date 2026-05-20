import admin from "firebase-admin";

function makeMissingProxy(name: string) {
  return new Proxy(
    {},
    {
      get() {
        throw new Error(
          `Firebase admin ${name} is not initialized. Set FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL and FIREBASE_ADMIN_PRIVATE_KEY in the environment (Vercel Project Settings).`
        );
      },
    }
  );
}

// Prevent re-initialization across hot reloads in Next.js dev
if (!admin.apps.length) {
  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKeyRaw = process.env.FIREBASE_ADMIN_PRIVATE_KEY;

  if (projectId && clientEmail && privateKeyRaw) {
    const privateKey = privateKeyRaw.replace(/\\n/g, "\n");
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });
  } else {
    // Don't initialize during builds where credentials are not available.
    // This prevents hard failures during Next.js build on platforms like Vercel
    // when environment variables are only set at runtime.
    // Log a clear warning so it's easy to diagnose.
    // eslint-disable-next-line no-console
    console.warn(
      "Firebase admin credentials not found in environment — skipping initialization. " +
        "Ensure FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL and FIREBASE_ADMIN_PRIVATE_KEY are set in production."
    );
  }
}

export const adminAuth = admin.apps.length ? admin.auth() : (makeMissingProxy("auth") as any);
export const adminDb = admin.apps.length ? admin.firestore() : (makeMissingProxy("firestore") as any);

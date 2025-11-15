// import express from "express";
// import 'dotenv/config';
// import cors from "cors";
// import { clerkMiddleware } from '@clerk/express';
// import { serve } from "inngest/express";
// import { inngest, functions } from "./inngest/index.js";

// const app = express();

// // General middlewares for normal API routes:
// app.use(cors({ origin: (o, cb) => cb(null, true), credentials: true }));

// // NOTE: we do NOT call app.use(express.json()) globally because
// // it consumes the raw request body that Inngest and webhook verifiers need.
// // For normal JSON endpoints, mount the json parser on those routes only.
// app.get("/", (req, res) => res.send("Server is live"));

// // --- Protect the routes that need Clerk with the middleware explicitly ---
// // Example: apply clerk to routes that require authentication only.
// // (Do not apply it globally if it interferes with webhook routes)
// app.use("/api/protected", express.json(), clerkMiddleware(), (req, res) => {
//   res.json({ ok: true, userId: req.auth?.userId || null });
// });

// // --- Important: mount Inngest with raw body parser for JSON ---
// /*
//   Inngest/Clerk webhooks expect the raw request body for signature verification.
//   Using express.json() globally will break verification and cause internal errors
//   that result in "Invalid JSON in response" on the Inngest dashboard.
// */
// app.use(
//   "/api/inngest",
//   // parse as raw bytes for content-type application/json
//   express.raw({ type: "application/json" }),
//   // optional small wrapper to log request for debugging
//   (req, res, next) => {
//     // Keep raw body available as req.rawBody for debugging if needed
//     // (req.body will be a Buffer because we used express.raw)
//     // console.log('Incoming Inngest request, raw length:', req.body?.length);
//     next();
//   },
//   // mount the inngest express handler
//   serve({
//     client: inngest,
//     functions,
//     // optional onError to capture and log server errors so Inngest gets proper info
//     onError(err, ctx) {
//       console.error("Inngest function error:", err);
//       // rethrow so Inngest treats it as failed invocation (and logs stack)
//       throw err;
//     },
//   })
// );

// // If you still have other JSON endpoints, mount express.json on those routes explicitly
// // e.g. app.use('/api/auth', express.json(), authRouter)

// // Start server
// const port = process.env.PORT || 5001;
// app.listen(port, () => {
//   console.log(`Server is running on port ${port}`);
// });










import express from "express";
import 'dotenv/config'
import cors from "cors";
import { clerkMiddleware } from '@clerk/express';
import { serve } from "inngest/express";
import { inngest, functions } from "./inngest/index.js"

const app = express();

app.use(express.json());
app.use(cors());
app.use(clerkMiddleware());

app.get('/', (req, res) => {
    res.send("Server is live")
})

app.use("/api/inngest", serve({ client: inngest, functions }));



const port = process.env.PORT || 5001;

app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
})


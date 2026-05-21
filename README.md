# GetAWay
> An AI-powered, browser-native interview proctoring platform.

![Next.js](https://img.shields.io/badge/Next.js-16.2.6-black?style=flat&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat&logo=typescript)
![Firebase](https://img.shields.io/badge/Firebase-Firestore-FFCA28?style=flat&logo=firebase)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=flat&logo=tailwind-css)
![Vercel](https://img.shields.io/badge/Vercel-Deployed-black?style=flat&logo=vercel)
![License](https://img.shields.io/badge/License-MIT-green?style=flat)

## Overview

Remote hiring demands efficiency, but it often sacrifices integrity. Recruiters struggle to monitor candidates during technical interviews without relying on invasive, third-party desktop surveillance software. Existing solutions cause friction. They force candidates to create accounts, download bulky applications, and grant system-level permissions just to complete a single interview. 

GetAWay solves this by moving proctoring entirely into the browser. We built a live WebRTC video interview platform powered by real-time AI. The system monitors candidate environments, audio streams, and physical behaviors locally in the browser using MediaPipe and the Web Audio API. It detects multiple people in the frame, gaze deviations, poor lighting, muted microphones, and suspicious audio activity. 

GetAWay eliminates candidate friction. Candidates join sessions through a secure, one-time password (OTP) sent via email. They never create an account. For recruiters, GetAWay delivers actionable intelligence. Interviewers receive live alerts during the session and review comprehensive trust scores and analytical reports afterward. GetAWay protects interview integrity without compromising the candidate experience.

## Live Demo

Explore the live application: [GetAWay on Vercel](https://get-a-way.vercel.app/)  
*Create a recruiter account to initialize a session, or use an email OTP to join an existing room as a candidate.*

## Features

### For Recruiters
* **Dashboard Analytics:** Track total interviews, candidate volume, and average session duration in real time.
* **Instant Session Creation:** Generate secure interview rooms and invite candidates instantly via automated OTP emails.
* **Live AI Proctor Panel:** View real-time warnings for face absence, multiple persons, gaze deviation, and audio anomalies during the session.
* **Automated Trust Scoring:** Evaluate candidates using a dynamic integrity score that updates automatically based on detected AI events.
* **Post-Session Reports:** Audit completed interviews using chronological event logs, violation breakdowns, and comprehensive session metrics.
* **Configurable Sensitivity:** Adjust AI detection thresholds and toggle specific monitoring features directly from the settings panel.

### For Candidates
* **Frictionless Entry:** Join interviews securely using only an email address and a one-time password.
* **Browser-Native:** Complete the entire interview in the browser without downloading desktop software or extensions.
* **Pre-flight Checks:** Validate camera, microphone, face visibility, and lighting automatically before entering the live session.

## Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Framework** | Next.js 16.2.6 (App Router) | React framework for server-side rendering and routing. |
| **Language** | TypeScript 5 (Strict Mode) | Static typing for 96.5% of the codebase to prevent runtime errors. |
| **Styling** | Tailwind CSS v4, shadcn/ui, Radix | Utility-first CSS and accessible, unstyled UI components. |
| **State** | Zustand v5 | Lightweight, unopinionated global state management. |
| **Database & Auth** | Firebase (Firestore, Auth, Admin) | Real-time database, secure user authentication, and server-side verification. |
| **Communication** | WebRTC & Nodemailer v8 | Browser-native peer-to-peer video and automated OTP email delivery. |
| **Analytics** | Recharts v3 | Composable charting library for dashboard metrics and session analytics. |
| **Validation** | Zod v4 | TypeScript-first schema declaration and data validation. |
| **Notifications** | Sonner v2 | Toast notification system for live alerts and user feedback. |
| **Deployment** | Vercel & Node.js 24.x | Seamless hosting, CI/CD pipeline, and serverless runtime. |

## Architecture Overview

GetAWay routes real-time video and proctoring data through a streamlined, secure flow.

```text
[Recruiter] 
   │
   ├─ Creates Session ───────────────┐
   │                                 ▼
   ├─ Firebase Auth            [Firestore] ───> rooms/{roomId}
   │                                 │
   ▼                                 ▼
[Email Server] <── OTP Invite ───────┘
   │
   ▼
[Candidate] ─── Submits OTP ──> [API/Admin SDK Validates]
   │
   ├─ Pre-flight Checks (Camera, Mic, Lighting)
   │
   ▼
[Live WebRTC Session] <── Signaling via Firestore (webrtc/{roomId}/signal)
   │
   ├─ In-Browser AI (MediaPipe, Web Audio API)
   │    ├─ Face/Pose Detection
   │    ├─ Gaze Tracking
   │    └─ Audio Analysis
   │
   ▼
[Firestore] ── writes events ──> rooms/{roomId}/proctor_events/{eventId}
   │
   ├─ Real-Time Sync ──> [Recruiter Proctor Panel] (Live Alerts & Trust Score)
   │
   ▼
[Post-Session] ──> rooms/{roomId}/report/{doc}
   │
   └─ [Recruiter Analytics] (Recharts Dashboards & Event Logs)
```

## Project Structure

```text
getAWay/
├── public/          # Static assets and images
├── src/
│   ├── api/         # API service layer and route handlers
│   ├── components/  # Reusable UI elements (shadcn/ui, base components)
│   ├── features/    # Domain-specific components (proctoring, dashboard)
│   ├── store/       # Zustand state management configurations
│   ├── styles/      # Global Tailwind CSS and utility classes
│   └── utils/       # Helper functions, validation, and formatters
```

## Getting Started

Follow these instructions to set up GetAWay on your local machine.

### Prerequisites
* **Node.js:** version 24.x or higher.
* **Firebase:** An active Firebase project with Authentication and Firestore enabled.
* **Email Server:** SMTP credentials for sending OTP invites (e.g., SendGrid, AWS SES, or Gmail).
* **Vercel CLI:** (Optional) For deployment.

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/SpicychieF05/getAWay.git
   cd getAWay
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   Create a `.env.local` file in the root directory and populate it with your credentials. See the environment variables section below.

4. **Start the development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Variables

Configure your `.env.local` file with the following keys:

```env
# Firebase Client SDK
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Firebase Admin SDK (Server-Side)
FIREBASE_ADMIN_PROJECT_ID=your_project_id
FIREBASE_ADMIN_PRIVATE_KEY="your_private_key_with_escaped_newlines"
FIREBASE_ADMIN_CLIENT_EMAIL=your_client_email@your_project.iam.gserviceaccount.com

# SMTP Email Configuration (Nodemailer)
SMTP_HOST=smtp.yourprovider.com
SMTP_PORT=587
SMTP_USER=your_smtp_username
SMTP_PASS=your_smtp_password
SMTP_FROM="GetAWay <noreply@getaway.com>"
```

## Deployment

Deploy GetAWay easily using Vercel and the Firebase CLI.

1. **Deploy to Vercel:**
   Connect your GitHub repository to Vercel. Add all environment variables listed above into the Vercel project settings. Vercel automatically handles deployments on every push to the main branch.

2. **Deploy Firebase Rules:**
   Ensure your Firestore security rules and indexes match the application requirements. Run the following command locally:
   ```bash
   firebase deploy --only firestore:rules,firestore:indexes
   ```

## Security Model

GetAWay enforces strict access controls to protect session data and user privacy.

| Resource | Access Rule | Authentication Method |
|----------|-------------|-----------------------|
| **Recruiter Profiles** | Read/Write scoped strictly to the authenticated `uid`. | Firebase Auth (Email/Password) |
| **Interview Rooms** | Read: Public (requires unguessable Room ID). Create: Auth Recruiter. | Firebase Auth (Create), Security by Obscurity (Read) |
| **OTP Generation** | Server-only creation; no client-side writes permitted. | Firebase Admin SDK |
| **WebRTC Signaling** | Open read/write, protected by cryptographically unguessable Room IDs. | Security by Obscurity |
| **Proctoring Events** | Open read/write for session participants, scoped to the active room. | In-session context |
| **Reports** | Open read/write during finalization; tied to the specific Room ID. | In-session context |

## Future Scope

Our roadmap expands GetAWay's AI capabilities to provide even deeper behavioral insights and automated workflows.

* **Image Capture:** Capture and store base64 thumbnails upon critical violations (e.g., multiple persons detected) to embed directly in post-session reports.
* **Candidate Ambient Alerts:** Display subtle UI cues (like a border pulse) to warn candidates of detected violations, encouraging self-correction without interviewer intervention.
* **AI Narrative Summaries:** Generate human-readable paragraph summaries of the candidate's session behavior using external LLM APIs (like Gemini or OpenAI).
* **Calendar Integration:** Connect with Google Calendar and Outlook to automatically schedule follow-up reviews when a candidate's integrity score drops below acceptable thresholds.
* **Advanced Multi-Voice Diarization:** Implement server-side audio chunk analysis to accurately detect multiple distinct speakers during the interview.

## Contributing

We welcome contributions to GetAWay. Follow this workflow to propose changes:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature/your-feature-name`).
3. Commit your changes (`git commit -m "Add your feature"`).
4. Push to the branch (`git push origin feature/your-feature-name`).
5. Open a Pull Request on GitHub.

Before contributing, please review our `AGENTS.md` file for strict project rules regarding Next.js patterns, Tailwind usage, and testing conventions.

## Acknowledgements

GetAWay is a BCA Final Year Project for the 2025-2026 academic session. We built this platform to demonstrate the practical application of modern web technologies, real-time communication, and edge AI in solving real-world hiring challenges.

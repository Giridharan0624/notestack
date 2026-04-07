# 📄 Product Requirements Document (PRD)

# 🧠 NoteStack — Serverless Notes & File Platform

---

# 1. 📌 Overview

**Product Name:** NoteStack
**Type:** Web Application (SaaS-style)
**Target Users:** Students, learners, individuals
**Platform:** Web (Next.js frontend + AWS serverless backend)

---

## 💡 Product Vision

NoteStack is a **secure, scalable, cloud-native note-taking platform** that enables users to:

* Create and manage notes
* Attach and store files
* Access content from anywhere
* Experience fast, reliable performance using serverless infrastructure

---

## 🎯 Goals

### Primary Goals

* Build a **production-grade serverless application**
* Demonstrate **Domain-Driven Design (DDD)**
* Enable secure **notes + file management**

### Secondary Goals

* AI-agent-friendly architecture
* Resume-worthy system design
* Easy extensibility (mobile, collaboration)

---

# 2. 🧰 Tech Stack

## 🌐 Frontend

* **Framework:** Next.js (App Router)
* **Language:** TypeScript
* **Styling:** Tailwind CSS
* **State Management:** React Hooks / Zustand (optional)
* **Auth:** Cognito JWT integration

---

## ⚙️ Backend (Serverless)

* **Runtime:** AWS Lambda (Python 3.11)
* **API:** AWS API Gateway (REST)
* **Architecture:** Domain-Driven Design (DDD)

---

## 🗄️ Database

* **Service:** DynamoDB (NoSQL)
* **Keys:**

  * Partition Key → `userId`
  * Sort Key → `noteId`

---

## 📦 Storage

* **Service:** AWS S3
* **Upload:** Pre-signed URLs

---

## 🔐 Authentication

* **Service:** AWS Cognito
* **Features:** Sign up, login, JWT tokens

---

## 🏗️ Infrastructure

* **Tool:** AWS CDK (Python)

---

## 📊 Monitoring

* **CloudWatch:** Logs, metrics, alerts

---

# 3. 👤 Target Users

## 🎓 Students

* Store lecture notes
* Upload assignments and PDFs
* Organize study materials

## 🧑‍💻 Developers

* Learn serverless + DDD architecture
* Extend into personal knowledge system

---

# 4. 🧩 Core Features

## 4.1 Authentication (User Context)

* Sign up (email)
* Email verification
* Login / logout
* Token-based authentication (JWT)

---

## 4.2 Notes Management (Note Context)

* Create note
* View all notes
* Update note
* Delete note

### Note Model

```json
{
  "noteId": "string",
  "userId": "string",
  "title": "string",
  "content": "string",
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

---

## 4.3 File Upload (Upload Context)

* Generate pre-signed upload URL
* Upload files directly to S3
* Support PDF, images, documents

---

## 4.4 Attachments (Attachment Context)

* Attach files to notes
* View/download attachments
* Multiple files per note

---

## 4.5 Dashboard (Frontend)

* List notes
* View note details
* Create/edit notes
* Upload files inside notes

---

# 5. 🧠 Architecture

## High-Level Flow

```
User → Next.js → API Gateway → Lambda → Domain → Infrastructure
```

---

## 🧩 DDD Structure (Bounded Contexts)

```
contexts/
  ├── user/
  ├── note/
  ├── upload/
  ├── attachment/
  └── shared/
```

Each context contains:

* domain
* application
* infrastructure
* interfaces

---

# 6. ⚙️ Functional Requirements

## User

* Users must register and verify email
* Users can log in and receive tokens

---

## Notes

* Users can create notes
* Users can access only their notes
* Users can update/delete notes

---

## Upload

* System generates secure upload URL
* Files uploaded directly to storage

---

## Attachments

* Files linked to notes
* Metadata stored for retrieval

---

# 7. 🔐 Non-Functional Requirements

## Security

* All APIs require authentication
* Files are private
* IAM roles follow least privilege

---

## Performance

* API response < 500ms typical
* Fast file uploads via direct S3

---

## Scalability

* Supports thousands to millions of users

---

## Reliability

* Serverless ensures high availability

---

# 8. 🗄️ Data Design

## DynamoDB Table: Notes

* Partition Key: `userId`
* Sort Key: `noteId`

---

## S3 Structure

```
/users/{userId}/notes/{noteId}/{file}
```

---

# 9. 🌐 API Design

## Notes APIs

* POST `/notes`
* GET `/notes`
* PUT `/notes/{id}`
* DELETE `/notes/{id}`

---

## Upload API

* POST `/upload-url`

---

# 10. 🖥️ Frontend (Next.js)

## Pages

```
/login
/signup
/dashboard
/notes
/notes/[id]
```

---

## UI Features

* Authentication flow
* Notes dashboard
* Note editor
* File upload UI

---

# 11. 🤖 AI Agent Considerations

* Modular structure (DDD contexts)
* Small, isolated components
* Predictable naming
* Minimal cross-dependencies

---

# 12. 🚀 Future Enhancements

* Real-time collaboration
* Note sharing
* Tagging system
* Full-text search
* Mobile app

---

# 13. 📊 Success Metrics

* Users can create/manage notes successfully
* File upload success rate > 99%
* Low API latency
* Clean, maintainable architecture

---

# 🔥 Final Summary

NoteStack is a **DDD-based, serverless fullstack application** that demonstrates:

* Modern cloud architecture
* Clean separation of concerns
* Scalable backend design
* Seamless frontend integration

---

👉 A complete **real-world system design project**, not just a demo app.

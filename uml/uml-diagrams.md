# BenchMark UML Diagrams

These diagrams reflect the current React/Vite frontend, Express backend, and MySQL data flow.


## Sequence Diagram: Sign Up / Log In

```mermaid
sequenceDiagram
  title Sequence Diagram - Sign-in/Login
  actor User
  participant AuthPage
  participant Express
  participant MySQLusers
  participant JWT

  alt Sign up
    User->>AuthPage: Enter email, username, password
    AuthPage->>Express: POST /register
    Express->>Express: bcrypt.hash(password)
    Express->>MySQLusers: INSERT users(email, password, username)
    MySQLusers-->>Express: Insert success
    Express->>JWT: sign({ email })
    JWT-->>Express: token
    Express-->>AuthPage: { success, token }
    AuthPage->>AuthPage: Save token in localStorage
  else Log in
    User->>AuthPage: Enter email and password
    AuthPage->>Express: POST /login
    Express->>MySQLusers: SELECT user WHERE email = ?
    MySQLusers-->>Express: User row
    Express->>Express: bcrypt.compare(password)
    Express->>JWT: sign({ email })
    JWT-->>Express: token
    Express-->>AuthPage: { success, token }
    AuthPage->>AuthPage: Save token in localStorage

  end
```

## Sequence Diagram: Password Reset

```mermaid
sequenceDiagram
  actor User
  participant Login as Login
  participant Reset as ResetPasswordPage
  participant Express
  participant DB as MySQLusers
  participant Mail as NodemailerGmail

  User->>Login: Request password reset
  Login->>Express: POST /forgot-password
  Express->>DB: SELECT user WHERE email = ?
  DB-->>Express: User row
  Express->>Express: Create short-lived reset JWT
  Express->>Mail: Send reset link
  Mail-->>User: Email with /reset-password?token=...
  User->>Reset: Open reset link
  Reset->>Express: POST /reset-password
  Express->>Express: Verify reset JWT and hash password
  Express->>DB: UPDATE users SET password = ?
  Express-->>Reset: { success: true }
```

## Sequence Diagram: Load, Search, and Clear Benches

```mermaid
sequenceDiagram
  title Sequence Diagram - Load&SearchBenches
actor User
  participant MapController
  participant MapView
  participant ResultsPanel
  participant Express
  participant DB as MySQLbenchesreviews

  MapController->>Express: GET /bench
  Express->>DB: SELECT * FROM benches
  DB-->>Express: Bench rows
  Express-->>MapController: benches
  MapController->>Express: GET /bench-ratings
  Express->>DB: AVG(stars), COUNT(*) GROUP BY bench_id
  DB-->>Express: Rating summaries
  Express-->>MapController: avgRating/reviewCount rows
  MapController->>MapController: Merge ratings into benches
  MapController->>MapView: benches prop
  MapView->>ResultsPanel: nearby filtered results

  User->>ResultsPanel: Type search text
  ResultsPanel->>MapView: Client-side filter current benches

  User->>ResultsPanel: Press Enter or click Search
  ResultsPanel->>MapView: onSearch()
  MapView->>Express: GET /bench-search?q=&lat=&lng=
  Express->>DB: Search nearby benches with rating summary join
  DB-->>Express: Search rows with avgRating/reviewCount
  Express-->>MapView: Matching benches
  MapView->>MapController: onBenchesChange(search rows)
  MapController->>MapView: narrowed benches prop

  User->>ResultsPanel: Click X
  ResultsPanel->>MapView: onClear()
  MapView->>MapView: setQuery("")
  MapController->>MapController: onResetBenches()
  MapController->>Express: GET /bench and GET /bench-ratings
  Express-->>MapController: Full bench list + ratings
  MapController->>MapView: restored benches prop
```

## Sequence Diagram: Add a Bench

```mermaid
sequenceDiagram
  title Sequence Diagram AddBench

 actor User
  participant MapView
  participant MapController
  participant CreateBenchPopup
  participant Cloudinary
  participant Express
  participant MySQLDB

  User->>MapView: Click Add it!
  MapView->>MapController: onAddBench(mapCenter)
  MapController->>MapView: confirmLocationMode = true
  User->>MapView: Drag pending marker
  MapView->>MapController: onPendingMarkerMove(lat,lng)
  User->>MapView: Confirm Bench Location
  MapView->>MapController: onConfirmBenchLocation()
  MapController->>CreateBenchPopup: Open draft bench form

  User->>CreateBenchPopup: Enter name, rating, review, optional photo
  opt Photo selected
    CreateBenchPopup->>Cloudinary: Upload file(s)
    Cloudinary->>CreateBenchPopup: image URL(s)
  end
  CreateBenchPopup->>MapController: onSubmit(draft)
  MapController->>Express: POST /add-bench
  Express->>MySQLDB: INSERT INTO benches
  MySQLDB->>Express: insertId
  Express->>MapController: { insertId }
  MapController->>Express: POST /add-review
  Express->>MySQLDB: INSERT INTO reviews
  MapController->>MapController: Add saved bench optimistically
  MapController->>CreateBenchPopup: Close popup
```

## Sequence Diagram: Write a Review for an Existing Bench

```mermaid
sequenceDiagram
  title Sequence Diagram - WriteReviews
  actor User
  participant BenchDetailsPopup
  participant WriteReviewPopup
  participant MapController
  participant Express
  participant MySQLreviews

  User->>BenchDetailsPopup: Click Write Review
  BenchDetailsPopup->>MapController: onWriteReview()
  MapController->>WriteReviewPopup: Open with selectedBench
  User->>WriteReviewPopup: Choose stars and review text
  WriteReviewPopup->>MapController: onSubmit({ rating, preview })
  MapController->>Express: POST /add-review
  Express->>MySQLreviews: INSERT INTO reviews
  MapController->>MC: Optimistically prepend review
  MapController->>MC: Recompute avgRating for selected bench
  MapController->>WriteReviewPopup: Close popup
```

## Sequence Diagram: Profile Page

```mermaid
sequenceDiagram
  title Sequence Diagram - ProfilePage
  actor User
  participant ProfilePage
  participant Express
  participant DB as MySQLUsersBenchesReviews
  participant Cloudinary

  User->>ProfilePage: Open /profile
  ProfilePage->>ProfilePage: Decode email from localStorage JWT
  ProfilePage->>Express: GET /user?email=...
  Express->>DB: SELECT username, pfp_url, num_reviewed
  DB-->>Express: User profile row
  Express-->>ProfilePage: user info
  ProfilePage->>API: GET /reviews?user_id=...
  Express->>DB: SELECT reviews JOIN benches
  DB-->>Express: User review rows
  Express-->>ProfilePage: reviews

  opt Update profile photo
    User->>ProfilePage: Upload photo
    ProfilePage->>Cloud: Upload image
    Cloud-->>ProfilePage: image URL
    ProfilePage->>Express: POST /update-pfp
    Express->>DB: UPDATE users SET pfp_url = ?
  end
```

## Class Diagram: Backend Data Model

```mermaid
classDiagram
  class users {
    +email PK
    +password
    +username
    +pfp_url
    +num_reviewed
  }

  class benches {
    +id PK
    +name
    +address
    +coordinates POINT
    +image_url
  }

  class reviews {
    +id PK
    +bench_id FK
    +user_id FK
    +stars
    +review
    +created_at
  }

  users "1" --> "*" reviews : user_id/email
  benches "1" --> "*" reviews : bench_id
```

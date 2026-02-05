# Flow Overview — US-0.2.1 Login Flow

> Diagrams for human review / Sơ đồ để review

---

## Login Flow / Luồng Đăng nhập

```mermaid
flowchart TD
    subgraph User["👤 User"]
        A[Navigate to /login]
    end
    
    subgraph LoginPage["📄 Login Page"]
        B[Display Login Form]
        C[Enter Email & Password]
        D[Click Login Button]
    end
    
    subgraph NextAuth["🔐 NextAuth.js"]
        E[Receive Credentials]
        F{Validate Format}
        G[Call authorize]
    end
    
    subgraph Database["🗄️ Database"]
        H[Find User by Email]
        I[Get passwordHash]
    end
    
    subgraph Verify["🔑 Verification"]
        J[verifyPassword]
        K{Password Match?}
    end
    
    subgraph Session["📋 Session"]
        L[Create JWT Token]
        M[Set Cookie]
    end
    
    subgraph Dashboard["📊 Dashboard"]
        N[Redirect to /dashboard]
        O[Show Welcome Message]
    end
    
    subgraph Error["❌ Error"]
        P[Show Error Message]
        Q[Stay on Login Page]
    end
    
    A --> B
    B --> C
    C --> D
    D --> E
    E --> F
    F -->|Invalid| P
    F -->|Valid| G
    G --> H
    H -->|Not Found| P
    H -->|Found| I
    I --> J
    J --> K
    K -->|No| P
    K -->|Yes| L
    L --> M
    M --> N
    N --> O
    P --> Q
    Q --> B
```

---

## Authentication State Flow / Luồng Trạng thái Xác thực

```mermaid
stateDiagram-v2
    [*] --> Unauthenticated
    
    Unauthenticated --> LoginPage: Visit /login
    LoginPage --> Validating: Submit credentials
    
    Validating --> LoginPage: Invalid credentials
    Validating --> Authenticated: Valid credentials
    
    Authenticated --> Dashboard: Redirect
    Dashboard --> Authenticated: Access protected routes
    
    Authenticated --> Unauthenticated: Logout
    Unauthenticated --> [*]
```

---

## Component Interaction / Tương tác Component

```mermaid
sequenceDiagram
    participant U as User
    participant LF as LoginForm<br/>(Client)
    participant NA as NextAuth<br/>API
    participant AU as authorize()<br/>callback
    participant DB as Prisma<br/>Database
    participant VP as verifyPassword()
    
    U->>LF: Enter email & password
    U->>LF: Click "Login"
    
    LF->>NA: signIn("credentials", {email, password})
    NA->>AU: authorize(credentials)
    
    AU->>DB: findUnique({email})
    
    alt User not found
        DB-->>AU: null
        AU-->>NA: null
        NA-->>LF: CredentialsSignin error
        LF-->>U: "Invalid credentials"
    else User found
        DB-->>AU: user with passwordHash
        AU->>VP: verifyPassword(password, hash)
        
        alt Password incorrect
            VP-->>AU: false
            AU-->>NA: null
            NA-->>LF: CredentialsSignin error
            LF-->>U: "Invalid credentials"
        else Password correct
            VP-->>AU: true
            AU-->>NA: user object
            NA-->>LF: Success + JWT cookie
            LF-->>U: Redirect to /dashboard
        end
    end
```

---

## File Structure / Cấu trúc File

```mermaid
graph LR
    subgraph app["src/app/"]
        auth["(auth)/"]
        dash["(dashboard)/"]
        api["api/"]
        
        auth --> login["login/"]
        login --> page1["page.tsx"]
        login --> comp["_components/"]
        comp --> form["login-form.tsx"]
        
        dash --> page2["page.tsx"]
        dash --> layout2["layout.tsx"]
        
        api --> authapi["auth/"]
        authapi --> nextauth["[...nextauth]/"]
        nextauth --> route["route.ts"]
    end
    
    subgraph lib["src/lib/auth/"]
        index["index.ts"]
        password["password.ts"]
        config["config.ts"]
        authts["auth.ts"]
    end
    
    subgraph types["src/types/"]
        dts["next-auth.d.ts"]
    end
    
    style password fill:#90EE90
    style form fill:#FFB6C1
    style config fill:#87CEEB
```

**Legend:**
- 🟢 Green: Existing file (unchanged)
- 🔵 Blue: New configuration
- 🔴 Pink: New UI component

---

*Created: 2026-02-05*

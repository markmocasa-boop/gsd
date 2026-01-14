# Authentication Knowledge

## When to Load
Keywords: auth, login, signup, session, jwt, oauth, sso, mfa

---

## Common Patterns

### JWT-Based Authentication

```typescript
// Structure
interface JWTPayload {
  sub: string;      // User ID
  iat: number;      // Issued at
  exp: number;      // Expires at
}

// Access token: Short-lived (15 min)
// Refresh token: Long-lived (7 days), stored securely
```

### Session-Based Authentication

```typescript
// Server-side session
interface Session {
  id: string;
  userId: string;
  createdAt: Date;
  expiresAt: Date;
  data: Record<string, unknown>;
}
```

---

## Security Best Practices

### Password Storage
```typescript
// Always use bcrypt or Argon2
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 12;
const hash = await bcrypt.hash(password, SALT_ROUNDS);
const valid = await bcrypt.compare(password, hash);
```

### Token Storage (Frontend)
```typescript
// Access token: Memory only (not localStorage)
// Refresh token: httpOnly cookie

// BAD
localStorage.setItem('token', jwt);

// GOOD
// Server sets: Set-Cookie: refresh_token=xxx; HttpOnly; Secure; SameSite=Strict
// Access token kept in memory/state
```

### Rate Limiting
```typescript
// Login attempts: 5 per 15 minutes per IP
// Password reset: 3 per hour per email
// API: 100 requests per minute
```

---

## Common Vulnerabilities

### Timing Attacks
```typescript
// BAD: Different timing for user exists vs wrong password
if (!user) return error('Invalid credentials');
if (!validPassword) return error('Invalid credentials');

// GOOD: Constant time
const user = await findUser(email);
const hashToCompare = user?.hash ?? DUMMY_HASH;
const valid = await bcrypt.compare(password, hashToCompare);
if (!user || !valid) return error('Invalid credentials');
```

### Token Rotation
```typescript
// Always rotate refresh tokens on use
// Delete old token when issuing new one
// Detect token reuse (possible theft)
```

---

## Integration Patterns

### Next.js + Supabase Auth
```typescript
import { createServerClient } from '@supabase/ssr';

// In middleware.ts
export async function middleware(req: NextRequest) {
  const supabase = createServerClient(/* ... */);
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session && isProtectedRoute(req.nextUrl.pathname)) {
    return NextResponse.redirect(new URL('/login', req.url));
  }
}
```

### Express + Passport
```typescript
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';

passport.use(new LocalStrategy(async (email, password, done) => {
  const user = await findUserByEmail(email);
  if (!user || !await verifyPassword(password, user.hash)) {
    return done(null, false);
  }
  return done(null, user);
}));
```

---

## Checklist

- [ ] Passwords hashed with bcrypt/Argon2
- [ ] Tokens have appropriate expiry
- [ ] Refresh tokens rotated on use
- [ ] Rate limiting on auth endpoints
- [ ] No timing attacks possible
- [ ] Secure cookie settings (HttpOnly, Secure, SameSite)
- [ ] CSRF protection on state-changing endpoints

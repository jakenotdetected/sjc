# SJC Counselling & Career Guidance Portal — Security Hardening

## Overview

This document outlines the comprehensive security measures implemented to protect the admin, teacher, and student portals from attacks and unauthorized access.

## 1. Authentication & Authorization

### Session Management
- **Duration**: 8-hour sliding window (resets on each activity)
- **Inactivity Timeout**: 2 hours (session expires if inactive)
- **Token Generation**: Cryptographically secure random 32-byte tokens
- **Storage**: Server-side only (never exposed in logs or responses)

### Login Security
- **Rate Limiting**: Maximum 12 login attempts per IP per 5 minutes
- **Account Lockout**: After 5 failed attempts, account locks for 30 minutes
- **PIN Hashing**: SHA-256 with salt (`sha256(pin + 'sjc-salt-2024')`)
- **Constant-Time Responses**: All login failures return identical error messages
- **Audit Logging**: All login attempts logged with IP address

### Authorization
- **Role-Based Access Control (RBAC)**: Superadmin and Teacher roles
- **Endpoint Protection**: All protected endpoints check valid session + role
- **Least Privilege**: Teachers only see their own data by default

## 2. CSRF (Cross-Site Request Forgery) Protection

### Implementation
- **CSRF Tokens**: Generated on-demand via `/api/csrf-token` endpoint
- **Token Expiry**: 30 minutes
- **One-Time Use**: Tokens are invalidated after first use
- **Protected Operations**: All POST requests to sensitive endpoints require CSRF token

### Protected Endpoints
- `/api/admin/update-pin` — Change admin PIN
- `/api/admin/teachers` — Manage teacher accounts
- `/api/admin/booking-limit` — Update appointment limits
- `/api/admin/reset-devices` — Clear device records

## 3. Input Validation & Sanitization

### Type Validation
- **Email**: Must be valid format (contains `@`)
- **PIN**: Minimum 4 characters, max 100
- **Name**: 2-100 characters
- **Numbers**: Validated range and type

### Size Limits
- **Request Body**: 100 KB maximum (prevents memory exhaustion)
- **Input Strings**: Truncated to safe lengths
- **Query Parameters**: Validated and decoded safely

### HTML Sanitization
- **Email Bodies**: HTML entities escaped (`&`, `<`, `>`)
- **No Inline Scripts**: All user input treated as text, never evaluated
- **Output Encoding**: Safe for inclusion in HTML/JSON

## 4. Rate Limiting

### Multi-Layer Approach
1. **Login Attempts**: 12 per IP per 5 minutes
2. **OTP Requests**: 5 per IP, 4 per email per 15 minutes
3. **Appointment Submissions**: 8 per IP per hour
4. **API Requests**: 120 per IP per 10 seconds
5. **PIN Changes**: 3 per user per 24 hours

### Implementation
- **Sliding Window**: Accurate time-based tracking
- **Per-IP & Per-User**: Prevents targeted and distributed attacks
- **Bucket Cleanup**: Idle buckets removed every 10 minutes

## 5. Security Headers

### HTTP Headers
```
X-Content-Type-Options: nosniff
X-Frame-Options: SAMEORIGIN
X-XSS-Protection: 0
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
Strict-Transport-Security: max-age=31536000; includeSubDomains
Content-Security-Policy: default-src 'self'; script-src 'self' ...
```

### Protection
- **MIME Type Sniffing**: Blocked
- **Clickjacking**: Prevented via frame options
- **XSS**: Mitigated via CSP
- **HTTPS**: Required via HSTS

## 6. Sensitive Data Protection

### Credentials
- **Moved to Environment Variables**: `ADMIN_EMAIL`, `GMAIL_USER`, `GMAIL_PASS`
- **Never in Code**: Use `.env` file (not version controlled)
- **Never in Logs**: Credentials never logged

### Password/PIN Storage
- **Hashed**: SHA-256 with salt
- **Never Transmitted**: Only hashed values stored/compared
- **Requires Old PIN**: PIN changes require verification of current PIN

### API Responses
- **No PIN Hashes in Responses**: Teacher list doesn't expose hashes
- **No Sensitive Details**: Errors don't reveal system internals

## 7. Audit Logging

### Logged Events
- **LOGIN_SUCCESS** / **LOGIN_FAILED**: Every login attempt with IP
- **PIN_CHANGED**: Admin PIN changes
- **TEACHER_CREATED** / **TEACHER_UPDATED** / **TEACHER_DELETED**: All teacher management
- **BOOKING_LIMIT_UPDATED**: Limit changes
- **DEVICES_RESET**: Device record clearing
- **ACCOUNT_LOCKED**: When lockouts occur
- **LOGOUT**: When users log out

### Log Format
```json
{
  "timestamp": "2024-06-25T10:30:00Z",
  "action": "LOGIN_SUCCESS",
  "userId": "admin@example.com",
  "role": "superadmin",
  "status": "success",
  "details": "Login from IP 192.168.1.1"
}
```

### Location
Stored in `data/audit.log` (append-only for integrity)

## 8. Path Traversal Protection

### Implementation
- **Whitelist**: Only serve files within site root
- **Double Resolution**: Resolve paths twice to catch obfuscation
- **Reject**: `/../`, `..%2F`, encoded variants

### Coverage
- File serving (`/` routes)
- Static assets (CSS, JS, images)
- Protected against `..`, encoded dots, etc.

## 9. Account Lockout

### Mechanism
- **Trigger**: 5 failed login attempts within 5 minutes
- **Duration**: 30 minutes
- **Clear On Success**: Lockout clears when login succeeds
- **Storage**: `data/lockouts.json`

### Response
```json
{
  "success": false,
  "error": "Account is temporarily locked due to too many failed attempts. Please try again in 30 minutes."
}
```

## 10. Email Security

### Sending
- **Validation**: Email address format checked
- **Rate Limiting**: Separate limits per IP and per email
- **Branded Template**: Consistent, secure HTML template
- **No User Input in Subject**: Prevents header injection

### OTP Flow
- **6-Digit Code**: 100,000-999,999 range
- **Expiry**: 10 minutes
- **One-Time Use**: Code deleted after verification
- **Rate Limited**: Prevents brute force

## 11. Deployment Security

### Environment Setup
1. Copy `.env.example` to `.env`
2. Fill in actual credentials (never commit `.env`)
3. Use strong, unique admin PIN (not `sjc2024`)
4. Generate secure Gmail app password
5. Set `NODE_ENV=production`

### HTTPS (Cloudflare)
- Site sits behind Cloudflare for TLS termination
- Ensures all traffic is encrypted
- HSTS header enforces HTTPS

### File Permissions
- `data/` directory: Readable only by server process
- `data/admin.json`: Contains hashed PIN (still protected)
- `data/lockouts.json`: Contains temporary lockout data
- `.env`: Never committed, chmod 600 in production

## 12. Common Attack Mitigations

| Attack | Defense |
|--------|---------|
| **Brute Force Login** | Rate limiting + account lockout |
| **CSRF** | CSRF tokens on state-changing requests |
| **XSS** | Input sanitization + CSP headers |
| **SQL Injection** | N/A (no SQL database; JSON file storage) |
| **Path Traversal** | Path validation + double resolution |
| **Session Hijacking** | Secure random tokens + HTTPS |
| **OTP Bombing** | Rate limiting per IP and email |
| **Timing Attacks** | Constant-time login responses |
| **Information Disclosure** | Generic error messages, no stack traces |
| **Unauthorized Access** | Session validation on all protected endpoints |

## 13. Developer Security Guidelines

### When Adding Endpoints
1. **Authenticate**: Call `validateAdmin(req)` for protected routes
2. **CSRF**: Require CSRF token for POST/PUT/DELETE
3. **Validate**: Check input type, length, format
4. **Sanitize**: Escape output for HTML/JSON context
5. **Limit**: Add rate limiting if user-triggered
6. **Log**: Audit log significant actions
7. **Respond**: Use generic error messages

### Bad ❌
```javascript
if (pin === data.pin) { // Wrong: plaintext comparison
  // ...
}
app.post('/api/dangerous', (req, res) => { // Wrong: no auth check
  // ...
});
res.json({ error: 'Invalid PIN; admin uses "sjc2024"' }); // Wrong: leaks info
```

### Good ✅
```javascript
if (verifyPin(data.pin, cfg.pinHash)) { // Correct: hashed comparison
  // ...
}
app.post('/api/admin/action', (req, res) => {
  const session = validateAdmin(req);
  if (!session) return res.status(401).json({ error: 'Unauthorized' });
  // ...
});
res.json({ error: 'Invalid credentials' }); // Correct: generic message
```

## 14. Incident Response

### If Compromise Suspected
1. **Rotate Credentials**: Change admin PIN immediately
2. **Review Logs**: Check `data/audit.log` for suspicious activity
3. **Check Sessions**: Current `sessions` Map is in-memory (lost on restart)
4. **Reset Accounts**: Delete and recreate teacher accounts if needed
5. **Review Appointments**: Check `data/appointments.json` for tampering

### Logs Location
- **Audit Logs**: `data/audit.log`
- **Lockouts**: `data/lockouts.json`
- **Appointments**: `data/appointments.json`
- **Teachers**: `data/teachers.json`
- **Admin Config**: `data/admin.json` (contains hashed PIN)

## 15. Monitoring & Maintenance

### Regular Tasks
- **Weekly**: Review audit logs for suspicious patterns
- **Monthly**: Audit teacher accounts for unused/orphaned records
- **Quarterly**: Rotate sensitive credentials (Gmail app password)
- **As Needed**: Check lockout file for brute force attempts

### Alerts to Monitor
- Multiple failed login attempts from single IP
- PIN changes at unusual times
- Large number of appointment submissions (spam)
- Unusual session durations or frequencies

## 16. Compliance & Privacy

### Data Minimization
- Only store necessary information
- Appointment records include student data (name, email)
- All staff access logged for accountability

### Data Retention
- Audit logs: Keep indefinitely for accountability
- Lockouts: Auto-expire after 30 minutes
- Sessions: Auto-expire after 8 hours + 2-hour inactivity
- Appointments: Keep as needed, manually purge when done

### GDPR / Privacy
- No unauthorized data sharing
- Secure email-only communication
- Appointments are confidential counselling records
- Staff can be deleted (removes their login capability)

---

## Summary

This security implementation provides:
- ✅ Strong authentication with session management
- ✅ CSRF protection on state-changing operations
- ✅ Rate limiting across all attack surfaces
- ✅ Input validation and output sanitization
- ✅ Comprehensive audit logging
- ✅ Secure credential handling
- ✅ Account lockout for brute force protection
- ✅ Security headers for browser protection
- ✅ Path traversal prevention
- ✅ Role-based access control

**It is NOT sufficient for:**
- Advanced persistent threats (APT)
- State-sponsored attacks
- Supply chain attacks
- Zero-day exploits

For production deployments, additional measures may include:
- WAF (Web Application Firewall) at Cloudflare
- Regular security audits
- Penetration testing
- Bug bounty program
- Security incident response plan

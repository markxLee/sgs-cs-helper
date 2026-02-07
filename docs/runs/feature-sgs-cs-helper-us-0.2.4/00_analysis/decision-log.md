# Decision Log — US-0.2.4: Admin Credentials Login

---

| ID   | Decision                                      | Rationale                                 |
|------|-----------------------------------------------|-------------------------------------------|
| D-001| Extend CredentialsProvider for Admin login     | Reuse proven pattern, secure, minimal code |
| D-002| Use bcrypt for password hashing/validation     | Security best practice                     |
| D-003| Update Admin status on first login             | Ensures onboarding flow, accurate status   |
| D-004| Show generic error for invalid credentials     | Security, avoid info leakage               |
| D-005| Implement audit logging for login attempts     | Security, traceability                    |
| D-006| Allow Super Admin to change Admin password     | Admin management, flexibility             |
| D-007| Lock account after 10 failed login attempts    | Prevent brute force, account safety       |

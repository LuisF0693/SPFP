# ROADMAP QUICK INDEX
## 35 User Stories (STY-051 a STY-085)

**Full Roadmap:** [`ROADMAP-STY-051-085.md`](./ROADMAP-STY-051-085.md)

---

## FASE 1: FOUNDATION (2 semanas | 65-80h)

### Sidebar Reorganization (STY-051 to STY-057)
| ID | Title | P | Effort | Blocker |
|----|-------|---|--------|---------|
| STY-051 | Sidebar Context & State Management | P0 | 6h | ✅ YES |
| STY-052 | Sidebar Layout Redesign - UI Component | P0 | 8h | ✅ YES |
| STY-053 | Budget Section in Sidebar | P0 | 7h | YES |
| STY-054 | Accounts Section in Sidebar | P0 | 5h | YES |
| STY-055 | Transactions & Installments Section | P1 | 6h | - |
| STY-056 | Sidebar Mobile Drawer | P1 | 5h | - |
| STY-057 | Sidebar Persistence & Analytics | P2 | 4h | - |

### Credit Card Invoices (STY-058 to STY-062)
| ID | Title | P | Effort | Blocker |
|----|-------|---|--------|---------|
| STY-058 | Card Invoice Fetching Service | P0 | 8h | ✅ YES |
| STY-059 | Invoice Context Integration | P0 | 6h | ✅ YES |
| STY-060 | Current & Future Installments | P0 | 7h | ✅ YES |
| STY-061 | Credit Card Visual - Realistic | P0 | 8h | ✅ YES |
| STY-062 | Credit Card Transaction Sync | P1 | 6h | - |

### Investments Portfolio (STY-063 to STY-065)
| ID | Title | P | Effort | Blocker |
|----|-------|---|--------|---------|
| STY-063 | Investment Portfolio Data Model | P0 | 6h | ✅ YES |
| STY-064 | Investment Portfolio Display | P0 | 7h | ✅ YES |
| STY-065 | Investment Metrics Widget | P1 | 5h | - |

**FASE 1 Summary:** 15 stories | 10 P0 blockers | 65-80h

---

## FASE 2: FEATURES (3 semanas | 82-95h)

### Retirement Planning (STY-066 to STY-070)
| ID | Title | P | Effort | Blocker |
|----|-------|---|--------|---------|
| STY-066 | Retirement Context & Calculations | P0 | 8h | ✅ YES |
| STY-067 | Retirement DashPlan-Style Chart | P0 | 10h | ✅ YES |
| STY-068 | Retirement Target Date & Goals | P0 | 6h | ✅ YES |
| STY-069 | Retirement Scenario Comparison | P1 | 7h | - |
| STY-070 | Retirement Alerts & Milestones | P2 | 5h | - |

### Asset Acquisition (STY-071 to STY-073)
| ID | Title | P | Effort | Blocker |
|----|-------|---|--------|---------|
| STY-071 | Asset Data Model & Context | P1 | 6h | ✅ YES |
| STY-072 | Asset Acquisition Comparison UI | P1 | 8h | - |
| STY-073 | Asset Form & Quick Add | P1 | 5h | - |

### Improved Patrimony (STY-074 to STY-075)
| ID | Title | P | Effort | Blocker |
|----|-------|---|--------|---------|
| STY-074 | Patrimony Listing Enhancement | P1 | 6h | - |
| STY-075 | Patrimony Evolution Chart | P1 | 5h | - |

**FASE 2 Summary:** 10 stories | 4 P0 blockers | 82-95h

---

## FASE 3: POLISH + MOBILE (2 semanas | 61-76h)

### CRM Partnerships (STY-076 to STY-078)
| ID | Title | P | Effort | Blocker |
|----|-------|---|--------|---------|
| STY-076 | CRM Partnerships Data Model | P1 | 5h | ✅ YES |
| STY-077 | CRM Partnerships Tab UI | P1 | 7h | - |
| STY-078 | CRM Receivables Management | P1 | 6h | - |

### CRM Financial (STY-079 to STY-081)
| ID | Title | P | Effort | Blocker |
|----|-------|---|--------|---------|
| STY-079 | CRM Renewal Dates | P1 | 6h | - |
| STY-080 | CRM Payment History | P1 | 7h | - |
| STY-081 | CRM Dashboard Overview | P2 | 5h | - |

### Mobile PWA & Offline (STY-082 to STY-085)
| ID | Title | P | Effort | Blocker |
|----|-------|---|--------|---------|
| STY-082 | PWA Setup & Service Worker | P0 | 7h | ✅ YES (Mobile) |
| STY-083 | Offline Data Sync & Conflict Res. | P0 | 8h | ✅ YES (Mobile) |
| STY-084 | Push Notifications Setup | P1 | 6h | - |
| STY-085 | Mobile Responsive Testing | P1 | 8h | - |

**FASE 3 Summary:** 10 stories | 2 P0 blockers | 61-76h

---

## QUICK STATS

```
Total Stories:          35
Total Effort:           208-251 hours
P0 Blockers:            16 (critical path)
P1 Features:            16 (high value)
P2 Polish:              3 (nice-to-have)

Timeline:               7 weeks
Team Size:              3 (1 Dev + 1 QA + 0.5 Architect)
Go-live:                ~60 days from start

Features Delivered:     10 (100% client-approved)
```

---

## CRITICAL PATH (P0 BLOCKERS)

### FASE 1 Critical Path (40h)
```
STY-051 (6h)
  └─ STY-052 (8h)
      ├─ STY-053/054 (12h - parallel)
      │   └─ STY-055/056 (11h - parallel)
      │
      └─ STY-058 (8h)
          └─ STY-059 (6h)
              └─ STY-060/061 (15h - parallel)
                  └─ STY-062 (6h)

STY-063 (6h) ─ STY-064 (7h)
```
**FASE 1 Path Duration:** ~15h critical (serial) + ~18h parallel = 33h wall-clock (1.5 weeks)

### FASE 2 Critical Path (28h)
```
STY-066 (8h)
  └─ STY-067 (10h)
      └─ STY-068 (6h)
          └─ STY-069/070 (12h - parallel)

STY-071 (6h) ─ STY-072 (8h) ─ STY-073 (5h)
  └─ STY-074 (6h) ─ STY-075 (5h)
```
**FASE 2 Path Duration:** ~32h critical (serial) = 2 weeks

### FASE 3 Critical Path (23h)
```
STY-076 (5h)
  └─ STY-077 (7h)
      └─ STY-078 (6h)
          └─ STY-081 (5h)

STY-082 (7h)
  └─ STY-083 (8h)
      └─ STY-084/085 (14h - parallel)
```
**FASE 3 Path Duration:** ~23h critical (serial) + parallel = 1.5 weeks

---

## DEPENDENCIES QUICK REFERENCE

### Blockers (Stories that block others)
- **STY-051:** Blocks STY-052, 053, 054, 055, 056, 057
- **STY-052:** Blocks STY-053, 054, 055, 056
- **STY-058:** Blocks STY-059, 060, 061, 062
- **STY-059:** Blocks STY-060, 062
- **STY-063:** Blocks STY-064, 065, 074
- **STY-066:** Blocks STY-067, 068, 069, 070
- **STY-067:** Blocks STY-068, 069
- **STY-076:** Blocks STY-077, 078, 081
- **STY-082:** Blocks STY-083, 084, 085

### Cross-Phase Dependencies
- STY-063 (Investments) used in STY-074 (Patrimony)
- STY-071 (Assets) used in STY-074 (Patrimony)
- STY-082 (PWA) prerequisite for STY-083, 084, 085

---

## TIMELINE SNAPSHOT

```
Week 1-2 (FASE 1):     Sidebar + Card Invoices + Investments
                       Dev: STY-051 → 065 (80h)
                       QA:  Daily testing (30h)

Week 3-5 (FASE 2):     Retirement + Assets + Patrimony
                       Dev: STY-066 → 075 (100h)
                       QA:  Integration testing (35h)

Week 6-7 (FASE 3):     CRM + Mobile PWA + Polish
                       Dev: STY-076 → 085 (80h)
                       QA:  Mobile + UAT (25h)
```

---

## SUCCESS CHECKLIST

### End of FASE 1
- [ ] Sidebar reorganized with all 4 sections
- [ ] Credit card invoices syncing
- [ ] Card visual realistic & functional
- [ ] Investment portfolio basic
- [ ] Lighthouse: 80+
- [ ] Zero critical bugs
- [ ] All P0 blockers green

### End of FASE 2
- [ ] Retirement 3-scenario visualization
- [ ] Asset acquisition comparison
- [ ] Patrimony enhanced listing & charts
- [ ] CRM foundations ready
- [ ] Lighthouse: 80+
- [ ] Zero critical bugs

### End of FASE 3 (Release)
- [ ] CRM complete (Partnerships + Financial)
- [ ] PWA installable & offline working
- [ ] Push notifications
- [ ] Mobile Lighthouse: 85+
- [ ] Full UAT passed
- [ ] Release notes ready
- [ ] Deployment successful

---

## NAVIGATION

- **Full Document:** [`ROADMAP-STY-051-085.md`](./ROADMAP-STY-051-085.md)
- **Individual Stories:** Search document for `## STY-XXX`
- **Dependencies Graph:** See "MATRIZ DE DEPENDÊNCIAS" section
- **Critical Path:** See "Critical Path Analysis" section

---

*Last Updated: February 2026*
*Prepared by: Morgan - Product Manager*
*Status: READY FOR IMPLEMENTATION*

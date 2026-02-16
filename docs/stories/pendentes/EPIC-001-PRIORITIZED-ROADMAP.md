# EPIC-001: CRM v2 - PRIORITIZED ROADMAP

**Product Manager:** Morgan (AIOS PM Agent)
**Version:** 1.0
**Created:** 2026-02-16
**Status:** Ready for Sprint 2 Kickoff
**Total Effort:** 89 story points across 3 sprints
**Recommended Timeline:** 2026-02-19 to 2026-03-12 (4 weeks, 3 sprints)

---

## Executive Summary

EPIC-001 transforms the SPFP CRM from a basic client management tool into an intelligent relationship center with professional meeting notes, investment recommendations, file management, and multi-channel communication. The epic is broken into 3 strategic sprints:

- **Sprint 2 (Foundation):** UI modernization + core data models
- **Sprint 3 (Core Features):** Meeting/Investment notes + Email/WhatsApp integration
- **Sprint 4 (Polish):** File management, templates, permissions

This roadmap balances dependencies, parallelization opportunities, and risk mitigation. All stories are ready to implement immediately after EPIC-004 completion.

---

## Sprint Distribution

### SPRINT 2: FOUNDATION & UI MODERNIZATION
**Dates:** 2026-02-19 to 2026-03-05 (2 weeks)
**Total Points:** 34 points
**Goal:** Establish modern CRM UI, create data models, implement core navigation

| Story | Title | Points | Effort (hrs) | Status |
|-------|-------|--------|-------------|--------|
| S1.1 | Setup CRM Module & Navigation | 8 | 16 | Ready |
| S1.2 | Client Dashboard List (Grid/List View) | 13 | 26 | Ready |
| S1.3 | Client Profile - Overview Tab | 8 | 16 | Ready |
| S1.4 | Create Meeting Notes Modal (MVP) | 5 | 10 | Ready |

**Sprint Capacity:** 34 points
**Confidence:** HIGH - All dependencies met

---

### SPRINT 3: CORE FEATURES & COMMUNICATION
**Dates:** 2026-03-05 to 2026-03-12 (1 week intensive)
**Total Points:** 37 points
**Goal:** Implement full meeting/investment note system with email & WhatsApp sending

| Story | Title | Points | Effort (hrs) | Dependencies |
|-------|-------|--------|-------------|--------------|
| S1.5 | Upload Client Files & Organization | 8 | 16 | S1.3 |
| S1.6 | Meeting Notes History & Multi-Channel Send | 13 | 26 | S1.4, S1.5 |
| S1.7 | Investment Notes with Auto-Calculations | 8 | 16 | S1.4 |
| S1.8 | Client Health Score Calculation | 5 | 10 | S1.3 |
| S1.9 | Edit Client Information Modal | 3 | 6 | S1.3 |

**Sprint Capacity:** 37 points
**Confidence:** MEDIUM-HIGH - Email/WhatsApp APIs require external setup

---

### SPRINT 4: POLISH, INTEGRATIONS & LAUNCH
**Dates:** 2026-03-12 to 2026-03-26 (2 weeks)
**Total Points:** 18 points
**Goal:** Templates, permissions, deep Dashboard integration, final polish

| Story | Title | Points | Effort (hrs) | Dependencies |
|-------|-------|--------|-------------|--------------|
| S1.10 | Custom Template Management (Email/WhatsApp) | 5 | 10 | S1.6 |
| S1.11 | CRM Permissions & Access Control | 5 | 10 | S1.1 |
| S1.12 | Deep Integration with Dashboard & Reports | 8 | 16 | All previous |

**Sprint Capacity:** 18 points
**Confidence:** MEDIUM - Complex Dashboard integration

---

## Detailed Story Breakdown

### Sprint 2 Stories

---

#### **S1.1: Setup CRM Module & Navigation** [8 points, 16 hrs]

**Objective:** Establish CRM as a first-class feature with dedicated section, navigation structure, and layout foundation.

**Description:**
Create the CRM module entry point, admin-only access controls, and responsive layout wrapper. This story sets up the architectural foundation for all subsequent CRM features.

**Acceptance Criteria:**

- [ ] AC-1.1: New `/crm` route created in React Router
- [ ] AC-1.2: AdminRoute guard ensures only admins access CRM
- [ ] AC-1.3: Sidebar has "CRM" menu item with icon
- [ ] AC-1.4: CRM Layout component created with:
  - Responsive 2-column layout (sidebar + main content)
  - Desktop: 288px sidebar (w-72), flexible content
  - Tablet: Sidebar collapses to icon-only
  - Mobile: Bottom navigation tabs
- [ ] AC-1.5: Top navigation breadcrumbs show: "CRM > [Current Section]"
- [ ] AC-1.6: Glassmorphism styling applied (bg-white/5, backdrop-blur)
- [ ] AC-1.7: Dark mode fully tested
- [ ] AC-1.8: Loading skeleton on initial load
- [ ] AC-1.9: Error boundary catches CRM crashes
- [ ] AC-1.10: TypeScript strict mode compliance (no `any` types)

**Technical Details:**

**Files to Create/Modify:**
```
src/components/CRM/
├── CRMLayout.tsx          (Main wrapper)
├── CRMNavigation.tsx      (Sidebar nav with sections)
├── CRMBreadcrumbs.tsx     (Top navigation)
└── pages/
    ├── CRMDashboard.tsx   (Entry point - redirects to ClientsList)
    ├── ClientsList.tsx    (S1.2)
    ├── ClientProfile.tsx  (S1.3)
    └── MeetingNotes.tsx   (S1.4)

src/types/crm.ts           (New - CRM types)
src/hooks/useCRM.ts        (New - CRM context/state)
```

**Database Requirements:**
- Use existing `clients` table from EPIC-004 (if not present, create via migration)
- CRM data uses existing Supabase schema

**Design References:**
- See `docs/design/FASE-1-MOCKUPS.md` sidebar patterns
- Glassmorphism: TailwindCSS `bg-white/5 dark:bg-white/10 backdrop-blur`
- Icons: Use existing icon library (Lucide React)

**Performance Targets:**
- Initial load: < 2 seconds
- Navigation between CRM pages: < 500ms

**Testing:**
- [ ] Unit test for route guards
- [ ] Integration test for sidebar navigation
- [ ] E2E test: Access `/crm` as admin, verify redirect to `/crm/clients`
- [ ] E2E test: Access `/crm` as non-admin, verify redirect to `/dashboard`

**Edge Cases:**
- User loses admin role mid-session → redirect to dashboard
- CRM accessed on mobile → verify bottom nav displays
- Dark/Light mode toggle → verify all colors update

**Acceptance Checklist:**
- [ ] All AC items completed
- [ ] TypeScript compiles without errors
- [ ] No console errors in browser DevTools
- [ ] Lighthouse performance > 85
- [ ] Accessibility audit passes WCAG AA
- [ ] PR reviewed and approved by @architect

---

#### **S1.2: Client Dashboard List (Grid/List View)** [13 points, 26 hrs]

**Objective:** Create the main CRM landing page showing all clients in searchable, filterable grid/list with health scores and quick actions.

**Description:**
Build a modern client list with multiple view modes, advanced filtering, and search. Users can toggle between grid (card-based) and list (table-based) views. Each client shows: name, health score, email, phone, last contact date, and action buttons.

**Acceptance Criteria:**

- [ ] AC-2.1: Fetch all clients from Supabase `clients` table
- [ ] AC-2.2: Display in grid view (cards) by default on desktop
  - Each card shows: avatar, name, email, phone, health score (visual gauge)
  - Card size: responsive (1, 2, 3, or 4 per row depending on viewport)
- [ ] AC-2.3: Toggle to list view (table) with columns:
  - Name | Email | Phone | Health Score | Last Contact | Actions
- [ ] AC-2.4: Search by client name, email, or phone (real-time filtering)
- [ ] AC-2.5: Filter by health score (Excellent, Good, At Risk, Critical)
- [ ] AC-2.6: Filter by last contact (Today, This Week, This Month, Older)
- [ ] AC-2.7: Sort by: Name, Health Score, Last Contact, Date Created
- [ ] AC-2.8: Pagination or infinite scroll (if 50+ clients)
- [ ] AC-2.9: Quick actions on each card/row:
  - View Profile [→]
  - Send Message [💬]
  - Create Meeting Notes [📝]
- [ ] AC-2.10: Health score visual: Color-coded gauge
  - Green (80-100): Excellent
  - Yellow (60-79): Good
  - Orange (40-59): At Risk
  - Red (0-39): Critical
- [ ] AC-2.11: Empty state with illustration when no clients
- [ ] AC-2.12: Loading skeleton during fetch
- [ ] AC-2.13: Error handling with retry button
- [ ] AC-2.14: Responsive on tablet and mobile (single column grid)

**Technical Details:**

**Files to Create:**
```
src/components/CRM/ClientsList.tsx        (Main component)
src/components/CRM/ClientCard.tsx         (Grid view)
src/components/CRM/ClientTable.tsx        (List view)
src/components/ui/ClientFilters.tsx       (Filter sidebar)
src/components/ui/HealthScoreGauge.tsx    (Reusable component)
src/hooks/useCRMClients.ts                (Fetch + state)
```

**Data Model:**
```typescript
interface Client {
  id: string;
  user_id: string;
  name: string;
  email: string;
  phone: string;
  avatar_url?: string;
  health_score: number; // 0-100
  last_contact: string; // ISO datetime
  status: 'active' | 'inactive' | 'archived';
  created_at: string;
  updated_at: string;
}
```

**Supabase Query:**
```typescript
const { data: clients, isLoading, error } = useFetch(
  `SELECT * FROM clients
   WHERE user_id = ${user.id}
   AND status = 'active'
   ORDER BY last_contact DESC`
);
```

**Design References:**
- Grid card layout inspired by `docs/design/FASE-1-MOCKUPS.md` Admin Dashboard
- Health score colors: emerald-500 (green), amber-500 (yellow), orange-500, rose-500 (red)
- Typography: Font size sm/md for list, titles use font-semibold

**Performance Targets:**
- Render 100 clients in < 1 second
- Search results filter in < 200ms
- Lazy load images (client avatars)

**Testing:**
- [ ] Unit test: Filter logic (by health score, date range)
- [ ] Unit test: Sort logic (name, date, score)
- [ ] Unit test: Search string matching
- [ ] Integration test: Fetch clients from mock Supabase
- [ ] E2E test: Load ClientsList, verify 10+ clients display
- [ ] E2E test: Toggle grid/list view, verify layout changes
- [ ] E2E test: Search for client, verify results update
- [ ] E2E test: Click "View Profile" → navigate to S1.3

**Edge Cases:**
- No clients exist → show empty state
- Client data incomplete (missing email/phone) → handle gracefully
- Network error during fetch → show error with retry
- User deletes/archives client mid-browse → refresh silently
- 1000+ clients → pagination or virtualization needed

**Acceptance Checklist:**
- [ ] All AC items completed
- [ ] Performance: Render time < 1s for 100 clients
- [ ] Mobile responsive: tested on iPhone 12+
- [ ] Accessibility: Keyboard navigation (Tab/Enter), screen reader support
- [ ] PR reviewed by @dev and @architect

---

#### **S1.3: Client Profile - Overview Tab** [8 points, 16 hrs]

**Objective:** Create detailed client profile page with overview tab showing all client details, contact info, financial summary, and action buttons for meeting notes creation.

**Description:**
Build the client profile page with multiple tabs (Overview, Atas, Arquivos, Timeline). This story focuses on the Overview tab which displays: client avatar, basic info, contact details, financial summary (patrimony, invested, goals), health score details, and quick action buttons.

**Acceptance Criteria:**

- [ ] AC-3.1: Route `/crm/clients/:clientId` created
- [ ] AC-3.2: Fetch client details from Supabase
- [ ] AC-3.3: Header section displays:
  - [ ] Large avatar (placeholder if missing)
  - [ ] Client name (editable - S1.9)
  - [ ] Health score visual + description
  - [ ] Contact info: email, phone, address (if available)
- [ ] AC-3.4: Quick action buttons:
  - [ ] "Nova Ata de Reunião" [📝]
  - [ ] "Nova Ata de Investimentos" [📊]
  - [ ] "Enviar Mensagem" [💬]
  - [ ] "Editar" [✏️]
  - [ ] "Mais" [⋮] dropdown (Archive, Delete)
- [ ] AC-3.5: Overview tab shows financial summary:
  - [ ] Total Patrimony: R$ X.XXX
  - [ ] Total Invested: R$ X.XXX
  - [ ] Active Goals: N
  - [ ] Financial Health: Score + description
- [ ] AC-3.6: Tab navigation:
  - [ ] "Resumo" (Overview) - Current
  - [ ] "Atas" (Notes History) - S1.6
  - [ ] "Arquivos" (Files) - S1.5
  - [ ] "Timeline" (Events) - S1.12
- [ ] AC-3.7: Back button → return to ClientsList
- [ ] AC-3.8: Loading state with skeleton
- [ ] AC-3.9: Client not found → 404 page with "Go Back" button
- [ ] AC-3.10: Responsive design on mobile (stack layout)

**Technical Details:**

**Files to Create:**
```
src/components/CRM/ClientProfile.tsx      (Main page)
src/components/CRM/ClientHeader.tsx       (Avatar + Info)
src/components/CRM/ClientOverviewTab.tsx  (Overview content)
src/components/CRM/ClientTabNav.tsx       (Tab switcher)
src/components/CRM/HealthScoreDetail.tsx  (Detailed score explanation)
src/hooks/useCRMClient.ts                 (Fetch single client)
```

**Data Model Extension:**
```typescript
interface ClientDetailed extends Client {
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  occupation?: string;
  marital_status?: string;
  financial_summary: {
    total_patrimony: number;
    total_invested: number;
    active_goals_count: number;
    financial_health_description: string;
  };
  created_at: string;
  updated_at: string;
}
```

**Supabase Queries:**
```typescript
// Fetch client + summary
const client = await supabase
  .from('clients')
  .select('*')
  .eq('id', clientId)
  .single();

// Get financial summary (aggregate from linked data)
// Will be populated via trigger or computed on frontend
```

**Design References:**
- Client header: Large avatar (120px), centered on mobile
- Health score: Circular gauge + descriptive text
- Financial summary: 4 columns/cards showing key metrics
- Action buttons: Primary (blue) for "New Notes", Secondary (gray) for others

**Performance Targets:**
- Load profile: < 1 second
- Tab switch: < 100ms

**Testing:**
- [ ] Unit test: Health score calculations
- [ ] Integration test: Fetch single client from Supabase
- [ ] E2E test: Load `/crm/clients/[valid-id]`, verify all sections display
- [ ] E2E test: Click "Nova Ata de Reunião", verify opens S1.4 modal
- [ ] E2E test: Click "Editar", verify opens S1.9 modal
- [ ] E2E test: Invalid client ID → 404 message

**Edge Cases:**
- Client not found (deleted by other user) → 404
- Financial summary unavailable → show "N/A"
- Missing avatar → show initials/placeholder
- Long names → handle text truncation/wrapping
- Very small screens (< 320px width) → mobile breakpoint handling

**Acceptance Checklist:**
- [ ] All AC items completed
- [ ] Financial summary correctly aggregated
- [ ] All tabs accessible and functional
- [ ] Mobile layout tested
- [ ] PR reviewed by @dev and @architect

---

#### **S1.4: Create Meeting Notes Modal (MVP)** [5 points, 10 hrs]

**Objective:** Build the core meeting notes creation modal with rich text editor, auto-saving, and preview.

**Description:**
Create a modal that opens when "Nova Ata de Reunião" is clicked. MVP includes: date pickers for meeting & next meeting, topic list editor, pending items list editor, and recommended materials list. Rich text support for topics (emoji support, formatting). Auto-save drafts every 30 seconds. Preview before sending.

**Acceptance Criteria:**

- [ ] AC-4.1: Modal opens from ClientProfile quick action
- [ ] AC-4.2: Pre-populated fields:
  - [ ] Client name (read-only)
  - [ ] Meeting date (default = today, date picker)
  - [ ] Next meeting date (date picker + time)
- [ ] AC-4.3: Topics section:
  - [ ] Add topic button
  - [ ] Each topic: emoji selector + text input (rich text)
  - [ ] Delete topic button
  - [ ] Supports: bold, italic, links, emojis
  - [ ] Show 1+ topic examples (😊, 🚀, 📈, etc)
- [ ] AC-4.4: Pending Items section:
  - [ ] Add pending item button
  - [ ] Each item: checkbox (incomplete by default) + text
  - [ ] Delete item button
- [ ] AC-4.5: Recommended Materials section:
  - [ ] Add material button
  - [ ] Each material: name + description
  - [ ] Delete material button
  - [ ] Link to known Finclass materials (hardcoded dropdown)
- [ ] AC-4.6: Auto-save draft every 30 seconds
  - [ ] Save to localStorage first (offline support)
  - [ ] Then sync to Supabase `sent_atas` table with status='draft'
  - [ ] Show "Saving..." → "Saved at 14:30" feedback
- [ ] AC-4.7: Preview button → Show formatted ata (S1.6 will handle sending)
- [ ] AC-4.8: Cancel button → Confirm before closing ("Discard draft?")
- [ ] AC-4.9: Responsive on mobile (full-screen modal or slide-up sheet)
- [ ] AC-4.10: Loading states, error handling

**Technical Details:**

**Files to Create:**
```
src/components/CRM/MeetingNotesModal.tsx  (Main)
src/components/CRM/TopicsEditor.tsx       (Topics list)
src/components/CRM/RichTextInput.tsx      (Rich text for topics)
src/components/CRM/PendingItemsEditor.tsx (Pending items)
src/components/CRM/MaterialsEditor.tsx    (Materials list)
src/components/CRM/AtaPreview.tsx         (S1.6 will use this)
src/hooks/useMeetingNotes.ts              (Auto-save logic)
```

**Data Model:**
```typescript
interface MeetingNotaDraft {
  id?: string;
  client_id: string;
  user_id: string;
  meeting_date: string; // ISO date
  next_meeting_date: string;
  next_meeting_time: string;
  topics: Array<{ id: string; emoji: string; text: string }>;
  pending_items: Array<{ id: string; text: string; completed: boolean }>;
  materials: Array<{ id: string; name: string; description: string }>;
  status: 'draft' | 'sent';
  created_at: string;
  updated_at: string;
}
```

**Supabase Table (Migration):**
```sql
CREATE TABLE sent_atas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  client_id UUID NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('reuniao', 'investimentos')),
  meeting_date DATE,
  next_meeting_date DATE,
  next_meeting_time TIME,
  topics JSONB, -- [{emoji, text}, ...]
  pending_items JSONB, -- [{text, completed}, ...]
  materials JSONB, -- [{name, description}, ...]
  status VARCHAR(20) NOT NULL CHECK (status IN ('draft', 'sent')),
  content TEXT, -- Rendered HTML for preview/sending
  channel VARCHAR(20), -- 'email', 'whatsapp' (populated on send in S1.6)
  recipient VARCHAR(255), -- email or phone (populated on send in S1.6)
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER update_sent_atas_updated_at BEFORE UPDATE ON sent_atas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS Policy
ALTER TABLE sent_atas ENABLE ROW LEVEL SECURITY;
CREATE POLICY rls_sent_atas ON sent_atas
  USING (auth.uid() = user_id);
```

**Auto-save Implementation:**
```typescript
// In useMeetingNotes hook
const autoSaveTimer = useRef<NodeJS.Timeout>();

const triggerAutoSave = useCallback(() => {
  clearTimeout(autoSaveTimer.current);
  setAutoSaveStatus('saving');

  autoSaveTimer.current = setTimeout(async () => {
    try {
      // Save to localStorage
      const draft = { topics, pendingItems, materials, ... };
      localStorage.setItem(`draft_${clientId}`, JSON.stringify(draft));

      // Save to Supabase
      const { error } = await supabase
        .from('sent_atas')
        .upsert({ ...draft, status: 'draft' });

      if (!error) setAutoSaveStatus('saved');
    } catch (err) {
      setAutoSaveStatus('error');
    }
  }, 30000); // 30 seconds
}, [topics, pendingItems, materials, clientId]);
```

**Design References:**
- Modal width: 600px (lg) on desktop, full width on mobile
- Rich text editor: Use simple inline buttons (B, I, A, emoji picker)
- Colors: Primary blue for buttons, gray for secondary actions

**Performance Targets:**
- Modal open: < 500ms
- Auto-save write: < 1s
- Type response: < 100ms

**Testing:**
- [ ] Unit test: Auto-save timer logic
- [ ] Unit test: Draft serialization/deserialization
- [ ] Unit test: Rich text formatting
- [ ] Integration test: Save draft to Supabase
- [ ] E2E test: Open modal, add topics, verify auto-save after 30s
- [ ] E2E test: Close modal without saving, verify "Discard?" prompt
- [ ] E2E test: Reopen draft → verify topics pre-populated

**Edge Cases:**
- User closes browser → draft recovers from localStorage
- Network offline → save to localStorage, sync when online
- Duplicate topics → allow (no validation needed for MVP)
- Very long topic text → text wrapping/truncation in preview
- Click "Preview" → Opens non-modal preview (separate story S1.6)

**Acceptance Checklist:**
- [ ] All AC items completed
- [ ] Auto-save works reliably
- [ ] Draft recovery from localStorage tested
- [ ] Modal responsive on all screen sizes
- [ ] PR reviewed by @dev and @architect

---

### Sprint 3 Stories

---

#### **S1.5: Upload Client Files & Organization** [8 points, 16 hrs]

**Objective:** Create file upload system with categorization, storage management, and inline preview for PDFs.

**Description:**
Build a dedicated "Arquivos" tab in ClientProfile allowing users to upload meeting materials, presentations, and educational content. Files are organized by category (Investimentos, Planejamento, Educacional, Outros), support drag-drop upload, show file metadata (size, date, type), and include inline PDF viewer. Supabase Storage handles file persistence.

**Acceptance Criteria:**

- [ ] AC-5.1: New "Arquivos" tab in ClientProfile (S1.3 tab nav)
- [ ] AC-5.2: Upload section with:
  - [ ] Drag-and-drop zone ("Arraste arquivos aqui")
  - [ ] Click-to-select button
  - [ ] Accepted types: PDF, PPT, PPTX, PNG, JPG, JPEG (no DOC)
  - [ ] Max file size: 10MB (validate client-side + server-side)
- [ ] AC-5.3: Category selection before/during upload:
  - [ ] 4 categories: Investimentos, Planejamento, Educacional, Outros
  - [ ] Default: "Outros"
  - [ ] Dropdown selector
- [ ] AC-5.4: Upload progress bar (0-100%)
  - [ ] Show file name, current size, estimated time
  - [ ] Cancel button during upload
  - [ ] Error message if upload fails
- [ ] AC-5.5: Files list displays:
  - [ ] File name, file type icon, size (KB/MB), upload date
  - [ ] Category label (colored badge)
  - [ ] Favorite/star toggle
  - [ ] Delete with confirmation
  - [ ] Download link
- [ ] AC-5.6: Search files by name (real-time)
- [ ] AC-5.7: Filter by category (dropdown)
- [ ] AC-5.8: Sort by: Name, Date (newest first), Size
- [ ] AC-5.9: Inline PDF viewer
  - [ ] Click PDF → open viewer in modal or side panel
  - [ ] Zoom controls, page navigation
  - [ ] Download button
- [ ] AC-5.10: Storage quota display
  - [ ] "Storage: 45MB / 500MB"
  - [ ] Progress bar
  - [ ] Link to upgrade if needed (future feature)
- [ ] AC-5.11: Empty state with illustration
- [ ] AC-5.12: Responsive on mobile (vertical layout, smaller thumbnails)

**Technical Details:**

**Files to Create:**
```
src/components/CRM/ClientFilesTab.tsx     (Main)
src/components/CRM/FileUploadZone.tsx     (Drag-drop)
src/components/CRM/FilesList.tsx          (List + grid)
src/components/CRM/PDFViewer.tsx          (Inline viewer)
src/components/ui/StorageQuota.tsx        (Quota display)
src/hooks/useClientFiles.ts               (Upload + fetch)
src/services/fileService.ts               (Upload logic, compression)
```

**Supabase Configuration:**

1. Create bucket (via migration):
```sql
INSERT INTO storage.buckets (id, name, public)
VALUES ('spfp-files', 'spfp-files', false);
```

2. RLS Policy:
```sql
CREATE POLICY rls_spfp_files ON storage.objects
  USING (bucket_id = 'spfp-files' AND auth.uid()::text = (storage.foldername(name))[1]);
```

3. Metadata table:
```sql
CREATE TABLE user_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  client_id UUID,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL CHECK (category IN ('investimentos', 'planejamento', 'educacional', 'outros')),
  storage_path VARCHAR(500) NOT NULL,
  size_bytes INTEGER NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  is_favorite BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, storage_path)
);
```

**File Upload Service:**
```typescript
// src/services/fileService.ts
export async function uploadClientFile(
  file: File,
  clientId: string,
  category: string,
  userId: string
): Promise<{ path: string; url: string }> {
  // 1. Validate file
  if (!ALLOWED_TYPES.includes(file.type)) throw new Error("Tipo não permitido");
  if (file.size > 10 * 1024 * 1024) throw new Error("Arquivo muito grande");

  // 2. Compress images if needed
  let uploadFile = file;
  if (file.type.startsWith('image/')) {
    uploadFile = await compressImage(file);
  }

  // 3. Upload to Supabase Storage
  const path = `${userId}/${category}/${Date.now()}_${file.name}`;
  const { error } = await supabase.storage
    .from('spfp-files')
    .upload(path, uploadFile);

  if (error) throw error;

  // 4. Record metadata
  const { data } = await supabase
    .from('user_files')
    .insert({
      user_id: userId,
      client_id: clientId,
      name: file.name,
      category,
      storage_path: path,
      size_bytes: uploadFile.size,
      mime_type: uploadFile.type,
    })
    .select()
    .single();

  return {
    path,
    url: supabase.storage.from('spfp-files').getPublicUrl(path).data.publicUrl
  };
}
```

**Libraries:**
- `react-pdf`: PDF viewer
- `sharp` or `browser-image-compression`: Image compression
- Drag-drop: React's built-in API or `react-dropzone`

**Design References:**
- Upload zone: Dashed border (2px, slate-300), centered icon + text
- File list: Table or card grid, alternating row backgrounds
- Colors: Category badges use different colors (green, blue, orange, gray)

**Performance Targets:**
- Upload 5MB file: < 3 seconds
- Fetch file list (50 files): < 500ms
- PDF viewer load: < 1 second per page

**Testing:**
- [ ] Unit test: File validation (type, size)
- [ ] Unit test: Category filtering/searching
- [ ] Integration test: Upload file to Supabase Storage
- [ ] Integration test: Fetch files + metadata
- [ ] E2E test: Drag-drop file, verify upload progress
- [ ] E2E test: Filter by category, verify results
- [ ] E2E test: Click PDF, verify viewer opens
- [ ] E2E test: Delete file with confirmation

**Edge Cases:**
- File upload fails (network) → show error, allow retry
- File name conflict → auto-rename (append timestamp)
- Storage quota exceeded → show warning, block upload
- Deleted file → remove from list gracefully
- Very large PDF (50+ pages) → lazy load pages
- Mobile upload → verify file picker works

**Acceptance Checklist:**
- [ ] All AC items completed
- [ ] Upload works reliably with progress tracking
- [ ] PDF viewer functional and performant
- [ ] Storage quota calculation accurate
- [ ] Mobile responsive and tested
- [ ] PR reviewed by @dev and @architect

---

#### **S1.6: Meeting Notes History & Multi-Channel Send** [13 points, 26 hrs]

**Objective:** Implement sending of meeting notes via Email & WhatsApp, with history tracking and resend capability.

**Description:**
Complete the meeting notes feature by adding send functionality to Email and WhatsApp. Users can preview the formatted ata, edit recipient address/phone, and choose delivery channel. Successfully sent atas are recorded in history with channel, recipient, and timestamp. Resend existing atas to different recipients or channels.

**Acceptance Criteria:**

- [ ] AC-6.1: Preview button (from S1.4) shows formatted ata:
  - [ ] Template: See S1.4 template structure (rendered HTML)
  - [ ] Topics with emojis displayed
  - [ ] Pending items as checklist
  - [ ] Materials as links/text
  - [ ] Send button in preview
- [ ] AC-6.2: Send via Email:
  - [ ] Email input (pre-populated from client.email)
  - [ ] Subject line (pre-populated: "Ata de Reunião - {cliente} - {data}")
  - [ ] Subject editable
  - [ ] Email body = formatted ata (HTML)
  - [ ] Confirmation dialog: "Enviar para {email}?"
  - [ ] On send: Call Resend API (or alternative email provider)
  - [ ] Success: "Email enviado com sucesso!" + record in sent_atas
  - [ ] Error: Show error message, allow retry
- [ ] AC-6.3: Send via WhatsApp:
  - [ ] Phone input (pre-populated from client.phone)
  - [ ] Format: International (e.g., +5511999999999)
  - [ ] Validate phone number (regex or library)
  - [ ] Text preview (formatted for WhatsApp plain text)
  - [ ] Confirmation dialog: "Enviar para {phone}?"
  - [ ] On send: Open WhatsApp Web deep link (`https://wa.me/{phone}?text={encoded_text}`)
  - [ ] Record in sent_atas as 'whatsapp' channel
  - [ ] Note: WhatsApp send is manual (user clicks "Send" in WhatsApp)
- [ ] AC-6.4: History tab in ClientProfile:
  - [ ] List of all sent atas (reunião + investimentos)
  - [ ] Columns: Type, Date, Channel, Recipient, Actions
  - [ ] Filter by: Type (All/Reunião/Investimentos), Channel (All/Email/WhatsApp)
  - [ ] Sort by: Newest first (default)
  - [ ] View full ata text (modal)
  - [ ] Resend button → Pre-populate send dialog with original content
  - [ ] Delete ata (soft delete, keep in history)
- [ ] AC-6.5: Email Integration:
  - [ ] Use Resend.com API (recommended for MVP simplicity)
  - [ ] API key stored in .env.local (never in .env)
  - [ ] From address: "noreply@spfp.com" (or user email if available)
  - [ ] Handle rate limits (100 emails/month free tier)
  - [ ] Log email sends in database for audit trail
- [ ] AC-6.6: WhatsApp Integration:
  - [ ] Deep link approach (free, no API key needed)
  - [ ] User manually sends via WhatsApp Web/App
  - [ ] Auto-fill message text
  - [ ] Record send timestamp when user confirms
- [ ] AC-6.7: Responsive on mobile
- [ ] AC-6.8: Error handling, loading states, toast notifications

**Technical Details:**

**Files to Create/Modify:**
```
src/components/CRM/AtaPreviewModal.tsx    (Full preview + send dialog)
src/components/CRM/SendViaEmailModal.tsx  (Email-specific form)
src/components/CRM/SendViaWhatsAppModal.tsx (WhatsApp-specific form)
src/components/CRM/AtasHistoryTab.tsx     (History list + filters)
src/services/emailService.ts              (Resend API integration)
src/services/whatsappService.ts           (WhatsApp deep link generation)
src/hooks/useAtaSending.ts                (Send logic)
src/hooks/useAtasHistory.ts               (Fetch + filter history)
```

**Email Service (Resend Integration):**
```typescript
// src/services/emailService.ts
import { Resend } from 'resend';

const resend = new Resend(process.env.REACT_APP_RESEND_API_KEY);

export async function sendAtaViaEmail(
  to: string,
  subject: string,
  htmlContent: string,
  clientName: string,
  ataId: string,
  userId: string
): Promise<{ messageId: string; error?: string }> {
  try {
    // Validate email
    if (!isValidEmail(to)) throw new Error("Email inválido");

    // Send email
    const { data, error } = await resend.emails.send({
      from: 'noreply@spfp.com',
      to,
      subject,
      html: htmlContent,
    });

    if (error) throw error;

    // Record in sent_atas
    const { error: dbError } = await supabase
      .from('sent_atas')
      .update({
        status: 'sent',
        channel: 'email',
        recipient: to,
        sent_at: new Date().toISOString(),
      })
      .eq('id', ataId);

    return { messageId: data.id };
  } catch (error) {
    return { messageId: '', error: error.message };
  }
}
```

**WhatsApp Service (Deep Link):**
```typescript
// src/services/whatsappService.ts
export function generateWhatsAppLink(
  phone: string,
  message: string
): string {
  // Validate and format phone
  const formattedPhone = formatPhoneNumber(phone); // +5511999999999
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${formattedPhone}?text=${encodedMessage}`;
}

export function openWhatsAppDeepLink(link: string) {
  window.open(link, '_blank');
  // Note: User must manually click "Send" in WhatsApp
  // We'll record the send timestamp locally
}
```

**Template Rendering:**
```typescript
// Ata format (from S1.4 requirements)
interface AtaTemplate {
  clientName: string;
  meetingDate: string;
  nextMeetingDate: string;
  nextMeetingTime: string;
  topics: Array<{ emoji: string; text: string }>;
  pendingItems: Array<{ text: string; completed: boolean }>;
  materials: Array<{ name: string; description: string }>;
}

export function renderAtaAsHTML(ata: AtaTemplate): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Ata de Reunião - ${ata.clientName} - ${formatDate(ata.meetingDate)}</h2>

      <p><strong>📅 Próxima Reunião:</strong> ${formatDate(ata.nextMeetingDate)} às ${ata.nextMeetingTime}</p>

      <h3>📝 Tópicos Discutidos:</h3>
      <ul>
        ${ata.topics.map(t => `<li>${t.emoji} ${t.text}</li>`).join('')}
      </ul>

      <h3>📌 Pontos Pendentes:</h3>
      <ul>
        ${ata.pendingItems.map(p => `<li>[${p.completed ? '✓' : ' '}] ${p.text}</li>`).join('')}
      </ul>

      <h3>📚 Materiais Recomendados:</h3>
      <ul>
        ${ata.materials.map(m => `<li>${m.name}: ${m.description}</li>`).join('')}
      </ul>

      <p>Qualquer dúvida, estou por aqui! 👊📈</p>
    </div>
  `;
}
```

**Database Schema (from S1.4):**
Already defined in `sent_atas` table migration.

**Environment Variables:**
```env
REACT_APP_RESEND_API_KEY=re_xxxxxxxxxxxxx
```

**Design References:**
- Preview modal: Full width on mobile, 700px on desktop
- Send buttons: Email (blue), WhatsApp (green)
- History list: Similar to ClientsList (S1.2) table layout

**Performance Targets:**
- Email send: < 2 seconds (Resend API)
- WhatsApp link generation: < 100ms
- Fetch history (100 atas): < 1 second

**Testing:**
- [ ] Unit test: Email validation (valid, invalid, international)
- [ ] Unit test: Phone validation and formatting
- [ ] Unit test: Template HTML rendering
- [ ] Unit test: WhatsApp link generation (URL encoding)
- [ ] Integration test: Send email via Resend (use sandbox API key)
- [ ] Integration test: Record ata in sent_atas
- [ ] Integration test: Fetch and filter history
- [ ] E2E test: Preview ata, click "Enviar por Email"
- [ ] E2E test: Fill email, click "Enviar", verify success toast
- [ ] E2E test: Click "Enviar por WhatsApp", verify deep link opens
- [ ] E2E test: View history, filter by channel, verify results

**Edge Cases:**
- Invalid email → show error, don't send
- Invalid phone → show error, don't send
- Network error → show retry button
- Email rate limit exceeded → show upgrade prompt
- WhatsApp link very long (>1000 chars) → truncate with warning
- User cancels WhatsApp send → don't record in history
- Resend API unavailable → fallback to placeholder message (mock for MVP)

**Acceptance Checklist:**
- [ ] All AC items completed
- [ ] Email sending works reliably
- [ ] WhatsApp deep link functional
- [ ] History tracking accurate
- [ ] Filters and sorting work correctly
- [ ] Mobile responsive and tested
- [ ] PR reviewed by @dev and @architect

---

#### **S1.7: Investment Notes with Auto-Calculations** [8 points, 16 hrs]

**Objective:** Create Investment Notes (Ata de Investimentos) with structured asset classes and automatic portfolio calculations.

**Description:**
Build a specialized form for investment recommendations with auto-calculating tables. Users organize recommendations by asset class (Stocks, FIIs, International, Fixed Income, Crypto), input asset details (ticker, name, value, quantity), and the system automatically calculates subtotals, percentages, and grand total. Includes notes section and preview formatting.

**Acceptance Criteria:**

- [ ] AC-7.1: "Nova Ata de Investimentos" button opens modal
- [ ] AC-7.2: Form fields:
  - [ ] Meeting date (date picker)
  - [ ] Client name (read-only)
  - [ ] Client objective/profile (text input)
- [ ] AC-7.3: Asset class sections (5 tabs):
  - [ ] 🔹 Ações (Stocks)
  - [ ] 🏢 FIIs (Real Estate Funds)
  - [ ] 🌍 Internacionais (International)
  - [ ] 💵 Renda Fixa (Fixed Income)
  - [ ] 📊 Cripto (Cryptocurrency)
- [ ] AC-7.4: For each asset class, table with columns:
  - [ ] Ticker (e.g., "VALE3", "VGIR11")
  - [ ] Asset Name (e.g., "Vale")
  - [ ] Unit Value (R$ X.XX)
  - [ ] Quantity (number)
  - [ ] Total (auto-calc: Unit Value × Quantity)
  - [ ] Delete button (remove row)
- [ ] AC-7.5: Add Asset button per class:
  - [ ] Opens inline form or modal
  - [ ] Ticker + Name lookup (optional API integration)
  - [ ] Add to selected class
- [ ] AC-7.6: Auto-calculations:
  - [ ] Subtotal per class (sum of Total column)
  - [ ] Percentage per class: (Subtotal / Grand Total) × 100
  - [ ] Grand total (sum of all subtotals)
  - [ ] Live update as user types
- [ ] AC-7.7: Summary section at bottom:
  - [ ] Table showing: Class | Value | Percentage
  - [ ] Grand Total: R$ XXXXX (bold/highlighted)
- [ ] AC-7.8: Notes section (rich text):
  - [ ] Free-form text for next steps, disclaimers, etc
- [ ] AC-7.9: Auto-save every 30 seconds (same as S1.4)
- [ ] AC-7.10: Preview button → Shows formatted ata (sent via S1.6)
- [ ] AC-7.11: Responsive on mobile (scrollable tables, stack layout)

**Technical Details:**

**Files to Create:**
```
src/components/CRM/InvestmentNotesModal.tsx (Main)
src/components/CRM/AssetClassTab.tsx         (Tab content)
src/components/CRM/AssetTable.tsx            (Editable table)
src/components/CRM/AssetInputForm.tsx        (Add asset)
src/components/CRM/InvestmentSummary.tsx     (Auto-calc summary)
src/hooks/useInvestmentNotes.ts              (Auto-save + calculations)
```

**Data Model:**
```typescript
interface InvestmentNotaDraft {
  id?: string;
  client_id: string;
  user_id: string;
  meeting_date: string; // ISO date
  client_objective: string;
  stocks: Asset[]; // Ações
  fiis: Asset[]; // FIIs
  international: Asset[]; // Internacionais
  fixed_income: Asset[]; // Renda Fixa
  crypto: Asset[]; // Cripto
  notes: string;
  status: 'draft' | 'sent';
  created_at: string;
  updated_at: string;
}

interface Asset {
  id: string;
  ticker: string;
  name: string;
  unit_value: number; // R$ per unit
  quantity: number;
  total?: number; // Auto-calc: unit_value * quantity
}

interface InvestmentSummary {
  stocks: { total: number; percentage: number };
  fiis: { total: number; percentage: number };
  international: { total: number; percentage: number };
  fixed_income: { total: number; percentage: number };
  crypto: { total: number; percentage: number };
  grand_total: number;
}
```

**Auto-Calculation Logic:**
```typescript
// src/hooks/useInvestmentNotes.ts
function calculateAssets(assets: Asset[]): {
  assets: Asset[],
  subtotal: number
} {
  const withTotal = assets.map(a => ({
    ...a,
    total: a.unit_value * a.quantity
  }));
  const subtotal = withTotal.reduce((sum, a) => sum + a.total, 0);
  return { assets: withTotal, subtotal };
}

function calculateSummary(
  stocks: Asset[],
  fiis: Asset[],
  international: Asset[],
  fixedIncome: Asset[],
  crypto: Asset[]
): InvestmentSummary {
  const stocksData = calculateAssets(stocks);
  const fiisData = calculateAssets(fiis);
  const intlData = calculateAssets(international);
  const fixedData = calculateAssets(fixedIncome);
  const cryptoData = calculateAssets(crypto);

  const grandTotal =
    stocksData.subtotal +
    fiisData.subtotal +
    intlData.subtotal +
    fixedData.subtotal +
    cryptoData.subtotal;

  return {
    stocks: {
      total: stocksData.subtotal,
      percentage: (stocksData.subtotal / grandTotal) * 100
    },
    fiis: {
      total: fiisData.subtotal,
      percentage: (fiisData.subtotal / grandTotal) * 100
    },
    international: {
      total: intlData.subtotal,
      percentage: (intlData.subtotal / grandTotal) * 100
    },
    fixed_income: {
      total: fixedData.subtotal,
      percentage: (fixedData.subtotal / grandTotal) * 100
    },
    crypto: {
      total: cryptoData.subtotal,
      percentage: (cryptoData.subtotal / grandTotal) * 100
    },
    grand_total: grandTotal
  };
}
```

**Database:**
Uses same `sent_atas` table as S1.4, with `type='investimentos'`.

**Template Rendering (for S1.6):**
```typescript
export function renderInvestmentAtaAsHTML(
  ata: InvestmentNotaDraft,
  summary: InvestmentSummary
): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 700px;">
      <h2>📑 ATA DE RECOMENDAÇÃO DE INVESTIMENTOS</h2>
      <p><strong>📅 Data:</strong> ${formatDate(ata.meeting_date)}</p>
      <p><strong>👤 Cliente:</strong> ${ata.client_objective}</p>

      <h3>💼 Alocação Recomendada</h3>

      ${ata.stocks.length > 0 ? renderAssetClass('🔹 Ações', ata.stocks) : ''}
      ${ata.fiis.length > 0 ? renderAssetClass('🏢 FIIs', ata.fiis) : ''}
      ${ata.international.length > 0 ? renderAssetClass('🌍 Internacionais', ata.international) : ''}
      ${ata.fixed_income.length > 0 ? renderAssetClass('💵 Renda Fixa', ata.fixed_income) : ''}
      ${ata.crypto.length > 0 ? renderAssetClass('📊 Cripto', ata.crypto) : ''}

      <h3>📊 Resumo Total</h3>
      <table style="width:100%; border-collapse:collapse;">
        <tr><td>Ações:</td><td>R$ ${summary.stocks.total.toFixed(2)} (${summary.stocks.percentage.toFixed(1)}%)</td></tr>
        <tr><td>FIIs:</td><td>R$ ${summary.fiis.total.toFixed(2)} (${summary.fiis.percentage.toFixed(1)}%)</td></tr>
        <!-- ... more rows ... -->
      </table>

      <p><strong>✅ Total Geral:</strong> R$ ${summary.grand_total.toFixed(2)}</p>

      ${ata.notes ? `<p><strong>📝 Notas:</strong> ${ata.notes}</p>` : ''}

      <p>✉️ Qualquer dúvida, pode me chamar.</p>
    </div>
  `;
}

function renderAssetClass(className: string, assets: Asset[]): string {
  return `
    <h4>${className}</h4>
    <table style="width:100%; border-collapse:collapse;">
      <tr><th>Ticker</th><th>Nome</th><th>Valor Unit.</th><th>Qtd.</th><th>Total</th></tr>
      ${assets.map(a => `
        <tr>
          <td>${a.ticker}</td>
          <td>${a.name}</td>
          <td>R$ ${a.unit_value.toFixed(2)}</td>
          <td>${a.quantity}</td>
          <td>R$ ${(a.unit_value * a.quantity).toFixed(2)}</td>
        </tr>
      `).join('')}
    </table>
  `;
}
```

**Design References:**
- Asset class tabs: Tab buttons at top, content below
- Editable table: Click cell to edit, auto-focus next field
- Summary table: Bold/highlighted grand total row
- Colors: Each class might have icon color (green stocks, blue FIIs, etc)

**Performance Targets:**
- Add asset: < 100ms (real-time calc update)
- Render summary: < 50ms
- Auto-save: < 1s

**Testing:**
- [ ] Unit test: Asset total calculation
- [ ] Unit test: Summary calculations (subtotals, percentages)
- [ ] Unit test: Handle zero grand total (avoid division by zero)
- [ ] Unit test: Template HTML rendering
- [ ] Integration test: Auto-save draft
- [ ] E2E test: Add assets to multiple classes, verify summary updates
- [ ] E2E test: Edit asset value, verify calculations update live
- [ ] E2E test: Delete asset, verify summary recalculates
- [ ] E2E test: Preview → verify formatted ata shows all assets

**Edge Cases:**
- Grand total is 0 → show "N/A" for percentages
- Very large numbers (billions) → formatting and precision
- Zero quantity → allow (no validation needed for MVP)
- Negative values → allow (for short positions if needed)
- Decimal precision → format to 2 places for currency

**Acceptance Checklist:**
- [ ] All AC items completed
- [ ] Calculations accurate and real-time
- [ ] Auto-save working
- [ ] Template rendering correct
- [ ] Mobile responsive
- [ ] PR reviewed by @dev and @architect

---

#### **S1.8: Client Health Score Calculation** [5 points, 10 hrs]

**Objective:** Implement automatic health score calculation based on client financial metrics and engagement.

**Description:**
Calculate and maintain a dynamic "health score" (0-100) for each client based on financial health metrics (savings rate, investment progress, goal progress) and engagement metrics (last contact, notes frequency, file uploads). Score updates automatically when related data changes.

**Acceptance Criteria:**

- [ ] AC-8.1: Health score formula:
  ```
  Health Score = 0.4 × Financial Health + 0.3 × Goal Progress + 0.3 × Engagement

  Financial Health (0-100):
    - Savings rate > 30%: +30 points
    - Investments present: +25 points
    - Emergency fund present: +25 points
    - Debt-to-income ratio < 30%: +20 points

  Goal Progress (0-100):
    - 0 active goals: 0 points
    - 1-2 active goals: 25 points
    - 3-5 active goals: 50 points
    - 6+ active goals: 100 points
    - Average goal progress: +up to 100 points weight

  Engagement (0-100):
    - Last contact < 7 days: 100 points
    - Last contact 7-14 days: 75 points
    - Last contact 15-30 days: 50 points
    - Last contact 31-60 days: 25 points
    - Last contact > 60 days: 0 points
    - Recent notes (last 30 days): +25 points bonus
    - Active file uploads (last 30 days): +25 points bonus
  ```
- [ ] AC-8.2: Score recalculates automatically when:
  - [ ] Client data updated (profile)
  - [ ] Transaction added (savings rate change)
  - [ ] Goal created/updated/completed
  - [ ] Meeting notes sent (engagement bonus)
  - [ ] File uploaded (engagement bonus)
  - [ ] Last contact date set (via meeting notes)
- [ ] AC-8.3: Score stored in `clients` table (denormalized for performance)
- [ ] AC-8.4: Score displayed in ClientProfile header (with description):
  - [ ] Numeric score: "78"
  - [ ] Visual gauge: Circular progress
  - [ ] Label: "Bom" (Good), "Excelente" (Excellent), "Em Risco" (At Risk), "Crítico" (Critical)
- [ ] AC-8.5: Score history (optional - for future analytics):
  - [ ] Store snapshots weekly in separate table
  - [ ] Track score trends over time
- [ ] AC-8.6: Database trigger to update `clients.health_score` on related data changes
- [ ] AC-8.7: Handle null/missing data gracefully (use safe defaults)

**Technical Details:**

**Files to Create:**
```
src/services/healthScoreService.ts         (Calculation logic)
src/components/CRM/HealthScoreDetails.tsx  (Display + explanation)
```

**Database Schema:**

```sql
-- Add column to clients table if not present
ALTER TABLE clients ADD COLUMN health_score INTEGER DEFAULT 50;
ALTER TABLE clients ADD COLUMN health_score_updated_at TIMESTAMPTZ DEFAULT NOW();

-- Health score history (optional)
CREATE TABLE health_score_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id),
  score INTEGER NOT NULL,
  financial_health INTEGER,
  goal_progress INTEGER,
  engagement INTEGER,
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger function to recalculate health score
CREATE OR REPLACE FUNCTION calculate_client_health_score(p_client_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_savings_rate DECIMAL;
  v_has_investments BOOLEAN;
  v_has_emergency_fund BOOLEAN;
  v_debt_ratio DECIMAL;
  v_financial_health INTEGER := 0;

  v_active_goals INTEGER;
  v_goal_progress DECIMAL;
  v_goals_health INTEGER := 0;

  v_days_since_contact INTEGER;
  v_engagement_health INTEGER := 0;
  v_recent_notes BOOLEAN;
  v_recent_files BOOLEAN;

  v_final_score INTEGER;
BEGIN
  -- Calculate Financial Health (0-100)
  -- TODO: Implement calculation based on linked data
  -- For MVP: Use placeholder calculation
  v_financial_health := 60; -- Placeholder

  -- Calculate Goal Progress (0-100)
  SELECT COUNT(*) INTO v_active_goals
  FROM goals
  WHERE client_id = p_client_id AND status = 'active';

  v_goals_health := CASE
    WHEN v_active_goals = 0 THEN 0
    WHEN v_active_goals <= 2 THEN 25
    WHEN v_active_goals <= 5 THEN 50
    ELSE 100
  END;

  -- Calculate Engagement (0-100)
  SELECT EXTRACT(DAY FROM (NOW() - MAX(sent_at)))::INTEGER
  INTO v_days_since_contact
  FROM sent_atas
  WHERE client_id = p_client_id;

  v_engagement_health := CASE
    WHEN v_days_since_contact IS NULL THEN 50
    WHEN v_days_since_contact < 7 THEN 100
    WHEN v_days_since_contact < 14 THEN 75
    WHEN v_days_since_contact < 30 THEN 50
    WHEN v_days_since_contact < 60 THEN 25
    ELSE 0
  END;

  -- Check for recent notes/files bonuses
  SELECT COUNT(*) > 0 INTO v_recent_notes
  FROM sent_atas
  WHERE client_id = p_client_id
  AND sent_at > NOW() - INTERVAL '30 days';

  IF v_recent_notes THEN
    v_engagement_health := LEAST(100, v_engagement_health + 25);
  END IF;

  -- Final score: weighted average
  v_final_score := (
    (v_financial_health * 0.4) +
    (v_goals_health * 0.3) +
    (v_engagement_health * 0.3)
  )::INTEGER;

  RETURN v_final_score;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update health score on ata send
CREATE TRIGGER update_client_health_on_ata_send
AFTER UPDATE ON sent_atas
FOR EACH ROW
WHEN (NEW.status = 'sent' AND OLD.status != 'sent')
EXECUTE FUNCTION (
  UPDATE clients
  SET health_score = calculate_client_health_score(NEW.client_id),
      health_score_updated_at = NOW()
  WHERE id = NEW.client_id
);
```

**Health Score Service:**
```typescript
// src/services/healthScoreService.ts
export interface HealthScoreBreakdown {
  financial_health: number; // 0-100
  goal_progress: number; // 0-100
  engagement: number; // 0-100
  final_score: number; // 0-100
  label: string; // 'Crítico' | 'Em Risco' | 'Bom' | 'Excelente'
  description: string;
}

export function calculateHealthScore(
  financialData: FinancialMetrics,
  goals: Goal[],
  lastContactDate: Date | null,
  recentNotes: number,
  recentFiles: number
): HealthScoreBreakdown {
  // Financial Health
  const financialHealth = calculateFinancialHealth(financialData);

  // Goal Progress
  const goalProgress = calculateGoalProgress(goals);

  // Engagement
  const engagement = calculateEngagement(lastContactDate, recentNotes, recentFiles);

  // Weighted average
  const finalScore = Math.round(
    (financialHealth * 0.4) +
    (goalProgress * 0.3) +
    (engagement * 0.3)
  );

  return {
    financial_health: financialHealth,
    goal_progress: goalProgress,
    engagement,
    final_score: finalScore,
    label: getScoreLabel(finalScore),
    description: getScoreDescription(finalScore)
  };
}

function getScoreLabel(score: number): string {
  if (score >= 80) return 'Excelente';
  if (score >= 60) return 'Bom';
  if (score >= 40) return 'Em Risco';
  return 'Crítico';
}

function getScoreDescription(score: number): string {
  const descriptions = {
    'Excelente': 'Cliente com excelente saúde financeira e engajamento alto',
    'Bom': 'Cliente com boa situação financeira, manter contato regular',
    'Em Risco': 'Cliente precisa de atenção especial, aumentar frequência de contato',
    'Crítico': 'Cliente crítico, agendar reunião urgente'
  };
  return descriptions[getScoreLabel(score)];
}
```

**Design References:**
- Score display: Circular gauge (like Apple Health)
- Colors: Green (excellent), yellow (good), orange (at risk), red (critical)
- Breakdown modal: Show weights for each component

**Performance Targets:**
- Score calculation: < 100ms
- Database trigger: < 200ms

**Testing:**
- [ ] Unit test: Score calculation with various inputs
- [ ] Unit test: Score label/description mapping
- [ ] Unit test: Handle null/missing data
- [ ] Integration test: Trigger updates score on ata send
- [ ] E2E test: View client profile, verify score displays
- [ ] E2E test: Send meeting notes, verify score updates

**Edge Cases:**
- No data available (new client) → default score of 50
- All metrics zero → score should be 0 (critical)
- Perfect metrics → score should be 100 (excellent)
- Data inconsistency (missing goals) → graceful fallback

**Acceptance Checklist:**
- [ ] Formula implemented and tested
- [ ] Score displays correctly in UI
- [ ] Auto-updates on data changes
- [ ] Trigger working reliably
- [ ] Mobile responsive
- [ ] PR reviewed by @dev and @architect

---

#### **S1.9: Edit Client Information Modal** [3 points, 6 hrs]

**Objective:** Allow users to edit client details (name, email, phone, address) from profile.

**Description:**
Simple modal for editing client information. Opens from ClientProfile "Editar" button. Includes form validation, error handling, and confirmation dialogs.

**Acceptance Criteria:**

- [ ] AC-9.1: Modal opens from ClientProfile "Editar" button
- [ ] AC-9.2: Form fields (pre-populated):
  - [ ] Name (required)
  - [ ] Email (required, valid email)
  - [ ] Phone (optional, validated format)
  - [ ] Address (optional)
  - [ ] City (optional)
  - [ ] State (optional)
  - [ ] Zip Code (optional)
- [ ] AC-9.3: Form validation:
  - [ ] Name not empty
  - [ ] Email format valid
  - [ ] Phone format valid if provided (optional field)
  - [ ] Real-time feedback
- [ ] AC-9.4: Save button:
  - [ ] Updates client in Supabase
  - [ ] Shows loading state
  - [ ] Success toast: "Cliente atualizado com sucesso!"
  - [ ] Error toast if fails
- [ ] AC-9.5: Cancel button → Close without saving
- [ ] AC-9.6: Responsive on mobile

**Technical Details:**

**Files:**
```
src/components/CRM/EditClientModal.tsx
src/hooks/useEditClient.ts
```

**Simple form, no complex logic needed.**

---

### Sprint 4 Stories

---

#### **S1.10: Custom Template Management** [5 points, 10 hrs]

**Objective:** Allow users to customize email and WhatsApp templates for meeting notes.

**Description:**
Create a Settings page for CRM where users can customize the templates used for meeting and investment notes. Includes variable insertion (using Handlebars or simple string replacement) and preview.

**Acceptance Criteria:**

- [ ] AC-10.1: New Settings section in CRM navigation
- [ ] AC-10.2: Template tabs: "Reunião" and "Investimentos"
- [ ] AC-10.3: For each template:
  - [ ] Large text editor (rich text preferred)
  - [ ] List of available variables: {cliente}, {data}, {data_proxima}, etc
  - [ ] Preview button → Shows rendered template with sample data
  - [ ] Save button → Saves to `custom_templates` table
  - [ ] Reset button → Restore default template
- [ ] AC-10.4: Database table for custom templates
- [ ] AC-10.5: Use custom templates when sending (S1.6)
- [ ] AC-10.6: Fall back to default if custom not set

**Technical Details:**

**Database:**
```sql
CREATE TABLE custom_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) UNIQUE,
  type VARCHAR(20) NOT NULL CHECK (type IN ('reuniao', 'investimentos')),
  content TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Template Rendering:**
```typescript
// Simple variable replacement (MVP)
function renderTemplate(template: string, variables: Record<string, string>): string {
  let rendered = template;
  for (const [key, value] of Object.entries(variables)) {
    rendered = rendered.replace(new RegExp(`{${key}}`, 'g'), value);
  }
  return rendered;
}

// Usage: renderTemplate(template, { cliente: 'João', data: '14/02/2026', ... })
```

---

#### **S1.11: CRM Permissions & Access Control** [5 points, 10 hrs]

**Objective:** Implement role-based access control for CRM features.

**Description:**
Ensure only admins can access the CRM module. Add RLS policies to prevent non-admins from viewing/editing client data. Implement per-feature permissions if needed (e.g., only certain admins can send emails).

**Acceptance Criteria:**

- [ ] AC-11.1: Only admins (email in ADMIN_EMAILS) can access `/crm` route
- [ ] AC-11.2: RLS policies on all CRM tables:
  - [ ] `clients`: User can only see own clients
  - [ ] `sent_atas`: User can only see own records
  - [ ] `user_files`: User can only see own files
  - [ ] `custom_templates`: User can only see own templates
- [ ] AC-11.3: Non-admin accessing `/crm` → redirect to `/dashboard`
- [ ] AC-11.4: Admin session expires → redirect and clear data
- [ ] AC-11.5: Future: Support team members with limited access

**Technical Details:**

**RLS Policies (Migration):**
```sql
-- clients table
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
CREATE POLICY rls_clients ON clients
  USING (auth.uid() = user_id);

-- sent_atas table
ALTER TABLE sent_atas ENABLE ROW LEVEL SECURITY;
CREATE POLICY rls_sent_atas ON sent_atas
  USING (auth.uid() = user_id);

-- user_files table
ALTER TABLE user_files ENABLE ROW LEVEL SECURITY;
CREATE POLICY rls_user_files ON user_files
  USING (auth.uid() = user_id);

-- custom_templates table
ALTER TABLE custom_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY rls_custom_templates ON custom_templates
  USING (auth.uid() = user_id);
```

---

#### **S1.12: Deep Integration with Dashboard & Reports** [8 points, 16 hrs]

**Objective:** Show CRM metrics and recent activities on main Dashboard and create dedicated CRM Reports.

**Description:**
Integrate CRM data into the main Dashboard with widgets showing recent notes sent, upcoming meetings, client health trends. Create a CRM Reports page with engagement metrics, email/WhatsApp delivery rates, most-contacted clients.

**Acceptance Criteria:**

- [ ] AC-12.1: Dashboard widget: "Recent CRM Activities"
  - [ ] Show last 5 sent atas
  - [ ] Type, date, recipient, channel
  - [ ] Link to client profile
- [ ] AC-12.2: Dashboard widget: "Client Health Overview"
  - [ ] Average health score
  - [ ] Count by health level (Excellent, Good, At Risk, Critical)
  - [ ] Trend chart (last 30 days)
- [ ] AC-12.3: New CRM Reports page:
  - [ ] Email statistics (sent/delivered/bounced)
  - [ ] WhatsApp statistics (sent/read - if available)
  - [ ] Most contacted clients (top 10)
  - [ ] Engagement trends (chart: atas/week)
  - [ ] Health score distribution (histogram)
- [ ] AC-12.4: Report filters (date range, client, type)
- [ ] AC-12.5: Export reports as CSV/PDF
- [ ] AC-12.6: Responsive dashboard widgets on mobile

**Technical Details:**

**Files:**
```
src/components/Dashboard/CRMActivityWidget.tsx
src/components/Dashboard/ClientHealthWidget.tsx
src/components/CRM/ReportsPage.tsx
src/hooks/useCRMReports.ts
```

**Queries (need aggregation):**
```typescript
// Recent activities
SELECT * FROM sent_atas WHERE user_id = ${userId} ORDER BY sent_at DESC LIMIT 5;

// Health summary
SELECT
  AVG(health_score) as avg_score,
  COUNT(CASE WHEN health_score >= 80 THEN 1 END) as excellent,
  COUNT(CASE WHEN health_score BETWEEN 60 AND 79 THEN 1 END) as good,
  ...
FROM clients WHERE user_id = ${userId};

// Engagement trends
SELECT DATE_TRUNC('week', sent_at) as week, COUNT(*) as count
FROM sent_atas WHERE user_id = ${userId}
GROUP BY week ORDER BY week DESC LIMIT 12;
```

---

## Dependency Graph

```
S1.1: Setup CRM Module
  ↓
S1.2: Client Dashboard List (depends on S1.1)
  ↓
S1.3: Client Profile Overview (depends on S1.2, S1.1)
  ├─→ S1.4: Meeting Notes Modal (depends on S1.3)
  │     ├─→ S1.5: Upload Files (depends on S1.3)
  │     │     └─→ S1.6: History & Send (depends on S1.4, S1.5) ✓ Critical path
  │     │           ├─→ S1.7: Investment Notes (depends on S1.4)
  │     │           └─→ S1.10: Templates (depends on S1.6)
  │     └─→ S1.8: Health Score (depends on S1.3)
  │
  └─→ S1.9: Edit Client Modal (depends on S1.3)

S1.11: Permissions (independent, parallel with others)
S1.12: Dashboard Integration (depends on all features, last)
```

**Critical Path:** S1.1 → S1.2 → S1.3 → S1.4 → S1.6 (Sequential, 6 weeks)

**Parallelizable:**
- S1.7 (Investment Notes) can start after S1.4
- S1.8 (Health Score) can start independently after S1.3
- S1.11 (Permissions) can be done anytime
- S1.5 (Files) can be done in parallel with S1.4

---

## Risk Mitigation

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|-----------|
| Resend/Email API rate limits | Medium | High | Show upgrade path, fallback to copy-paste |
| WhatsApp link too long | Low | Medium | Compress text, truncate with warning |
| Health score calculation complex | Medium | Medium | Start with simplified formula, iterate |
| File storage quota exceeded | Low | Medium | Clear quotas, show upgrade option |
| CRM UI too complex for MVP | Low | High | Focus on 80/20, defer templates/advanced features to S1.10+ |
| Mobile responsiveness issues | Medium | Medium | Test on 2+ devices per sprint |

---

## Success Metrics

By end of Sprint 4:

| Metric | Target | How to Measure |
|--------|--------|----------------|
| CRM adoption | 80% of admins use | Login tracking |
| Atas created | 50+ per month | Count in sent_atas table |
| Avg time to create ata | < 5 min | Manual testing + analytics |
| Client health score accuracy | 95% | Manual audit vs formula |
| File upload success rate | > 99% | Log upload attempts |
| Email delivery rate | > 95% | Resend dashboard + db tracking |
| Mobile usability | 8+ NPS | User feedback survey |

---

## Implementation Notes for @dev

### Code Quality Standards

1. **TypeScript:** Strict mode, no `any` types, full type coverage
2. **Components:** Functional, hooks-based, max 300 LOC per file
3. **Testing:** Unit tests for business logic, integration tests for API calls, E2E tests for user journeys
4. **Error Handling:** Use `errorRecovery` service (see CLAUDE.md) for all async operations
5. **Accessibility:** WCAG AA compliance, keyboard navigation, screen reader tested

### Development Workflow

1. Create branch: `feat/epic-001-s1.X-story-name`
2. Implement story in atomic commits
3. Run tests: `npm run test`, `npm run lint`, `npm run typecheck`
4. Create PR with story ID in title: `feat: S1.X Story Title`
5. Merge after review approval

### Database Migrations

1. Create migration file: `supabase/migrations/20260219_crm_atas.sql`
2. Apply in dev branch first
3. Test in staging before production
4. Document in `docs/architecture/migrations.md`

### Environment Setup

Add to `.env.local`:
```
REACT_APP_RESEND_API_KEY=re_xxxxxxxxxxxxx
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJx...
```

---

## Recommended Sprint Schedule

**Sprint 2: 2026-02-19 to 2026-03-05** (Wed-Wed, 2 weeks)
- Week 1: S1.1, S1.2 (Foundation, UI)
- Week 2: S1.3, S1.4 (Profiles, Notes)

**Sprint 3: 2026-03-05 to 2026-03-12** (Thu-Thu, 1 week intensive)
- Daily stand-ups mandatory
- Parallel streams: S1.5 (Files) + S1.6 (Sending) + S1.7 (Investment) + S1.8 (Score) + S1.9 (Edit)

**Sprint 4: 2026-03-12 to 2026-03-26** (Fri-Fri, 2 weeks)
- Week 1: S1.10 (Templates), S1.11 (Permissions)
- Week 2: S1.12 (Dashboard), QA, bug fixes

---

## Handoff Checklist

- [ ] All 12 stories analyzed and understood
- [ ] Dependencies mapped and validated
- [ ] Database migrations prepared
- [ ] Design mockups referenced
- [ ] Email provider (Resend) API key obtained
- [ ] Testing strategy defined
- [ ] Performance targets set
- [ ] Risk mitigation documented
- [ ] Team capacity confirmed (3 devs, @dev lead)
- [ ] Kickoff meeting scheduled

---

**Created by:** Morgan (AIOS Product Manager)
**Approved by:** [Pending architectural review]
**Ready for:** @dev team Sprint 2 kickoff
**Last Updated:** 2026-02-16

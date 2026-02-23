# Tech Stack

Technology stack para a landing page `/transforme`.

## Frontend Framework

### React 19
```
- Latest React with hooks
- Lazy loading for code splitting
- Suspense boundaries
- Concurrent rendering
```

### TypeScript
```
- Strict mode enabled
- Full type coverage
- Props interfaces
- Custom types for domains
```

### Build Tool - Vite
```
- Lightning-fast dev server
- Optimized production builds
- Module hot reload
- Tree-shaking enabled
```

## Styling & Layout

### TailwindCSS
```
- Utility-first CSS framework
- Custom design system colors
- Responsive design via breakpoints
- Dark mode support
```

### Framer Motion
```
- React animation library
- Entrance animations
- Scroll-triggered animations
- Micro-interactions
```

### Icons - Lucide React
```
- 400+ icons
- Simple React components
- Consistent styling
- Light-weight bundle
```

## Development Tools

### Testing
```
Vitest:              Fast unit test framework
React Testing Library: Component testing
```

### Code Quality
```
ESLint:    Code style and bugs
Prettier:  Code formatting
TypeScript: Type checking
```

### Version Control
```
Git:       Repository management
GitHub:    Remote hosting, CI/CD
```

## API Integration

### Form Submission
```typescript
// Lead form to backend
POST /api/leads
- email (required)
- name (optional)
- source (platform|demo|pricing)
- timestamp
```

### Analytics (Future)
```typescript
// Track conversions
- Page views
- Clicks
- Form submissions
- CTA interactions
```

## Performance Optimization

### Code Splitting
```typescript
// Lazy load pages
const TransformePage = lazy(() => import('./components/TransformePage'))

// Suspense boundary
<Suspense fallback={<Loading />}>
  <TransformePage />
</Suspense>
```

### Image Optimization
```
- AVIF/WebP formats
- Responsive images
- Lazy loading
- CDN delivery
```

### Bundle Optimization
```
- Minification
- Gzip compression
- Unused code removal
- Dynamic imports
```

## Component Libraries

### Built-in UI Components (SPFP)
```
✅ Button
✅ Card
✅ Modal
✅ FormInput
✅ StatCard
✅ Loading
✅ Skeleton
✅ FormLayout
```

### Third-party Libraries
```
framer-motion:      Animations
lucide-react:       Icons
react-router-dom:   Routing (if needed)
react-hook-form:    Form handling (if complex)
```

## Development Setup

### Node Version
```
Node.js: 18+ (LTS)
npm: 9+ or yarn equivalent
```

### Project Structure
```
src/
├── components/
│   ├── landing/          # Landing page components
│   │   ├── Hero.tsx
│   │   ├── Features.tsx
│   │   ├── Pricing.tsx
│   │   ├── FAQ.tsx
│   │   ├── Testimonials.tsx
│   │   ├── Footer.tsx
│   │   └── LeadForm.tsx
│   ├── ui/               # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   └── ...
│   ├── TransformePage.tsx # Main landing page
│   └── ...
├── styles/
│   ├── globals.css       # Global TailwindCSS
│   └── animations.css    # Custom animations
├── types/
│   ├── index.ts
│   └── landing.ts
├── utils/
│   └── analytics.ts
└── main.tsx
```

### Environment Variables
```
# .env.local
VITE_SUPABASE_URL=        # Lead form backend
VITE_SUPABASE_ANON_KEY=   # Public key
```

## Build Commands

```bash
# Development
npm run dev              # Start dev server on http://localhost:3000

# Production
npm run build            # Build for production
npm run preview          # Preview production build locally

# Quality
npm run test             # Run tests
npm run test:ui          # Run tests with UI
npm run lint             # Check code style
npm run type-check       # TypeScript checking
```

## Performance Targets

### Lighthouse Scores
```
Performance:   > 90
Accessibility: > 90
Best Practices:> 85
SEO:           > 85
```

### Core Web Vitals
```
LCP (Largest Contentful Paint):  < 2.5s
FID (First Input Delay):         < 100ms
CLS (Cumulative Layout Shift):   < 0.1
```

### Bundle Size
```
JS Bundle:     < 250kb (gzipped)
CSS Bundle:    < 50kb (gzipped)
Total:         < 300kb (gzipped)
```

## Deployment

### Build Output
```
dist/
├── index.html
├── assets/
│   ├── main.[hash].js
│   ├── main.[hash].css
│   └── vendor.[hash].js
```

### Hosting Requirements
```
- Static site hosting (Vercel, Netlify, GitHub Pages)
- HTTPS enabled
- GZIP compression
- Caching headers
- CDN for assets
```

## Monitoring & Analytics

### Planned Integrations
```
[ ] Google Analytics      # Traffic, conversions
[ ] Sentry              # Error tracking
[ ] Hotjar              # Session recording, heatmaps
[ ] Mixpanel            # Event analytics
[ ] Stripe Dashboard    # Payment tracking
```

## Browser Support

### Target Browsers
```
Chrome:         Latest 2 versions
Firefox:        Latest 2 versions
Safari:         Latest 2 versions
Edge:           Latest 2 versions
Mobile Safari:  iOS 12+
Chrome Android: Android 8+
```

### Graceful Degradation
```
- CSS Grid with Flexbox fallback
- Modern JS with transpilation
- CSS custom properties with fallbacks
- Form validation on client + server
```

## Security

### Best Practices
```
✅ Content Security Policy (CSP)
✅ HTTPS everywhere
✅ No hardcoded secrets
✅ Input validation on client + server
✅ CORS configuration
✅ Rate limiting on API
✅ XSS protection (React auto-escapes)
✅ CSRF tokens if needed
```

### Dependencies
```
- Keep dependencies updated
- Regular security audits (npm audit)
- Review third-party code
- Use lockfile (package-lock.json)
```

## Documentation

### Code Documentation
```
- JSDoc comments for functions
- Component prop documentation
- Type definitions in TypeScript
- README for complex features
```

### Developer Handbook
```
- Setup instructions
- Component library guide
- Common patterns
- Troubleshooting guide
```

---

**Tech Stack Version:** 1.0
**Last Updated:** 2026-02-23
**Maintained by:** SPFP Team

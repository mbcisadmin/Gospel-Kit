# Gospel Kit - Development TODO

Items to complete before shipping v1.0

## Core Apps to Rebuild

- [ ] **Counter App** - Event metrics tracking
  - Rebuild with simplified architecture
  - Remove complex dependencies
  - Use only core packages (@church/ministry-platform, @church/database)
  - Include in apps/platform as example micro-app

- [ ] **People Search** - Contact lookup tool
  - Design search interface
  - Implement MP API integration for dp_Contacts
  - Add permission checks
  - Include as example micro-app

- [ ] **RSVP Widget** - Event registration
  - Public-facing widget (can work without auth)
  - Event selection and RSVP submission
  - Integration with MP Events and Event_Participants
  - Include as example micro-app

## Documentation

- [ ] **Update README.md**
  - Reflect simplified template structure
  - Update screenshots/examples if Counter app is included

- [ ] **Review SETUP.md**
  - Ensure all steps are accurate for simplified template
  - Test setup process from scratch
  - Add troubleshooting section if missing

## Package Improvements

- [ ] **@church/database package**
  - Add more baseline schemas (Contacts, Groups, Participants, etc.)
  - Document schema creation patterns
  - Add examples of custom vs baseline schemas

- [ ] **@church/ministry-platform package**
  - Add JSDoc comments to all public methods
  - Add usage examples in README
  - Consider adding helper methods for common operations

- [ ] **@church/nextjs-auth package**
  - Document role fetching behavior
  - Add examples for session usage
  - Document impersonation feature (if keeping)

- [ ] **@church/nextjs-ui package**
  - Audit which components are actually needed for template
  - Remove unused components or move to separate package
  - Add README with component usage examples

## Testing & Quality

- [ ] **Test build from scratch**
  - Clone template to new directory
  - Run `npm install` fresh
  - Verify build succeeds
  - Test dev server

- [ ] **Test with real MP instance**
  - Verify OAuth flow works
  - Test API calls to MP
  - Verify audit logging ($userId) works
  - Test role fetching

- [ ] **Create example .env file with test values**
  - Use a demo/test MP instance
  - Document where to get credentials

## GitHub & CI/CD

- [ ] **Test GitHub Actions workflows**
  - Push to GitHub and verify CI runs
  - Create test PR and verify preview deployment workflow
  - Verify dependency review works

- [ ] **Add repository topics/tags**
  - church-management
  - ministryplatform
  - nextjs
  - typescript
  - turborepo

- [ ] **Create initial GitHub release**
  - Tag v1.0.0
  - Write release notes
  - Create GitHub release

## Pre-Ship Checklist

- [ ] **Security audit**
  - Run `npm audit` and fix vulnerabilities
  - Review all dependencies
  - Check for exposed secrets in code

- [ ] **Performance check**
  - Verify bundle sizes are reasonable
  - Check lighthouse scores
  - Optimize if needed

- [ ] **Cross-browser testing**
  - Test in Chrome, Firefox, Safari
  - Test on mobile devices
  - Verify responsive design

- [ ] **Final documentation review**
  - Read through all docs as a new user
  - Fix any unclear instructions
  - Add FAQ section if needed

## Nice-to-Have (Post v1.0)

- [ ] Add more Claude skills for common patterns
- [ ] Create video walkthrough of setup process
- [ ] Add Storybook for UI components
- [ ] Create migration guide from existing Woodside apps
- [ ] Add automated testing (Jest, Playwright)
- [ ] Create Docker development environment option
- [ ] Add more example stored procedures
- [ ] Create admin dashboard for managing apps/permissions

---

**Notes:**
- Items marked with checkbox can be tracked with Git commits
- Priority items are the Core Apps and Template Refinements
- Documentation and Testing should be done before v1.0 release

# FocusFlow — Lessons Learned

**Purpose**: This file tracks every mistake, correction, and pattern discovered during development. Claude MUST review this file at the start of every session and apply all prevention rules.

**Update Protocol**: After ANY correction from the user, add an entry immediately. No exceptions.

---

## Active Prevention Rules

_These are distilled from lessons below. Check these FIRST before writing any code._

1. **[BUN]** Always use `bun` commands. Never `npm` or `yarn`. (`bun add`, `bun run`, `bunx`)
2. **[NODE]** Target Node 22 LTS. Never reference Node 16 (EOL).
3. **[REACT]** Use React 19 patterns. No class components. Prefer `use()` hook where applicable.
4. **[SOLID]** Every new component must follow Single Responsibility. One component = one job.
5. **[TAILWIND]** Never use inline styles. All styling via Tailwind utility classes.
6. **[GSAP]** Use `@gsap/react` hook `useGSAP()` for React integration. Never raw `gsap.to()` in useEffect.
7. **[FASTAPI]** Always use async route handlers. Never blocking I/O in routes.
8. **[PYDANTIC]** Use Pydantic v2 syntax (`model_validator`, `field_validator`). Not v1 (`@validator`).
9. **[SQLALCHEMY]** Use SQLAlchemy 2.0 style (`Mapped[]`, `mapped_column`). Not legacy `Column()`.
10. **[RAG]** Always ground LLM responses in RAG chunks. Never let the model freestyle on medication info.
11. **[PROMPTS]** Include explicit output format instructions in every LLM prompt.
12. **[CORS]** Configure CORS in the first hour. Don't wait until integration to discover issues.
13. **[ENV]** Never hardcode API keys. Always use environment variables via `pydantic-settings`.
14. **[TONE]** FocusFlow AI output must NEVER use guilt, shame, or pressure language.
15. **[ACCESSIBILITY]** All interactive elements must have `aria-label` or visible labels. No icon-only buttons without labels.

---

## Lesson Log

_Format:_
```
### [CATEGORY] - [Date] [Time]
**Mistake**: What went wrong
**Root Cause**: Why it happened  
**Fix**: What was done to fix it
**Prevention Rule**: Rule to prevent recurrence (add to Active Prevention Rules above)
**Severity**: low | medium | high
```

---

### [TEMPLATE] - YYYY-MM-DD HH:MM
**Mistake**: _describe the mistake_
**Root Cause**: _why it happened_
**Fix**: _what fixed it_
**Prevention Rule**: _rule added to prevent this_
**Severity**: low | medium | high

---

_No lessons logged yet. This file will grow throughout the hackathon._
_Remember: Every correction is a gift. Log it, learn from it, never repeat it._

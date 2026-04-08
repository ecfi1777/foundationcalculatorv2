

# Fix: Discard All Drafts on Load

## Change — `src/hooks/useCalculatorState.tsx`

**Single block replacement** (~lines 232–238): Change `if (a.isDraft && !hasRequiredData(a))` to `if (a.isDraft)` with updated comments explaining why unconditional discard is correct (steps/cylinder pre-fill defaults making `hasRequiredData` unreliable).

No other files modified.


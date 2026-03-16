

## Plan: Same-tab Stripe Checkout redirect (iframe-safe)

Replace `window.open` with `window.top.location.href` when in an iframe, `window.location.href` otherwise. Remove all new-tab toast messaging. Ensure `finally` blocks clear loading state everywhere.

### Changes

**1. `src/lib/billing.ts`**
- Replace the current iframe/window.open block with:
```typescript
if (!data?.url) throw new Error("Checkout URL was not returned.");
const inIframe = window.self !== window.top;
if (inIframe) {
  window.top!.location.href = data.url;
} else {
  window.location.href = data.url;
}
return data.url;
```

**2. `src/components/PaywallModal.tsx`**
- Remove the `inIframe` check, the "new tab" toast, and the conditional `onClose()`
- Keep `try/catch/finally` with `setLoading(false)` in `finally`

**3. `src/pages/Settings.tsx`**
- Remove iframe toast logic after `startCheckout`
- Keep `try/catch/finally` with `setBillingLoading(false)` in `finally`

**4. `src/pages/UpgradeRedirect.tsx`**
- Remove the `redirected` state and its "complete in new tab" UI
- Keep error handling as-is; successful `startCheckout` will redirect the top window away

Four files, narrowly scoped to redirect logic and loading cleanup only.


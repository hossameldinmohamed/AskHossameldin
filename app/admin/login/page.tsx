import { AdminLoginForm } from "@/components/admin/admin-login-form";

// This page has no data dependency, so Next.js would otherwise statically
// prerender it at build time - but our CSP is nonce-based, and a nonce only
// exists per-request. A statically prerendered page has no per-request nonce
// to attach to Next's own hydration scripts, so the browser's CSP silently
// blocks them: the page renders but never becomes interactive (no click
// handlers, no Enter-to-submit). Forcing dynamic rendering here guarantees a
// fresh nonce - and therefore working hydration - on every request.
export const dynamic = "force-dynamic";

export default function AdminLoginPage() {
  return <AdminLoginForm />;
}

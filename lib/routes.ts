/**
 * The dashboard keeps its state in the URL so every screen in the Figma page
 * has a link of its own: `tab`, and which `customer` is signed in (the
 * empty-state screen is a customer with nothing pending).
 */

export type Tab = "pending" | "active" | "inactive";
export type Customer = "default" | "new";

export type DashboardState = {
  tab: Tab;
  customer: Customer;
};

type Params = Record<string, string | string[] | undefined>;

const first = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

/* Active opens by default. The pending applications had a timeline view
   once; an old ?view=timeline link still lands on Pending. */
export function readDashboardState(params: Params): DashboardState {
  const tab = first(params.tab);
  const pendingView = first(params.view) === "timeline";
  return {
    tab: tab === "active" || tab === "pending" || tab === "inactive" ? tab : pendingView ? "pending" : "active",
    customer: first(params.customer) === "new" ? "new" : "default",
  };
}

export function dashboardHref(state: Partial<DashboardState> = {}) {
  const query = new URLSearchParams();
  const tab = state.tab ?? "active";
  if (tab !== "active") query.set("tab", tab);
  if (state.customer === "new") query.set("customer", "new");
  const search = query.toString();
  return search ? `/dashboard?${search}` : "/dashboard";
}

export function policyHref(id: string, customer: Customer = "default") {
  const base = `/dashboard/policies/${encodeURIComponent(id)}`;
  return customer === "new" ? `${base}?customer=new` : base;
}

/** An application's own page: where it stands and what comes next. */
export function applicationHref(id: string, customer: Customer = "default") {
  const base = `/dashboard/applications/${encodeURIComponent(id)}`;
  return customer === "new" ? `${base}?customer=new` : base;
}

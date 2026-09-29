/**
 * The dashboard keeps its state in the URL so every screen in the Figma page
 * has a link of its own: `tab`, the timeline `view`, and which `customer` is
 * signed in (the empty-state screen is a customer with nothing pending).
 */

export type Tab = "pending" | "active" | "inactive";
export type Customer = "default" | "new";

export type DashboardState = {
  tab: Tab;
  timeline: boolean;
  customer: Customer;
};

type Params = Record<string, string | string[] | undefined>;

const first = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

export function readDashboardState(params: Params): DashboardState {
  const tab = first(params.tab);
  return {
    tab: tab === "active" || tab === "inactive" ? tab : "pending",
    timeline: first(params.view) === "timeline",
    customer: first(params.customer) === "new" ? "new" : "default",
  };
}

export function dashboardHref(state: Partial<DashboardState> = {}) {
  const query = new URLSearchParams();
  if (state.tab && state.tab !== "pending") query.set("tab", state.tab);
  if (state.timeline) query.set("view", "timeline");
  if (state.customer === "new") query.set("customer", "new");
  const search = query.toString();
  return search ? `/dashboard?${search}` : "/dashboard";
}

export function policyHref(id: string, customer: Customer = "default") {
  const base = `/dashboard/policies/${encodeURIComponent(id)}`;
  return customer === "new" ? `${base}?customer=new` : base;
}

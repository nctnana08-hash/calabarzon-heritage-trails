import { Outlet, createFileRoute } from "@tanstack/react-router";

// Layout route for /destinations — its children are the list (destinations.index)
// and the detail page (destinations.$slug). It only renders the matched child.
export const Route = createFileRoute("/destinations")({
  component: () => <Outlet />,
});

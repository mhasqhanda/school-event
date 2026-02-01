import { Suspense } from "react";
import LoadingScreen from "@/components/loading-screen";
import BuyerDashboardClient from "./buyer-dashboard-client";

export default function BuyerDashboardPage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <BuyerDashboardClient />
    </Suspense>
  );
}

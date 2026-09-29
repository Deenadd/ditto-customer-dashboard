import { ProgressiveBlur } from "@/components/ui/progressive-blur";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <ProgressiveBlur />
    </>
  );
}

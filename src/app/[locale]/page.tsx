"use client";

import { usePathname } from "next/navigation";
import WidgetWrapper from "../../components/widgets/WidgetWrapper";

export default function HomePage() {
  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "en";

  return (
    <div className="space-y-6">
      <WidgetWrapper
        position="hero"
        pageType="home"
        minHeight="min-h-[400px]"
        onLoad={(position) =>
          console.log(`Loaded widget at ${position} successfully`)
        }
        onError={(err, position) =>
          console.error(`Failed to load widget at ${position}:`, err)
        }
      >
        Test
      </WidgetWrapper>
    </div>
  );
}

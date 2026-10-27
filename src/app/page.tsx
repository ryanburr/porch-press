import { Suspense } from "react";
import { FrontPage } from "@/components/front-page";

// FrontPage reads ?town= on the client; Cache Components needs that behind Suspense.
export default function Home() {
  return (
    <Suspense>
      <FrontPage />
    </Suspense>
  );
}

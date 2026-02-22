import { RouterProvider } from "react-router";
import { router } from "./routes";

export default function App() {
  return (
    // The outer div is the "desktop" background (darker gray)
    <div className="min-h-screen bg-gray-200 flex justify-center">

      {/* The inner div is your "mobile phone" screen limit */}
      <div className="w-full max-w-[430px] bg-[#F8FAFC] min-h-screen relative shadow-2xl overflow-x-hidden">

        <RouterProvider router={router} />

      </div>

    </div>
  );
}
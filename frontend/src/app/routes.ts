import { createBrowserRouter } from "react-router";
import { TicketList } from "./pages/TicketList";
import { TicketDetail } from "./pages/TicketDetail";
import { PastTicketDetail } from "./pages/PastTicketDetail";
import { ChecklistPage } from "./pages/ChecklistPage";
import { ChatInterface } from "./pages/ChatInterface";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: TicketList,
  },
  {
    path: "/ticket/:ticketId",
    Component: TicketDetail,
  },
  {
    path: "/past-ticket/:ticketId",
    Component: PastTicketDetail,
  },
  {
    path: "/checklist/:ticketId",
    Component: ChecklistPage,
  },
  {
    path: "/chat/:ticketId",
    Component: ChatInterface,
  },
]);
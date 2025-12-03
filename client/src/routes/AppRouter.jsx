import { Route, Routes } from "react-router-dom";
import Index from "../pages/Index/Index.jsx";
import ChatPage from "../pages/ChatPage/ChatPage.jsx";

const AppRouter = () => {
  return (
    <>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/chat" element={<ChatPage />} />
      </Routes>
    </>
  );
};

export default AppRouter;

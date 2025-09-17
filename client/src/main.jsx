import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { Toaster as Sonner } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { configureStore } from "@reduxjs/toolkit";
import { Provider } from 'react-redux';
import rootReducer from "./reducer";
import { SocketContext, socket } from './context/socket'; // Add this

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
    },
  },
});

export const store = configureStore({
  reducer: rootReducer
});

createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <QueryClientProvider client={queryClient}>
      <SocketContext.Provider value={socket}> {/* Add this */}
        <TooltipProvider>
          <Sonner position="bottom-right" theme="system" closeButton />
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </TooltipProvider>
      </SocketContext.Provider> {/* Add this */}
    </QueryClientProvider>
  </Provider>
);

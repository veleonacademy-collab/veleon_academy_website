import { QueryClient, QueryCache, MutationCache } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { getErrorMessage } from "../utils/errorHandler";

// Central React Query client for the app.
export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error: Error) => {
      const message = getErrorMessage(error);
      toast.error(message);
    },
  }),
  mutationCache: new MutationCache({
    onError: (error: Error) => {
      const message = getErrorMessage(error);
      toast.error(message);
    },
  }),
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});




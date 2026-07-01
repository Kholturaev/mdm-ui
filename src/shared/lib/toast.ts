import { toast } from 'react-toastify';

/** Thin wrapper so call sites don't depend on react-toastify directly. */
export const notify = {
  success: (message: string) => toast.success(message),
  error: (message: string) => toast.error(message),
};

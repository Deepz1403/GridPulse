import { useSelector, useDispatch } from "react-redux";
import {
  loginSuccess,
  loginFailure,
  loginStart,
  logout,
} from "@/slices/authSlice";
import { toast } from "sonner";
export const useAuth = () => {
  const dispatch = useDispatch();
  const auth = useSelector((state) => state.auth);


  const login = async(credentials)=>{
    try {
        dispatch(loginStart());
        const mockResponse = {
            token: 'mock-jwt-token',
            data: {
              employee: {
                id: 'EMP001',
                name: 'John Doe',
                email: credentials.email,
                role: credentials.email.includes('manager') ? 'manager' : 'employee',
                substation: credentials.email.includes('manager') ? null : 'North Station Alpha',
              }
            }
          };
          
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 500));
          
          if (credentials.email && credentials.password) {
            dispatch(loginSuccess({
              user: mockResponse.data.employee,
              token: mockResponse.token,
            }));
            toast.success('Login successful');
            return true;
          } else {
            throw new Error('Invalid credentials');
          }
    } catch (error) {
        dispatch(loginFailure(error instanceof Error ? error.message : 'Login failed'));
        toast.error(error instanceof Error ? error.message : 'Login failed');
        return false;
    }
  }
  const register = async (data) => {
    try {
      dispatch(loginStart());
      
      // In a real app, this would be a fetch call to your backend
      // Example API call using fetch:
      // const response = await fetch('/api/register', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(data)
      // });
      // const result = await response.json();
      
      // Mock successful registration for development
      await new Promise(resolve => setTimeout(resolve, 500));
      
      toast.success('Registration successful');
      return true;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Registration failed');
      return false;
    }
  };

  const logoutUser = () => {
    dispatch(logout());
    toast.info('You have been logged out');
  };

  return {
    ...auth,
    login,
    register,
    logout: logoutUser,
  };
};

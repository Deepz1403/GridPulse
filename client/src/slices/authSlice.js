import { createSlice } from "@reduxjs/toolkit";
const initialState = {
    user: null,
    token: localStorage.getItem('token'),
    isAuthenticated: !!localStorage.getItem('token'),
    isLoading: false,
    error: null,
  };

const authSlice = createSlice({
    name:'auth',
    initialState,
    reducers:{
        loginStart: (state) => {
            state.isLoading = true;
            state.error = null;
          },
          loginSuccess: (state, action) => {
            state.isLoading = false;
            state.isAuthenticated = true;
            state.user = action.payload.user;
            state.token = action.payload.token;
            localStorage.setItem('token', action.payload.token);
          },
          loginFailure: (state, action) => {
            state.isLoading = false;
            state.error = action.payload;
            state.isAuthenticated = false;
            state.user = null;
            state.token = null;
          },
          logout: (state) => {
            state.isAuthenticated = false;
            state.user = null;
            state.token = null;
            localStorage.removeItem('token');
          },
    }
})

export const {loginFailure,loginStart,loginSuccess,logout} = authSlice.actions;
export default  authSlice.reducer
import { useState } from "react";
import background from "../assets/images/backgroundImage.jpeg";
import logo from "../assets/images/image.png";
import { Link, useNavigate } from "react-router-dom";
import { IoIosEyeOff, IoIosEye } from "react-icons/io";
import axios from "axios"; // Make sure axios is installed
import api from "@/config/api";

const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  
  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
    role: 'attendant'
  });
  const [isManager, setIsManager] = useState(false);

  // Registration state
  const [registerData, setRegisterData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'employee',
    substation: '',
  });

  const handleLoginChange = (e) => {
    setLoginData({
      ...loginData,
      [e.target.name]: e.target.value,
    });
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    
    try {
      const response = await axios.post(`${api}/login`, loginData, {
        withCredentials: true // This is important for cookies/sessions to work
      });
      console.log(response)
      setIsLoading(false);
      navigate('/');
    } catch (err) {
      setIsLoading(false);
      if (err.response && err.response.data) {
        setError(err.response.data.message);
      } else {
        setError("Login failed. Please try again.");
      }
    }
  };

  return (
    <div className="w-[100vw] h-[100vh] flex bg-[#211F1E] overflow-x-hidden relative">
      <div className="h-full hidden lg:block lg:w-3/4 relative">
        <img
          src={background}
          alt="Industrial background"
          loading="lazy"
          className="inset-0 w-[1025px] h-[805px] object-cover opacity-70 shadow-[5px_5px_4px_0px_#46454540]"
        />
      </div>
      <div className="flex w-full lg:w-1/2 h-full bg-[#211F1E] items-center justify-center">
        <div className="w-full max-w-md">
          <div className=" w-full flex flex-col items-center justify-center">
            <img src={logo} className="w-[269px] h-[245px]" loading="lazy" />
          </div>
          <div className="text-center text-white -mt-6">
            <p className="font-bold text-2xl leading-[28.8px] tracking-[0.03em]">
              Nice to see you again
            </p>
          </div>
          
          {error && (
            <div className="bg-red-500 text-white p-2 rounded-md mb-4 mx-20 text-center">
              {error}
            </div>
          )}
          
          <form onSubmit={handleLoginSubmit} className="w-full max-h-screen flex flex-col space-y-2 px-20 py-3">
            <div className="w-full flex flex-col space-y-1 items-start">
              <label className="font-lato font-bold text-[13px] leading-[15.6px] tracking-[0.03em] text-white">
                Login
              </label>
              <input
                id="email"
                name="email"
                className="w-full h-[41px] rounded-[5px] bg-[#F2F2F280] border
                border-gray-800 px-3 py-2 text-white placeholder:text-white 
                focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="E-mail"
                type="email"
                value={loginData.email}
                onChange={handleLoginChange}
                required
              />
            </div>
            <div className="flex flex-col space-y-1 items-start relative">
              <label className="font-lato font-bold text-[13px] leading-[15.6px] tracking-[0.03em] text-white">
                Password
              </label>
              <input
                id="password"
                name="password"
                className="w-full h-[41px] rounded-[5px] bg-[#F2F2F280] border border-gray-800 px-3 py-2 text-white placeholder:text-white pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Password"
                type={showPassword ? "text" : "password"}
                value={loginData.password}
                onChange={handleLoginChange}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 bottom-2 -translate-y-1/2 text-gray-500 hover:text-gray-400"
              >
                {showPassword ? (
                  <IoIosEyeOff size={16} />
                ) : (
                  <IoIosEye size={16} />
                )}
              </button>
            </div>
            <div className="w-full mx-auto flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <label className="inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={isManager}
                    onChange={() => {
                      setIsManager(!isManager);
                      setLoginData(prev => ({
                        ...prev,
                        role: !isManager ? 'manager' : 'attendant'
                      }));
                    }}
                  />
                  <div
                    className="relative w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4
                    peer-focus:ring-blue-300 dark:peer-focus:ring-gray-600 rounded-full peer
                    dark:bg-gray-700 peer-checked:after:translate-x-full
                    rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white
                    after:content-[''] after:absolute after:top-[2px] after:start-[2px]
                    after:bg-white after:border-gray-300 after:border after:rounded-full
                    after:h-4 after:w-4 after:transition-all dark:border-gray-600
                    peer-checked:bg-[#313030]"
                  ></div>
                  <span className="ms-3 text-sm font-medium text-gray-300">
                    {isManager ? "Manager" : "Attendant"}
                  </span>
                </label>
              </div>
              <Link
                to="/forgot-password"
                className="text-sm text-gray-300 hover:text-gray-100 transition-colors"
              >
                Forgot Password?
              </Link>
            </div>
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-[41px] rounded-md bg-blue-500 px-3 py-2
                text-white hover:bg-blue-600 transition-colors disabled:bg-blue-300"
              >
                {isLoading ? "Signing in..." : "Sign in"}
              </button>
            </div>

          </form>
          <div className="text-center text-xs text-white absolute right-2.5 -bottom-[200px]">
            © Grid Pulse 2024
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

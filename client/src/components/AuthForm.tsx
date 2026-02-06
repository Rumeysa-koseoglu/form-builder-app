import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axiosInstance";
import { motion } from "framer-motion";

function AuthForm() {
  const navigate = useNavigate();
  const [isLogin, setIslogin] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormData({ ...formData, email: "", password: "", name: "" });

    const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";

    try {
      const res = await api.post(endpoint, {
        email: formData.email,
        password: formData.password,
        ...(isLogin ? {} : { name: formData.name }),
      });

      localStorage.setItem("token", res.data.token);
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      alert(isLogin ? "Login failed" : "Register failed");
    }
  };

  return (
    /* Auth form */ <div className="h-screen w-screen flex flex-col sm:gap-50 font-ubuntu">
      {/** */}
      <div className="w-full h-full flex flex-col items-center justify-center">
        <div className="absolute top-1/2 -left-37.5 transform -translate-y-1/2 w-100 h-120 bg-indigo-400 rounded-full blur-[120px] opacity-40 z-0 pointer-events-none" />
        {/** */}
        <div className="absolute -top-25 -right-25 w-70 h-70 bg-indigo-300 rounded-full blur-[50px] opacity-30 z-0 pointer-events-none" />
        <motion.p
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="p-10 mt-10 text-6xl flex flex-col gap-4 font-bold"
        >
          WELCOME TO <br />
          <span className="ml-80 text-indigo-700">FORM BUILDER</span>
        </motion.p>
        {isLogin ? (
          /* Login form */
          <form
            className="flex flex-col items-center justify-center gap-4 w-full md:w-125 bg-white h-full md:h-120 p-6 rounded-4xl "
            onSubmit={handleSubmit}
          >
            <p className="text-3xl font-semibold text-[#4f39f6]">LOGIN</p>
            <p className="font-light text-sm mb-5">
              Don't you have an account?
              <span
                className="text-blue-600 cursor-pointer hover:underline ml-2"
                onClick={() => setIslogin(!isLogin)}
              >
                Sign Up
              </span>
            </p>
            <label className="text-base md:text-lg w-full md:w-90 text-start text-indigo-600 font-semibold">
              Email
            </label>
            <input
              className="outline-0 bg-[#f6f6f6] p-4 w-full md:w-90 text-[15px] rounded-xl mb-4 "
              type="email"
              placeholder="Enter your email.."
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />

            <label className="text-base md:text-lg w-full md:w-90 text-start text-indigo-600 font-semibold">
              Password
            </label>
            <input
              className="outline-0 bg-[#f6f6f6] p-4 w-full md:w-90 text-[15px] rounded-xl mb-4 "
              type="password"
              placeholder="Enter your password.."
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
            />

            <button
              className="bg-[#4f39f6] hover:scale-100  active:transform-[translateY(-6px)] transition-transform duration-100 cursor-pointer text-white text-lg  md:text-xl p-3 w-full md:w-90 rounded-xl "
              type="submit"
            >
              Log In
            </button>
          </form>
        ) : (
          // Sign up form
          <form
            className="flex flex-col items-center justify-center gap-4 w-full md:w-125 bg-white h-full md:h-150 p-6 rounded-4xl "
            onSubmit={handleSubmit}
          >
            <p className="text-3xl font-semibold text-[#4f39f6]">SIGNUP</p>
            <p className="font-light text-sm mb-5">
              You already have an account?
              <span
                className="text-blue-600 cursor-pointer hover:underline ml-2"
                onClick={() => setIslogin(!isLogin)}
              >
                Log In
              </span>
            </p>
            <label className="text-md md:text-lg w-full md:w-90 text-start text-indigo-600 font-semibold">
              Full Name
            </label>
            <input
              className="outline-0 bg-[#f6f6f6] p-4 w-full md:w-90 text-[15px] rounded-xl mb-4 "
              type="text"
              placeholder="Enter your full name.."
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
            <label className="text-md md:text-lg w-full md:w-90 text-start text-indigo-600 font-semibold">
              Email
            </label>
            <input
              className="outline-0 bg-[#f6f6f6] p-4 w-full md:w-90 text-[15px] rounded-xl mb-4 "
              type="email"
              placeholder="Enter your email.."
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />

            <label className="text-md md:text-lg w-full md:w-90 text-start text-indigo-600 font-semibold">
              Password
            </label>
            <input
              className="outline-0 bg-[#f6f6f6] p-4 w-full md:w-90 text-[15px] rounded-xl mb-4 "
              type="password"
              placeholder="Enter your password.."
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
            />

            <button
              className="bg-[#4f39f6] hover:scale-100  active:transform-[translateY(-6px)] transition-transform duration-100 cursor-pointer text-white text-lg  md:text-xl p-3 w-full md:w-90 rounded-xl "
              type="submit"
            >
              Sign Up
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default AuthForm;

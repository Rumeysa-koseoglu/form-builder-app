import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axiosInstance";

function AuthForm() {
  const navigate = useNavigate();
  const [isLogin, setIslogin] = useState(true);
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
      navigate("/");
    } catch (err) {
      console.error(err);
      alert(isLogin ? "Login failed" : "Register failed");
    }
  };

  return (
    /* Auth form */
    <div className="w-screen h-screen flex justify-center items-center my-auto bg-[#f8f8f8]">
      {isLogin ? (
        /* Login form */
        <form
          className="flex flex-col items-center md:justify-center gap-4 w-full md:w-125 bg-white h-full md:h-120 p-6 rounded-lg "
          onSubmit={handleSubmit}
        >
          <p className="text-3xl font-semibold text-blue-500">LOGIN</p>
          <p className="font-light text-sm mb-5">
            Don't you have an account?
            <span
              className="text-blue-600 cursor-pointer hover:underline ml-2"
              onClick={() => setIslogin(!isLogin)}
            >
              Sign Up
            </span>
          </p>
          <label className="text-lg md:text-xl w-full md:w-90 text-start">
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

          <label className="text-lg md:text-xl w-full md:w-90 text-start">
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
            className="bg-blue-600 hover:scale-100  active:transform-[translateY(-6px)] transition-transform duration-100 cursor-pointer text-white text-lg  md:text-xl p-3 w-full md:w-90 rounded-xl "
            type="submit"
          >
            Log In
          </button>
        </form>
      ) : (
        // Sign up form
        <form
          className="flex flex-col items-center md:justify-center gap-4 w-full md:w-125 bg-white h-full md:h-150 p-6 rounded-lg "
          onSubmit={handleSubmit}
        >
          <p className="text-3xl font-semibold text-blue-500">SIGNUP</p>
          <p className="font-light text-sm mb-5">
            You already have an account?
            <span
              className="text-blue-600 cursor-pointer hover:underline ml-2"
              onClick={() => setIslogin(!isLogin)}
            >
              Log In
            </span>
          </p>
          <label className="text-lg md:text-xl w-full md:w-90 text-start">
            Full Name
          </label>
          <input
            className="outline-0 bg-[#f6f6f6] p-4 w-full md:w-90 text-[15px] rounded-xl mb-4 "
            type="text"
            placeholder="Enter your full name.."
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <label className="text-lg md:text-xl w-full md:w-90 text-start">
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

          <label className="text-lg md:text-xl w-full md:w-90 text-start">
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
            className="bg-blue-600 hover:scale-100  active:transform-[translateY(-6px)] transition-transform duration-100 cursor-pointer text-white text-lg  md:text-xl p-3 w-full md:w-90 rounded-xl "
            type="submit"
          >
            Sign Up
          </button>
        </form>
      )}
    </div>
  );
}

export default AuthForm;

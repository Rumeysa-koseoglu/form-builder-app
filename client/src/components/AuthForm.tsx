import React from "react";

function AuthForm() {
  return (
    <div className="w-screen h-screen flex justify-center items-center my-auto bg-[#f8f8f8]">
      {/* Auth form */}
      <div className="flex flex-col items-center md:justify-center gap-4 w-full md:w-125 bg-white h-full md:h-120 p-4 rounded-lg ">
        <p className="text-3xl font-semibold text-blue-500">LOGIN</p>
        <p className="font-light text-sm mb-5">
          Don't you have an account?
          <span className="text-blue-600 cursor-pointer hover:underline ml-2">
            Sign Up
          </span>
        </p>
        <label className="text-lg md:text-xl w-full md:w-90 text-start">
          Email
        </label>
        <input
          className="outline-0 bg-[#f6f6f6] p-4 w-full md:w-90 text-[15px] rounded-xl mb-4 "
          type="text"
          placeholder="Enter your email.."
        />

        <label className="text-lg md:text-xl w-full md:w-90 text-start">
          Password
        </label>
        <input
          className="outline-0 bg-[#f6f6f6] p-4 w-full md:w-90 text-[15px] rounded-xl mb-4 "
          type="text"
          placeholder="Enter your password.."
        />

        <button className="bg-blue-600 hover:scale-100  active:transform-[translateY(-6px)] transition-transform duration-100 cursor-pointer text-white text-lg  md:text-xl p-3 w-full md:w-90 rounded-xl ">
          Log In
        </button>
      </div>
    </div>
  );
}

export default AuthForm;

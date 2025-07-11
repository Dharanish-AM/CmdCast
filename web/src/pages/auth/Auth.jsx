import React, { useState } from "react";

const Auth = ({ onLogin }) => {
  const [isSignUp, setIsSignUp] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const email = formData.get("email");
    const password = formData.get("password");
    
    if (isSignUp) {
      // Handle signup logic here
      console.log("Signup:", { email, password });
      // For now, just auto-login after signup
      onLogin(email, password);
    } else {
      // Handle login
      onLogin(email, password);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="bg-white/10 backdrop-blur-2xl rounded-3xl shadow-2xl p-8 border border-white/20">
          <div className="text-center flex flex-col items-center gap-4 mb-8">
            <div className="w-19 h-19 aspect-square">
              <img className="w-full h-full aspect-square" src="/CmdCast-logo.png" alt="CmdCast Logo" />
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-2">CmdCast</h1>
              <p>Remote desktop control</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <input
                type="email"
                name="email"
                required
                className="w-full px-4 py-4 bg-white/10 border border-gray-200 rounded-2xl placeholder-gray-400 focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all backdrop-blur-sm"
                placeholder="Email address"
              />
            </div>

            <div>
              <input
                type="password"
                name="password"
                required
                className="w-full px-4 py-4 bg-white/10 border border-gray-200 rounded-2xl placeholder-gray-400 focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all backdrop-blur-sm"
                placeholder="Password"
              />
            </div>

            {isSignUp && (
              <div>
                <input
                  type="password"
                  name="confirmPassword"
                  required
                  className="w-full px-4 py-4 bg-white/10 border border-gray-200 rounded-2xl placeholder-gray-400 focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all backdrop-blur-sm"
                  placeholder="Confirm Password"
                />
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-[#2f4858] text-white font-semibold py-4 px-6 rounded-2xl transition-all transform hover:scale-[1.02] shadow-xl"
            >
              {isSignUp ? "Sign Up" : "Sign In"}
            </button>

            <div className="text-center">
              <button 
                type="button" 
                onClick={() => setIsSignUp(!isSignUp)}
                className="transition-colors text-sm"
              >
                {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
                <span className="text-blue-500 hover:text-blue-600 cursor-pointer">
                  {isSignUp ? "Sign In" : "Sign Up"}
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Auth;

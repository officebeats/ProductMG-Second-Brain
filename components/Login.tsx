
import * as React from 'react';
import { Logo } from './icons/Icons';

interface LoginProps {
  onLogin: () => void;
}

const GoogleIcon = () => (
    <svg className="w-6 h-6 mr-3" viewBox="0 0 48 48">
        <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path>
        <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path>
        <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path>
        <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C39.902,35.619,44,29.932,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
    </svg>
);

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text transition-colors duration-300">
      <div className="w-full max-w-sm p-8 space-y-8 bg-light-bg dark:bg-dark-bg rounded-3xl shadow-neumorphic-light dark:shadow-neumorphic-dark text-center animate-fade-in">
        <div>
          <Logo className="w-20 h-20 mx-auto mb-4" />
          <h1 className="text-3xl font-bold">ProductMG</h1>
          <p className="mt-2 text-opacity-80">The tool that thinks like you.</p>
        </div>
        <button
          onClick={onLogin}
          className="w-full flex items-center justify-center px-4 py-3 font-medium rounded-xl text-light-text dark:text-dark-text bg-light-bg dark:bg-dark-bg shadow-neumorphic-light-sm dark:shadow-neumorphic-dark-sm hover:shadow-neumorphic-light-sm-inset dark:hover:shadow-neumorphic-dark-sm-inset active:shadow-neumorphic-light-sm-inset dark:active:shadow-neumorphic-dark-sm-inset focus:outline-none transition-all duration-200"
        >
          <GoogleIcon />
          Sign in with Google
        </button>
      </div>
    </div>
  );
};

export default Login;
import * as React from 'react';
import { Logo, SpinnerIcon } from './icons/Icons';

interface LoginProps {
  onLogin: () => void;
}

const GoogleIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 48 48">
        <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path>
        <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path>
        <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path>
        <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C39.902,35.619,44,29.932,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
    </svg>
);

const MicrosoftIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 23 23">
        <path fill="#f3f3f3" d="M0 0h23v23H0z"/>
        <path fill="#f35325" d="M1 1h10v10H1z"/>
        <path fill="#81bc06" d="M12 1h10v10H12z"/>
        <path fill="#05a6f0" d="M1 12h10v10H1z"/>
        <path fill="#ffba08" d="M12 12h10v10H12z"/>
    </svg>
);

const GitHubIcon = () => (
    <svg className="w-5 h-5 fill-current" viewBox="0 0 16 16">
        <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
    </svg>
);

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [authMethod, setAuthMethod] = React.useState<'none' | 'email' | 'google' | 'microsoft' | 'github'>('none');

  const handleEmailLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    
    setIsLoading(true);
    setAuthMethod('email');
    
    // Simulate API call
    setTimeout(() => {
        onLogin();
    }, 1000);
  };

  const handleSocialLogin = (method: 'google' | 'microsoft' | 'github') => {
      setIsLoading(true);
      setAuthMethod(method);
      // Simulate API call
      setTimeout(() => {
          onLogin();
      }, 800);
  }

  const NeumorphicInput = "w-full px-4 py-3 rounded-xl bg-light-bg dark:bg-dark-bg shadow-neumorphic-light-inset dark:shadow-neumorphic-dark-inset focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all duration-200 text-sm font-medium";
  const SocialButtonClass = "flex-1 flex items-center justify-center p-3 rounded-xl bg-light-bg dark:bg-dark-bg shadow-neumorphic-light-sm dark:shadow-neumorphic-dark-sm hover:shadow-neumorphic-light-sm-inset dark:hover:shadow-neumorphic-dark-sm-inset active:shadow-neumorphic-light-sm-inset dark:active:shadow-neumorphic-dark-sm-inset transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed";

  return (
    <div className="flex items-center justify-center min-h-screen bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text transition-colors duration-300 px-4">
      <div className="w-full max-w-md p-8 space-y-8 bg-light-bg dark:bg-dark-bg rounded-3xl shadow-neumorphic-light dark:shadow-neumorphic-dark animate-fade-in">
        <div className="text-center">
          <Logo className="w-16 h-16 mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-1">
            <span className="text-light-text dark:text-white">Product</span>
            <span className="text-brand-primary ml-1">MG</span>
          </h1>
          <p className="text-sm text-opacity-60 font-medium opacity-60">The tool that thinks like you.</p>
        </div>

        <form onSubmit={handleEmailLogin} className="space-y-5">
            <div className="space-y-4">
                <div>
                    <input 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email address" 
                        className={NeumorphicInput}
                        required
                    />
                </div>
                <div>
                    <input 
                        type="password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password" 
                        className={NeumorphicInput}
                        required
                    />
                </div>
            </div>
            
            <div className="flex items-center justify-between text-xs">
                <label className="flex items-center space-x-2 cursor-pointer">
                    <input type="checkbox" className="rounded text-brand-primary focus:ring-brand-primary bg-transparent border-gray-300" />
                    <span>Remember me</span>
                </label>
                <button type="button" className="text-brand-primary hover:underline font-semibold">Forgot Password?</button>
            </div>

            <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center px-4 py-3 font-bold rounded-xl text-white bg-brand-primary shadow-md hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
            >
                {isLoading && authMethod === 'email' ? <SpinnerIcon /> : 'Sign In'}
            </button>
        </form>

        <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-light-shadow-2/30 dark:border-dark-shadow-2/50"></div>
            <span className="flex-shrink-0 mx-4 text-xs font-semibold opacity-50 uppercase tracking-wide">Or continue with</span>
            <div className="flex-grow border-t border-light-shadow-2/30 dark:border-dark-shadow-2/50"></div>
        </div>

        <div className="flex space-x-4">
            <button type="button" onClick={() => handleSocialLogin('google')} disabled={isLoading} className={SocialButtonClass} aria-label="Sign in with Google">
                {isLoading && authMethod === 'google' ? <SpinnerIcon /> : <GoogleIcon />}
            </button>
            <button type="button" onClick={() => handleSocialLogin('microsoft')} disabled={isLoading} className={SocialButtonClass} aria-label="Sign in with Microsoft">
                {isLoading && authMethod === 'microsoft' ? <SpinnerIcon /> : <MicrosoftIcon />}
            </button>
            <button type="button" onClick={() => handleSocialLogin('github')} disabled={isLoading} className={SocialButtonClass} aria-label="Sign in with GitHub">
                {isLoading && authMethod === 'github' ? <SpinnerIcon /> : <GitHubIcon />}
            </button>
        </div>

        <p className="text-center text-xs mt-6">
            Don't have an account? <button className="text-brand-primary font-bold hover:underline">Sign up</button>
        </p>
      </div>
    </div>
  );
};

export default Login;
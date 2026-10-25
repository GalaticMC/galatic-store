import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider 
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase'; 
import { ShoppingBag } from 'lucide-react';
import toast from 'react-hot-toast';
import emailjs from '@emailjs/browser'; // IMPORT EMAILJS

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const saveUserToDB = async (user) => {
    try {
      const userRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(userRef);

      if (!docSnap.exists()) {
        await setDoc(userRef, {
          email: user.email,
          name: user.displayName || 'New User',
          status: 'Active',
          role: user.email === 'notgalatic@gmail.com' ? 'Admin' : 'Customer',
          joinedDate: new Date().toISOString().split('T')[0],
          totalSpent: '৳0'
        });
      }
    } catch (err) {
      console.error("Error saving user to DB: ", err);
    }
  };

  const sendWelcomeEmail = async (userEmail) => {
    try {
      await emailjs.send(
        'service_hjrrabc',        // <-- YOUR SERVICE ID
        'template_ntow3lm', // <-- PASTE YOUR NEW WELCOME TEMPLATE ID HERE
        {
          to_name: userEmail
        },
        'u4xSqN4Kce2ST79ur'       // <-- YOUR PUBLIC KEY
      );
      console.log("Welcome email sent!");
    } catch (error) {
      console.error("Failed to send welcome email: ", error);
    }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    try {
      if (isLogin) {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        await saveUserToDB(userCredential.user);
        
        toast.success("Logged in successfully!");
        if (userCredential.user.email === 'notgalatic@gmail.com') {
          navigate('/admin');
        } else {
          navigate('/store'); 
        }
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await saveUserToDB(userCredential.user);
        
        // SEND WELCOME EMAIL ON SIGNUP
        await sendWelcomeEmail(email);

        toast.success("Account created! Check your email.");
        navigate('/store');
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      // Check if user is new before saving/sending email
      const userRef = doc(db, "users", result.user.uid);
      const docSnap = await getDoc(userRef);
      const isNewUser = !docSnap.exists();

      await saveUserToDB(result.user);
      
      // SEND WELCOME EMAIL IF NEW GOOGLE USER
      if (isNewUser) {
        await sendWelcomeEmail(result.user.email);
      }
      
      toast.success("Logged in with Google!");
      if (result.user.email === 'notgalatic@gmail.com') {
        navigate('/admin');
      } else {
        navigate('/store');
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-galatic-navy flex items-center justify-center p-4">
      <div className="relative z-10 w-full max-w-md bg-galatic-navy/80 backdrop-blur-xl border border-galatic-slate/30 p-8 rounded-3xl shadow-2xl">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-galatic-cream p-3 rounded-2xl mb-4">
            <ShoppingBag className="text-galatic-navy w-8 h-8" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>
        </div>

        <form onSubmit={handleAuth} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-galatic-sky mb-1">Email Address</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-galatic-slate/20 border border-galatic-slate/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-galatic-sky" placeholder="you@example.com" />
          </div>
          <div>
            <label className="block text-sm font-medium text-galatic-sky mb-1">Password</label>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-galatic-slate/20 border border-galatic-slate/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-galatic-sky" placeholder="••••••••" />
          </div>
          
          <button type="submit" className="w-full bg-galatic-cream text-galatic-navy font-bold py-3 rounded-xl hover:bg-white transition-all transform hover:scale-[1.02]">
            {isLogin ? 'LOG IN' : 'SIGN UP'}
          </button>
        </form>

        <div className="mt-6 flex items-center justify-center space-x-2">
          <div className="h-px bg-galatic-slate/50 w-full"></div>
          <span className="text-galatic-sky/50 text-sm px-2">or</span>
          <div className="h-px bg-galatic-slate/50 w-full"></div>
        </div>

        <div className="mt-6">
          <button onClick={handleGoogleLogin} type="button" className="w-full bg-white text-gray-800 font-bold py-3 rounded-xl hover:bg-gray-100 transition-all flex items-center justify-center gap-3">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>
        </div>

        <div className="mt-8 text-center">
          <button onClick={() => setIsLogin(!isLogin)} className="text-galatic-sky hover:text-white text-sm transition-colors">
            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Log in"}
          </button>
        </div>
      </div>
    </div>
  );
}
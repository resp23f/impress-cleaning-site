'use client'
import TurnstileWidget from '@/components/ui/TurnstileWidget'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Mail, ArrowRight, RefreshCw } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import Input from '@/components/ui/Input'
import PasswordInput from '@/components/ui/PasswordInput'
import toast from 'react-hot-toast'
export default function SignUpPage() {
const router = useRouter()
const [loading, setLoading] = useState(false)
const [googleLoading, setGoogleLoading] = useState(false)
const [formData, setFormData] = useState({
email: '',
password: '',
})
const [passwordStrength, setPasswordStrength] = useState(0)
const [captchaToken, setCaptchaToken] = useState(null)
const supabase = createClient()
const calculatePasswordStrength = (password) => {
let strength = 0
if (password.length >= 8) strength++
if (/[a-z]/.test(password)) strength++
if (/[A-Z]/.test(password)) strength++
if (/[0-9]/.test(password)) strength++
if (/[^A-Za-z0-9]/.test(password)) strength++
return strength
}
const handlePasswordChange = (e) => {
const password = e.target.value
setFormData({ ...formData, password })
setPasswordStrength(calculatePasswordStrength(password))
}
const handleEmailSignUp = async (e) => {
e.preventDefault()
setLoading(true)
try {
if (formData.password.length < 8) {
toast.error('Password must be at least 8 characters')
setLoading(false)
return
}
if (!captchaToken) {
toast.error('Please complete the security check')
setLoading(false)
return
}
const { data, error } = await supabase.auth.signUp({
email: formData.email,
password: formData.password,
options: {
emailRedirectTo: `${window.location.origin}/auth/callback?next=/auth/login`,
captchaToken,
},
})
if (error) throw error
router.push('/auth/verify-email?email=' + encodeURIComponent(formData.email))
} catch (error) {
console.error('Error signing up:', error)
toast.error(error.message || 'Failed to sign up')
} finally {
setLoading(false)
}
}
const handleGoogleSignIn = async () => {
setGoogleLoading(true)
try {
const { error } = await supabase.auth.signInWithOAuth({
provider: 'google',
options: {
redirectTo: `${window.location.origin}/auth/callback?next=/portal/dashboard`,
},
})
if (error) throw error
} catch (error) {
console.error('Error signing in with Google:', error)
toast.error('Failed to sign in with Google')
setGoogleLoading(false)
}
}
const getStrengthColor = () => {
if (passwordStrength === 0) return 'bg-slate-200'
if (passwordStrength <= 2) return 'bg-red-400'
if (passwordStrength === 3) return 'bg-amber-400'
return 'bg-emerald-400'
}
const getStrengthText = () => {
if (passwordStrength === 0) return ''
if (passwordStrength <= 2) return 'Weak'
if (passwordStrength === 3) return 'Medium'
return 'Strong'
}
const getStrengthTextColor = () => {
if (passwordStrength <= 2) return 'text-red-500'
if (passwordStrength === 3) return 'text-amber-500'
return 'text-emerald-500'
}
return (
<>
<style>{`html, body { background: #ffffff; }`}</style>
<div className="min-h-screen flex">
{/* Left Side - Branding Panel */}
<div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
{/* Soft gradient background */}
<div className="absolute inset-0 bg-gradient-to-br from-slate-100 via-slate-50 to-white" />
{/* Soft colored orbs */}
<div className="absolute top-10 left-10 w-96 h-96 bg-gradient-to-br from-teal-200/30 to-cyan-200/20 rounded-full blur-3xl" />
<div className="absolute bottom-20 right-10 w-[500px] h-[500px] bg-gradient-to-br from-sky-100/40 to-indigo-100/30 rounded-full blur-3xl" />
<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-gradient-to-br from-emerald-100/40 to-green-100/30 rounded-full blur-3xl" />
{/* Subtle pattern overlay */}
<div 
className="absolute inset-0 opacity-[0.015]"
style={{
backgroundImage: `radial-gradient(circle at 1px 1px, #1C294E 1px, transparent 0)`,
backgroundSize: '32px 32px'
}}
/>
{/* Glass card overlay */}
<div className="absolute inset-8 rounded-3xl bg-white/40 backdrop-blur-sm border border-white/60 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.08)]" />
{/* Content */}
<div className="relative z-10 flex flex-col justify-start p-16 w-full h-full">
{/* Logo */}
<div className="mb-40">
<Image
src="/ImpressLogoNoBackgroundBlue.png"
alt="Impress Cleaning Services"
width={200}
height={70}
className="h-25 w-auto"
priority
/>
</div>
{/* Middle content */}
<div className="max-w-sm">
<div className="flex items-center gap-2 mb-4">
<div className="h-0.5 w-8 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full" />
<span className="text-xs font-semibold text-emerald-600/80 uppercase tracking-widest">
Get Started
</span>
</div>
<h1 className="text-3xl font-bold text-slate-800 mb-4 leading-snug">
Join the <br />
<span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">
Impress Family
</span>
</h1>
<p className="text-slate-500 leading-relaxed">
Create your account to schedule cleanings, manage appointments, and enjoy a spotless home with ease.
</p>
</div>
</div>
</div>
{/* Right Side - Sign Up Form */}
<div className="w-full lg:w-1/2 flex items-center justify-center bg-white p-6 sm:p-12">
<div className="w-full max-w-md">
{/* Mobile logo */}
<div className="lg:hidden flex justify-center mb-8">
<Image
src="/ImpressLogoNoBackgroundBlue.png"
alt="Impress Cleaning Services"
width={180}
height={60}
className="h-12 w-auto"
priority
/>
</div>
{/* Form Container */}
<div className="lg:px-4">
<div className="text-center mb-8">
<h2 className="text-2xl font-bold text-slate-800 mb-2">
Create your account
</h2>
<p className="text-slate-400">
Start managing your cleanings today
</p>
</div>
{/* Google Sign In */}
<button
onClick={handleGoogleSignIn}
disabled={loading}
className="w-full flex items-center justify-center gap-2.5 px-4 py-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 shadow-sm hover:shadow transition-colors duration-200 text-sm font-medium text-slate-700 mb-6 disabled:opacity-50 disabled:cursor-not-allowed"
>                {googleLoading ? (
<RefreshCw className="w-5 h-5 animate-spin text-slate-400" />
) : (
<svg className="w-5 h-5" viewBox="0 0 24 24">
<path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
<path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
<path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
<path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
</svg>
)}
Continue with Google
</button>
{/* Divider */}
<div className="relative my-6">
<div className="absolute inset-0 flex items-center">
<div className="w-full border-t border-slate-100" />
</div>
<div className="relative flex justify-center text-sm">
<span className="px-4 bg-white text-slate-300 text-xs uppercase tracking-wide">or</span>
</div>
</div>
{/* Email Form */}
<form onSubmit={handleEmailSignUp} className="space-y-5">
<Input
type="email"
label="Email address"
placeholder="your@email.com"
value={formData.email}
onChange={(e) => setFormData({ ...formData, email: e.target.value })}
autoComplete="email"
required
icon={<Mail className="w-5 h-5" />}
/>
<div>
<PasswordInput
label="Create password"
placeholder="Minimum 8 characters"
value={formData.password}
onChange={handlePasswordChange}
autoComplete="new-password"
required
/>
{formData.password && (
<div className="mt-2.5">
<div className="flex gap-1">
{[...Array(5)].map((_, i) => (
<div
key={i}
className={`h-1 flex-1 rounded-full ${
i < passwordStrength ? getStrengthColor() : 'bg-slate-100'
} transition-all duration-300`}
/>
))}
</div>
{getStrengthText() && (
<p className={`text-xs mt-1.5 ${getStrengthTextColor()}`}>
{getStrengthText()}
</p>
)}
</div>
)}
</div>
<TurnstileWidget
onVerify={(token) => setCaptchaToken(token)}
onExpire={() => setCaptchaToken(null)}
className="mb-4"
/>
<button
type="submit"
disabled={loading || googleLoading || !captchaToken}                  className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold shadow-lg shadow-emerald-500/20 hover:shadow-xl hover:shadow-emerald-500/30 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
>
{loading ? (
<>
<RefreshCw className="w-4 h-4 animate-spin" />
Creating...
</>
) : (
<>
Create Account
<ArrowRight className="w-4 h-4" />
</>
)}
</button>
</form>
{/* Login link */}
<p className="mt-8 text-center text-slate-400">
Already have an account?{' '}
<Link 
href="/auth/login" 
className="text-emerald-600 font-semibold hover:text-emerald-700 transition-colors"
>
Sign in
</Link>
</p>
{/* Turnstile Notice */}
<p className="text-center text-xs text-slate-300 mt-6 leading-relaxed">
Protected by Cloudflare Turnstile
</p>            </div>
{/* Footer */}
<p className="text-center text-xs text-slate-300 mt-10">
© {new Date().getFullYear()} Impress Cleaning Services, LLC. All rights reserved.
</p>
</div>
</div>
</div>
</>
)
}
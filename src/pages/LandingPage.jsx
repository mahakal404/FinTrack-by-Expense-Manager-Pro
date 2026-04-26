import { Link } from 'react-router-dom';
import { PieChart, FileText, Lock, ArrowRight, Sparkles, Receipt } from 'lucide-react';

export default function LandingPage() {
  const features = [
    {
      title: 'Smart Budgeting',
      description: 'Auto-calculate 80% safe limits based on your monthly salary to never overspend.',
      icon: PieChart,
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10'
    },
    {
      title: 'Receipt Management',
      description: 'Store and organize all your transaction receipts locally for easy access and auditing.',
      icon: Receipt,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10'
    },
    {
      title: 'PDF Reports',
      description: 'Generate beautiful, detailed PDF reports of your expenses with automated pie charts.',
      icon: FileText,
      color: 'text-indigo-500',
      bg: 'bg-indigo-500/10'
    },
    {
      title: 'Secure & Local-First',
      description: 'Your sensitive financial data stays yours. Encrypted and synced securely when needed.',
      icon: Lock,
      color: 'text-purple-500',
      bg: 'bg-purple-500/10'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-900 overflow-hidden font-sans text-slate-100 flex flex-col">
      {/* Decorative Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-indigo-950/40 to-slate-900 pointer-events-none z-0" />
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-500/20 blur-[120px] pointer-events-none z-0" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-500/20 blur-[120px] pointer-events-none z-0" />

      {/* Navbar */}
      <nav className="relative z-10 flex items-center justify-between w-full max-w-7xl mx-auto px-6 py-6 lg:px-8">
        <div className="flex items-center gap-3">
          <img src="/app-logo.webp" alt="FinTrack Logo" className="h-10 w-auto drop-shadow-lg" />
          <span className="text-xl font-bold tracking-tight text-white">FinTrack <span className="text-emerald-400">Pro</span></span>
        </div>
        <Link to="/login" className="text-sm font-semibold text-slate-300 hover:text-white transition-colors flex items-center gap-2">
          Sign In <ArrowRight size={16} />
        </Link>
      </nav>

      <main className="relative z-10 flex-grow">
        {/* Hero Section */}
        <div className="max-w-7xl mx-auto px-6 py-20 sm:py-32 lg:px-8 text-center animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/80 border border-slate-700 backdrop-blur-sm mb-8">
            <Sparkles size={16} className="text-emerald-400" />
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">The Ultimate Financial Companion</span>
          </div>
          <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight text-white mb-8 leading-tight">
            Take Control of <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-indigo-400">Your Finances</span>
          </h1>
          <p className="max-w-2xl mx-auto text-lg sm:text-xl text-slate-400 mb-12">
            Track income, manage expenses, and achieve your savings goals with a beautifully designed, local-first dashboard built for modern professionals.
          </p>
          <div className="flex justify-center">
            <Link 
              to="/login" 
              className="px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-bold rounded-2xl text-lg transition-all transform hover:-translate-y-1 hover:shadow-[0_10px_40px_-10px_rgba(16,185,129,0.8)] flex items-center gap-3"
            >
              Get Started for Free
              <ArrowRight size={20} />
            </Link>
          </div>
        </div>

        {/* Features Section */}
        <div className="max-w-7xl mx-auto px-6 py-16 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white tracking-tight">Everything you need to succeed</h2>
            <p className="mt-4 text-slate-400 max-w-xl mx-auto">No confusing spreadsheets. Just clean, actionable insights that help you grow your wealth effortlessly.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-3xl p-8 hover:bg-slate-800/60 transition-colors">
                <div className={`w-14 h-14 rounded-2xl ${feature.bg} flex items-center justify-center mb-6`}>
                  <feature.icon size={28} className={feature.color} />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-slate-400 leading-relaxed text-sm">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="max-w-7xl mx-auto px-6 py-20 lg:px-8 mb-10">
          <div className="bg-gradient-to-br from-emerald-900/40 to-indigo-900/40 border border-slate-700/50 rounded-[3rem] p-12 sm:p-20 text-center relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none mix-blend-overlay"></div>
            <h2 className="text-4xl font-bold text-white mb-6 relative z-10">Ready to transform your financial life?</h2>
            <p className="text-lg text-slate-300 mb-10 max-w-2xl mx-auto relative z-10">Join thousands of smart individuals taking charge of their money today. Setup takes less than 60 seconds.</p>
            <Link 
              to="/login" 
              className="inline-flex items-center gap-3 px-8 py-4 bg-white hover:bg-slate-100 text-slate-900 font-bold rounded-2xl text-lg transition-all transform hover:scale-105 shadow-xl relative z-10"
            >
              Join now
              <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/60 relative z-10 bg-slate-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 opacity-50 hover:opacity-100 transition-opacity">
            <img src="/app-logo.webp" alt="Logo" className="w-6 h-6 grayscale" />
            <span className="text-sm font-semibold text-slate-400">FinTrack Pro © {new Date().getFullYear()}</span>
          </div>
          <p className="text-sm text-slate-500">Built with precision for modern wealth management.</p>
        </div>
      </footer>
    </div>
  );
}

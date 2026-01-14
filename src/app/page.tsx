import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Bot, Zap, Shield, BarChart3, ArrowRight } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      {/* Navbar */}
      <header className="px-6 py-4 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
            T
          </div>
          <span className="text-xl font-bold tracking-tight">Telegram Builder</span>
        </div>
        <nav className="hidden md:flex gap-6 text-sm font-medium text-slate-600">
          <Link href="#features" className="hover:text-blue-600">Features</Link>
          <Link href="#templates" className="hover:text-blue-600">Templates</Link>
          <Link href="#pricing" className="hover:text-blue-600">Pricing</Link>
        </nav>
        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost" size="sm">Log in</Button>
          </Link>
          <Link href="/signup">
            <Button size="sm">Start Free</Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1">
        <section className="py-20 md:py-32 px-6 text-center max-w-5xl mx-auto space-y-8">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            No-Code Telegram Automation is here
          </div>

          <h1 className="text-4xl md:text-7xl font-extrabold tracking-tight text-slate-900">
            Build Telegram Bots <br />
            <span className="text-blue-600">Without Writing Code</span>
          </h1>

          <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Create powerful workflows, auto-responders, and moderation tools in minutes.
            Connect your bot, drag-and-drop triggers and actions, and launch.
          </p>

          <div className="flex flex-col md:flex-row items-center justify-center gap-4 pt-4">
            <Link href="/dashboard">
              <Button size="lg" className="rounded-full px-8 text-base">
                Start Building for Free <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="rounded-full px-8 text-base">
              View Templates
            </Button>
          </div>

          {/* Visual/Demo Placeholder */}
          <div className="mt-16 relative mx-auto max-w-4xl border border-slate-200 rounded-2xl shadow-2xl overflow-hidden bg-slate-900 aspect-video flex items-center justify-center group">
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-900/40 to-slate-900/40 z-0"></div>
            <div className="z-10 text-white flex flex-col items-center">
              <Bot className="w-16 h-16 mb-4 text-blue-400" />
              <p className="text-2xl font-semibold">Workflow Builder Demo</p>
              <span className="text-slate-400">Drag & Drop UI Preview</span>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="py-24 bg-white">
          <div className="max-w-6xl mx-auto px-6">
            <h2 className="text-3xl font-bold text-center mb-16 text-slate-900">Everything you need to automate</h2>

            <div className="grid md:grid-cols-3 gap-8">
              <FeatureCard
                icon={<Zap className="w-6 h-6 text-yellow-500" />}
                title="Visual Workflow Builder"
                description="Connect triggers, conditions, and actions visually. Handle complex logic with zero code."
              />
              <FeatureCard
                icon={<Shield className="w-6 h-6 text-green-500" />}
                title="Powerful Moderation"
                description="Auto-ban spammers, filter keywords, and manage group permissions automatically."
              />
              <FeatureCard
                icon={<BarChart3 className="w-6 h-6 text-purple-500" />}
                title="Analytics & Logs"
                description="Track bot performance, view detailed execution logs, and monitor growth."
              />
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-slate-50 border-t border-slate-200 py-12 px-6 text-center text-slate-500 text-sm">
        <p>© 2026 Telegram Automation Builder. All rights reserved.</p>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="p-6 rounded-2xl border border-slate-100 bg-slate-50 hover:shadow-lg transition-shadow">
      <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center mb-4 border border-slate-100">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-2 text-slate-900">{title}</h3>
      <p className="text-slate-600 leading-relaxed">{description}</p>
    </div>
  )
}

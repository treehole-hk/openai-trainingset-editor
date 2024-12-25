import { Github, Twitter, Linkedin } from 'lucide-react'

export function Homepage() {
  return (
    <div className="relative bg-[#1a1a1a] border-b border-white/10">
      <div className="max-w-7xl mx-auto py-3 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center flex-1 min-w-0 gap-3">
            <Github className="h-5 w-5 text-white" />
            <p className="text-sm text-white/90">
              <span>Hey! I built this as a </span>
              <span className="font-medium text-primary">free and open-source tool</span>
              <span> because I needed it myself. Check out the </span>
              <a
                href="https://github.com/buryhuang/openai-trainingset-editor"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-primary hover:text-primary/80 underline-offset-4 hover:underline"
              >
                GitHub Repository
              </a>
              <span>. If you find it useful, your support helps me keep improving it!</span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="https://ko-fi.com/M4M617YPUV"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:opacity-90 transition-opacity"
            >
              <img
                height="36"
                src="https://storage.ko-fi.com/cdn/kofi6.png?v=6"
                alt="Buy Me a Coffee at ko-fi.com"
                className="h-9"
              />
            </a>
          </div>
        </div>
      </div>
    </div>
  )
} 
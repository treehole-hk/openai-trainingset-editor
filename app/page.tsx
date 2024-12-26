import { EditorContent } from '../components/editor-content'
import { Twitter, Linkedin } from 'lucide-react'
import { TopBanner } from '../components/top-banner'

export default function FineTuneEditor() {
  return (
    <div className="flex flex-col h-screen bg-[#111111] dark:bg-[#111111]">
      {/* Top banner */}
      <TopBanner />
      
      {/* Main content */}
      <div className="flex-1 overflow-auto">
        <div className="w-full max-w-[1400px] mx-auto p-6">
          {/* Editor Content */}
          <EditorContent />
        </div>
      </div>
    </div>
  )
}


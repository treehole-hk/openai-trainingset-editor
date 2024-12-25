'use client'

import { useState } from 'react'
import { XMarkIcon } from '@heroicons/react/24/outline'

export function TopBanner() {
  const [showBanner, setShowBanner] = useState(true)
  
  const onCloseBanner = () => {
    setShowBanner(false)
  }

  if (!showBanner) return null

  return (
    <div className="relative w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <span className="text-lg">👋</span>
        <span>
          Hey! I built this as a <a href="https://github.com/buryhuang/openai-trainingset-editor" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-200">free and open-source tool</a> because I needed it myself. Check out the <a href="https://github.com/buryhuang/openai-trainingset-editor" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-200">GitHub Repository</a>. If you find it useful, your support helps me keep improving it!
        </span>
      </div>
      <div className="flex items-center space-x-4">
        <a href="https://ko-fi.com/buryhuang" target="_blank" rel="noopener noreferrer" className="bg-[#FF5E5B] hover:bg-[#FF7A77] text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center space-x-2">
          <span>☕️</span>
          <span>Buy me a coffee</span>
        </a>
        <button onClick={onCloseBanner} className="text-white hover:text-gray-200 transition-colors duration-200">
          <XMarkIcon className="h-6 w-6" />
        </button>
      </div>
    </div>
  )
} 
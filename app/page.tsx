'use client'

import { EditorContent } from '@/components/editor-content'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Upload, MessageSquare, ThumbsUp, ThumbsDown, Settings2, ExternalLink, Brain } from 'lucide-react'
import { motion } from 'framer-motion'

export default function Home() {
  return (
    <main className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="group relative inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-all"
          >
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                opacity: [1, 0.8, 1]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatDelay: 3
              }}
            >
              <Brain className="w-4 h-4" />
            </motion.div>
            <a href="https://mindforest.ai" target="_blank" rel="noopener noreferrer" className="text-sm font-medium hover:underline">
              Discover MindForest.ai - AI-Powered Psychological Coaching
            </a>
            <motion.div
              animate={{
                x: [0, 3, 0]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                repeatDelay: 3.5
              }}
            >
              <ExternalLink className="w-3 h-3" />
            </motion.div>
          </motion.div>
          
          <h1 className="text-4xl font-bold tracking-tight text-white">JSONL Training Data Editor</h1>
          <p className="text-lg text-white/70 max-w-2xl mx-auto">
            A powerful tool for managing, editing, and preparing AI training datasets in JSONL format. 
            Perfect for conversation data and DPO dataset preparation.
          </p>
        </div>
        <EditorContent />
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="bg-[#1a1a1a] border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-primary" />
                Conversation Editor
              </CardTitle>
            </CardHeader>
            <CardContent className="text-white/70">
              Edit and manage conversation data with an intuitive interface. Drag and drop to reorder messages, 
              add system prompts, and validate your data structure.
            </CardContent>
          </Card>

          <Card className="bg-[#1a1a1a] border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings2 className="w-5 h-5 text-primary" />
                System Message Management
              </CardTitle>
            </CardHeader>
            <CardContent className="text-white/70">
              Easily add and edit system messages to guide AI behavior. Perfect for fine-tuning 
              and creating consistent training examples.
            </CardContent>
          </Card>

          <Card className="bg-[#1a1a1a] border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="flex gap-1">
                  <ThumbsUp className="w-5 h-5 text-primary" />
                  <ThumbsDown className="w-5 h-5 text-primary" />
                </div>
                DPO Dataset Preparation
              </CardTitle>
            </CardHeader>
            <CardContent className="text-white/70">
              Mark conversations as chosen or rejected for DPO training. Export your data in both 
              JSONL and CSV formats compatible with training frameworks.
            </CardContent>
          </Card>
        </div>

        <div className="border-t border-white/10 pt-8">
          <div className="text-center max-w-2xl mx-auto">
            <p className="text-white/70 mb-4">
              Enhanced by the <a href="https://psy.tech" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">PsyTech & Innovation</a> team of <a href="https://treehole.hk" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">TreeholeHK</a>. We're building <a href="https://mindforest.ai" target="_blank" rel="noopener noreferrer" className="text-primary font-medium hover:underline">MindForest</a>, teaching AI to conduct psychology-based coaching. We're looking to finetune AI models but we couldn't find a tool that fits our needs, so we worked on the original project.
            </p>
            <div className="flex items-center justify-center gap-4">
              <a
                href="https://mindforest.ai"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
              >
                <Brain className="w-4 h-4" />
                Explore MindForest.ai
                <ExternalLink className="w-3 h-3" />
              </a>
              <a
                href="https://github.com/baryhuang/openai-trainingset-editor"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 text-white rounded-md hover:bg-white/20 transition-colors"
              >
                View Original Project
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>

        
      </div>
    </main>
  )
}


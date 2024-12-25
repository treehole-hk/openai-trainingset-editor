'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { parseJSONL, stringifyJSONL, extractSubject } from '../utils/jsonl'
import { MessageSquare, Download, Upload, Save, ChevronRight, Bot, User, Settings, AlertTriangle, Github, X, Twitter, Linkedin } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function FineTuneEditor() {
  const [jsonlData, setJsonlData] = useState<any[]>([]);
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [dirtyFields, setDirtyFields] = useState<{[key: string]: boolean}>({});
  const [showSaveButton, setShowSaveButton] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [nextSelectedIndex, setNextSelectedIndex] = useState<number | null>(null);
  const [leftBarWidth, setLeftBarWidth] = useState(320); // Wider default width
  const [showBanner, setShowBanner] = useState(true);
  const leftBarRef = useRef<HTMLDivElement>(null);
  const resizeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (Object.keys(dirtyFields).length > 0) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [dirtyFields]);

  useEffect(() => {
    const leftBar = leftBarRef.current;
    const resizeHandle = resizeRef.current;
    if (!leftBar || !resizeHandle) return;

    let startX: number;
    let startWidth: number;

    const onMouseMove = (e: MouseEvent) => {
      const newWidth = startWidth + e.clientX - startX;
      setLeftBarWidth(Math.max(200, Math.min(newWidth, 400))); // Min 200px, Max 400px
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    const onMouseDown = (e: MouseEvent) => {
      startX = e.clientX;
      startWidth = leftBar.offsetWidth;
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    };

    resizeHandle.addEventListener('mousedown', onMouseDown);

    return () => {
      resizeHandle.removeEventListener('mousedown', onMouseDown);
    };
  }, []);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        const { data, errors } = parseJSONL(content);
        setJsonlData(data);
        setParseErrors(errors);
        setDirtyFields({});
        if (data.length > 0 && errors.length === 0) {
          setSelectedIndex(0);
        } else {
          setSelectedIndex(null);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleInputChange = (messageId: string, content: string) => {
    const newData = jsonlData.map(item => ({
      ...item,
      messages: item.messages.map((msg: any) => 
        msg.id === messageId ? { ...msg, content } : msg
      )
    }));
    setJsonlData(newData);
    setDirtyFields(prev => ({
      ...prev,
      [messageId]: true
    }));
    setShowSaveButton(true);
  };

  const handleSave = () => {
    setDirtyFields({});
    setShowSaveButton(false);
  };

  const handleDownload = () => {
    const jsonlString = stringifyJSONL(jsonlData);
    const blob = new Blob([jsonlString], { type: 'application/jsonl' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'edited_finetune.jsonl';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleSubjectClick = (index: number) => {
    if (Object.keys(dirtyFields).length > 0) {
      setShowConfirmDialog(true);
      setNextSelectedIndex(index);
    } else {
      setSelectedIndex(index);
    }
  };

  const handleConfirmNavigation = () => {
    setSelectedIndex(nextSelectedIndex);
    setDirtyFields({});
    setShowSaveButton(false);
    setShowConfirmDialog(false);
  };

  const handleCancelNavigation = () => {
    setShowConfirmDialog(false);
  };

  return (
    <div className="flex flex-col h-screen bg-[#fafafa] dark:bg-[#1a1a1a]">
      <AnimatePresence>
        {showBanner && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="relative bg-primary/10 dark:bg-primary/20 border-b border-border/10"
          >
            <div className="max-w-7xl mx-auto py-3 px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center flex-1 min-w-0 gap-3">
                  <Github className="h-5 w-5 text-primary" />
                  <p className="text-sm text-foreground/90">
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
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-foreground/60 hover:text-foreground"
                    onClick={() => setShowBanner(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-1 overflow-hidden">
        <motion.div 
          ref={leftBarRef} 
          initial={{ x: -320 }}
          animate={{ x: 0 }}
          transition={{ type: "spring", damping: 20 }}
          className={`border-r border-border/10 bg-white dark:bg-[#1f1f1f] overflow-hidden relative ${
            jsonlData.length === 0 ? 'hidden' : ''
          }`}
          style={{ width: leftBarWidth }}
        >
          <div className="p-4 border-b border-border/10 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground/90">Conversations</h2>
          </div>
          <ScrollArea className="h-[calc(100vh-65px)]">
            <div className="p-2">
              <AnimatePresence>
                {jsonlData.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                  >
                    <Button
                      variant={selectedIndex === index ? "secondary" : "ghost"}
                      className={`w-full justify-start mb-1 p-3 h-auto text-left transition-all group ${
                        selectedIndex === index 
                          ? 'bg-secondary/80 text-secondary-foreground' 
                          : 'text-foreground/70 hover:bg-secondary/40'
                      }`}
                      onClick={() => handleSubjectClick(index)}
                    >
                      <div className="w-full overflow-hidden flex items-center gap-2">
                        <ChevronRight className={`w-4 h-4 transition-transform ${
                          selectedIndex === index ? 'rotate-90' : 'group-hover:translate-x-1'
                        }`} />
                        <p className="truncate text-sm font-medium">
                          {extractSubject(item)}
                        </p>
                      </div>
                    </Button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </ScrollArea>
          <div
            ref={resizeRef}
            className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-primary/50 transition-colors"
          />
        </motion.div>
        <div className="flex-1 overflow-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto p-6 space-y-6"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Settings className="w-6 h-6 text-primary animate-spin-slow" />
                <h1 className="text-2xl font-bold text-foreground/90">OpenAI Fine-tune Editor</h1>
              </div>
            </div>

            {jsonlData.length > 0 ? (
              <div className="flex gap-2 justify-end">
                <label className="relative cursor-pointer">
                  <Input 
                    type="file" 
                    onChange={handleFileUpload} 
                    accept=".jsonl" 
                    className="sr-only"
                  />
                  <div className="flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-md transition-colors">
                    <Upload className="w-4 h-4" />
                    <span>Upload JSONL</span>
                  </div>
                </label>
                <Button 
                  onClick={handleDownload} 
                  className="bg-primary hover:bg-primary/90 gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download JSONL
                </Button>
              </div>
            ) : (
              <div className="flex items-start justify-between gap-12 mt-8">
                <div className="flex-1 space-y-6">
                  <div className="aspect-video rounded-lg overflow-hidden shadow-lg border border-border/10">
                    <iframe
                      className="w-full h-full"
                      src="https://www.youtube.com/embed/VVKcSf6r3CM"
                      title="Tutorial: How to use OpenAI Fine-tune Editor"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                  
                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-foreground/90">👋 Welcome!</h2>
                    <p className="text-foreground/70">
                      I created this editor because I couldn't find a simple tool for editing OpenAI fine-tuning datasets. 
                      The video above from Corbin Brown shows what fine-tuning is about - that's exactly what this tool helps you prepare for. 
                      It's completely free to use and runs entirely in your browser. 
                      With enough support, I'd love to add real-time validation and more advanced features to make your workflow even smoother!
                    </p>

                    <div className="pt-4 border-t border-border/10">
                      <h3 className="text-lg font-semibold text-foreground/90 mb-3">🤖 The AI-Powered Journey</h3>
                      <p className="text-foreground/70">
                        Here's something cool: I didn't write a single line of code for this tool! The entire project was created through AI pair programming.
                        It started as a sketch using v0 by Vercel, then moved to GitHub where Cursor (an AI-powered IDE) helped build everything you see here.
                        The initial version, from idea to public deployment, took just 2 hours of my time.
                        This rapid development showcases how AI tools can help turn ideas into reality incredibly fast - 
                        from ideation to deployment on Vercel, all through natural conversations with AI.
                        This project is a testament to how AI can help create useful tools for the AI community.
                      </p>
                      <div className="flex items-center gap-4 mt-6 pt-4 border-t border-border/10">
                        <a
                          href="https://x.com/buryhuang"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-foreground/70 hover:text-primary transition-colors"
                        >
                          <Twitter className="w-5 h-5" />
                          <span className="text-sm">Follow my journey</span>
                        </a>
                        <a
                          href="https://www.linkedin.com/in/baryhuang/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-foreground/70 hover:text-primary transition-colors"
                        >
                          <Linkedin className="w-5 h-5" />
                          <span className="text-sm">Connect on LinkedIn</span>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex-1 flex items-center justify-center">
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", damping: 20 }}
                    className="w-full max-w-md"
                  >
                    <label className="relative cursor-pointer">
                      <Input 
                        type="file" 
                        onChange={handleFileUpload} 
                        accept=".jsonl" 
                        className="sr-only"
                      />
                      <div className="flex flex-col items-center gap-4 p-12 border-2 border-dashed border-primary/20 hover:border-primary rounded-lg bg-primary/5 hover:bg-primary/10 transition-all group">
                        <Upload className="w-16 h-16 text-primary group-hover:scale-110 transition-transform" />
                        <div className="text-center">
                          <h3 className="text-xl font-semibold text-primary mb-3">Upload your JSONL file</h3>
                          <p className="text-sm text-foreground/70">Click or drag and drop your file here</p>
                        </div>
                      </div>
                    </label>
                  </motion.div>
                </div>
              </div>
            )}

            <AnimatePresence>
              {parseErrors.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <Card className="border-destructive/50 bg-destructive/5">
                    <CardHeader className="flex flex-row items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-destructive" />
                      <CardTitle className="text-destructive text-sm font-medium">Parsing Errors</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="list-disc pl-5 space-y-1 text-sm text-destructive/90">
                        {parseErrors.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence mode="wait">
              {selectedIndex !== null && (
                <motion.div
                  key={selectedIndex}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <Card className="border border-border/10 shadow-sm">
                    <CardHeader className="bg-card sticky top-0 z-10 border-b border-border/10">
                      <CardTitle className="text-lg font-medium text-card-foreground">Entry {selectedIndex + 1}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 divide-y divide-border/10">
                      {jsonlData[selectedIndex].messages.map((msg: any) => (
                        <motion.div 
                          key={msg.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.2 }}
                          className={`p-4 transition-colors ${
                            msg.role === 'system' 
                              ? 'bg-blue-50/50 dark:bg-blue-950/20' 
                              : msg.role === 'assistant' 
                                ? 'bg-green-50/50 dark:bg-green-950/20' 
                                : 'bg-gray-50/50 dark:bg-gray-950/20'
                          }`}
                        >
                          <div className="max-w-3xl mx-auto">
                            <div className="flex items-center gap-2 mb-2">
                              {msg.role === 'system' ? (
                                <Settings className="w-4 h-4 text-blue-700 dark:text-blue-400" />
                              ) : msg.role === 'assistant' ? (
                                <Bot className="w-4 h-4 text-green-700 dark:text-green-400" />
                              ) : (
                                <User className="w-4 h-4 text-gray-700 dark:text-gray-400" />
                              )}
                              <h3 className={`text-sm font-medium ${
                                msg.role === 'system' 
                                  ? 'text-blue-700 dark:text-blue-400' 
                                  : msg.role === 'assistant' 
                                    ? 'text-green-700 dark:text-green-400' 
                                    : 'text-gray-700 dark:text-gray-400'
                              } capitalize`}>
                                {msg.role}
                              </h3>
                            </div>
                            <Textarea
                              value={msg.content}
                              onChange={(e) => handleInputChange(msg.id, e.target.value)}
                              className={`w-full min-h-[100px] resize-y bg-white dark:bg-[#1f1f1f] border-border/20 rounded-lg transition-all ${
                                dirtyFields[msg.id] ? 'border-amber-500 dark:border-amber-500/50' : ''
                              }`}
                            />
                          </div>
                        </motion.div>
                      ))}
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          <AnimatePresence>
            {showSaveButton && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="fixed bottom-6 right-28"
              >
                <Button 
                  onClick={handleSave} 
                  className="bg-primary hover:bg-primary/90 shadow-lg gap-2"
                >
                  <Save className="w-4 h-4" />
                  Save Changes
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <AlertDialog open={showConfirmDialog}>
        <AlertDialogContent className="bg-background border-border/10">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              Unsaved Changes
            </AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes. Are you sure you want to leave this page? Your changes will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelNavigation}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmNavigation}>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}


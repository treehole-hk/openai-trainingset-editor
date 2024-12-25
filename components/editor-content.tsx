'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { parseJSONL, stringifyJSONL, extractSubject } from '../utils/jsonl'
import { MessageSquare, Download, Upload, Save, ChevronRight, Bot, User, Settings, AlertTriangle, Home } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export function EditorContent() {
  const [jsonlData, setJsonlData] = useState<any[]>([]);
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [dirtyFields, setDirtyFields] = useState<{[key: string]: boolean}>({});
  const [showSaveButton, setShowSaveButton] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [nextSelectedIndex, setNextSelectedIndex] = useState<number | null>(null);
  const [leftBarWidth, setLeftBarWidth] = useState(320);
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

  const handleHomeClick = () => {
    if (Object.keys(dirtyFields).length > 0) {
      setShowConfirmDialog(true);
      setNextSelectedIndex(null);
    } else {
      setJsonlData([]);
      setSelectedIndex(null);
      setDirtyFields({});
      setShowSaveButton(false);
    }
  };

  return (
    <div className="w-full">
      {jsonlData.length === 0 ? (
        <div className="space-y-12">
          {/* Video and Upload Section */}
          <div className="flex items-start justify-between gap-12">
            <div className="flex-1">
              <div className="aspect-video rounded-lg overflow-hidden shadow-lg border border-white/10 bg-[#1a1a1a]">
                <iframe
                  className="w-full h-full"
                  src="https://www.youtube.com/embed/VVKcSf6r3CM"
                  title="Tutorial: How to use OpenAI Fine-tune Editor"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
            <div className="flex-1">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", damping: 20 }}
                className="w-full h-full flex items-center"
              >
                <label className="relative cursor-pointer w-full">
                  <Input 
                    type="file" 
                    onChange={handleFileUpload} 
                    accept=".jsonl" 
                    className="sr-only"
                  />
                  <div className="flex flex-col items-center gap-4 p-12 border-2 border-dashed border-white/20 hover:border-primary rounded-lg bg-[#1a1a1a] hover:bg-[#222222] transition-all group">
                    <Upload className="w-16 h-16 text-primary group-hover:scale-110 transition-transform" />
                    <div className="text-center">
                      <h3 className="text-xl font-semibold text-primary mb-3">Upload your JSONL file</h3>
                      <p className="text-sm text-white/70">Click or drag and drop your file here</p>
                    </div>
                  </div>
                </label>
              </motion.div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-1 h-[calc(100vh-8rem)] overflow-hidden bg-[#1a1a1a] rounded-lg border border-white/10">
          {/* Left sidebar with conversation list */}
          {jsonlData.length > 0 && (
            <motion.div 
              ref={leftBarRef} 
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              transition={{ type: "spring", damping: 20 }}
              className="border-r border-white/10 bg-[#1a1a1a] overflow-hidden relative"
              style={{ width: leftBarWidth }}
            >
              <div className="p-4 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-primary" />
                  <h2 className="text-lg font-semibold text-white/90">Conversations</h2>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleHomeClick}
                  className="w-8 h-8 text-white/70 hover:text-white hover:bg-white/5"
                  title="Back to Home"
                >
                  <Home className="w-4 h-4" />
                </Button>
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
                              ? 'bg-primary/20 text-primary border border-primary/20' 
                              : 'text-white/70 hover:bg-white/5 hover:text-white'
                          }`}
                          onClick={() => handleSubjectClick(index)}
                        >
                          <div className="w-full overflow-hidden flex items-center gap-2">
                            <ChevronRight className={`w-4 h-4 transition-transform ${
                              selectedIndex === index ? 'rotate-90 text-primary' : 'text-white/70 group-hover:text-white group-hover:translate-x-1'
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
          )}

          {/* Main content area */}
          <div className="flex-1 overflow-auto">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-4xl mx-auto p-6 space-y-6"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Settings className="w-6 h-6 text-primary animate-spin-slow" />
                  <h1 className="text-2xl font-bold text-white/90">OpenAI Fine-tune Editor</h1>
                </div>
                <div className="flex gap-2">
                  <label className="relative cursor-pointer">
                    <Input 
                      type="file" 
                      onChange={handleFileUpload} 
                      accept=".jsonl" 
                      className="sr-only"
                    />
                    <div className="flex items-center gap-2 px-4 py-2 bg-[#1a1a1a] hover:bg-[#222222] text-white rounded-md transition-colors">
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
              </div>

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
                    <Card className="border border-white/10 bg-[#1a1a1a]">
                      <CardHeader className="bg-[#1a1a1a] sticky top-0 z-10 border-b border-white/10">
                        <CardTitle className="text-lg font-medium text-white">Entry {selectedIndex + 1}</CardTitle>
                      </CardHeader>
                      <CardContent className="p-0 divide-y divide-white/10">
                        {jsonlData[selectedIndex].messages.map((msg: any) => (
                          <motion.div 
                            key={msg.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.2 }}
                            className={`p-4 transition-colors ${
                              msg.role === 'system' 
                                ? 'bg-blue-950/20' 
                                : msg.role === 'assistant' 
                                  ? 'bg-green-950/20' 
                                  : 'bg-gray-950/20'
                            }`}
                          >
                            <div className="max-w-3xl mx-auto">
                              <div className="flex items-center gap-2 mb-2">
                                {msg.role === 'system' ? (
                                  <Settings className="w-4 h-4 text-blue-400" />
                                ) : msg.role === 'assistant' ? (
                                  <Bot className="w-4 h-4 text-green-400" />
                                ) : (
                                  <User className="w-4 h-4 text-gray-400" />
                                )}
                                <h3 className={`text-sm font-medium ${
                                  msg.role === 'system' 
                                    ? 'text-blue-400' 
                                    : msg.role === 'assistant' 
                                      ? 'text-green-400' 
                                      : 'text-gray-400'
                                } capitalize`}>
                                  {msg.role}
                                </h3>
                              </div>
                              <Textarea
                                value={msg.content}
                                onChange={(e) => handleInputChange(msg.id, e.target.value)}
                                className={`w-full min-h-[100px] resize-y bg-[#1f1f1f] text-white/90 border-white/20 rounded-lg transition-all focus:border-primary focus:ring-1 focus:ring-primary ${
                                  dirtyFields[msg.id] ? 'border-amber-500 focus:border-amber-500 focus:ring-amber-500' : ''
                                }`}
                                placeholder={`Enter ${msg.role}'s message...`}
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
          </div>
        </div>
      )}

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

      <AlertDialog open={showConfirmDialog}>
        <AlertDialogContent className="bg-[#1a1a1a] border-white/10">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-white">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              Unsaved Changes
            </AlertDialogTitle>
            <AlertDialogDescription className="text-white/70">
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
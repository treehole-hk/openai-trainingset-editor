'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { parseJSONL, stringifyJSONL, extractSubject } from '../utils/jsonl'
import { MessageSquare, Download, Upload, Save, ChevronRight, Bot, User, Settings, AlertTriangle, Home, Trash2, Plus, Settings2, ThumbsUp, ThumbsDown, FileDown } from 'lucide-react'
import { motion, AnimatePresence, Reorder, useDragControls } from 'framer-motion'
import { DragHandleDots2Icon } from '@radix-ui/react-icons'

export function EditorContent() {
  const [jsonlData, setJsonlData] = useState<any[]>([]);
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [dirtyFields, setDirtyFields] = useState<{[key: string]: boolean}>({});
  const [showSaveButton, setShowSaveButton] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [nextSelectedIndex, setNextSelectedIndex] = useState<number | null>(null);
  const [leftBarWidth, setLeftBarWidth] = useState(420);
  const leftBarRef = useRef<HTMLDivElement>(null);
  const resizeRef = useRef<HTMLDivElement>(null);
  const [isUnrecognizedFormat, setIsUnrecognizedFormat] = useState(false);
  const [rawJsonlContent, setRawJsonlContent] = useState<string>('');
  const [showSystemDialog, setShowSystemDialog] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [systemMessage, setSystemMessage] = useState('');
  const [preferences, setPreferences] = useState<{[key: number]: 'chosen' | 'rejected'}>({});
  const [showDPOWarning, setShowDPOWarning] = useState(false);

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
      setLeftBarWidth(Math.max(400, Math.min(newWidth, 480))); // Changed from 200/400 to 280/480
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

  // Update handleFileUpload to preserve preferences
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        try {
          const { data, errors } = parseJSONL(content);
          const hasValidFormat = data.some(item => Array.isArray(item.messages));
          
          if (hasValidFormat) {
            setJsonlData(data);
            setParseErrors(errors);
            // Load preferences and mark them as dirty
            const newPreferences: {[key: number]: 'chosen' | 'rejected'} = {};
            const newDirtyFields: {[key: string]: boolean} = {};
            data.forEach((item, index) => {
              if (item.preference === 'chosen' || item.preference === 'rejected') {
                newPreferences[index] = item.preference;
                newDirtyFields[`pref_${index}`] = true;
              }
            });
            setPreferences(newPreferences);
            setDirtyFields(newDirtyFields);
            setShowSaveButton(Object.keys(newPreferences).length > 0);
            setIsUnrecognizedFormat(false);
            if (data.length > 0 && errors.length === 0) {
              setSelectedIndex(0);
            } else {
              setSelectedIndex(null);
            }
          } else {
            // Handle unrecognized format
            setIsUnrecognizedFormat(true);
            // Format the JSON for better readability
            const prettyContent = content
              .split('\n')
              .filter(line => line.trim())
              .map(line => {
                try {
                  return JSON.stringify(JSON.parse(line), null, 2);
                } catch {
                  return line;
                }
              })
              .join('\n\n');
            setRawJsonlContent(prettyContent);
            setJsonlData([]);
            setSelectedIndex(null);
          }
        } catch (error: any) {
          setParseErrors([`Failed to parse file: ${error.message || 'Unknown error'}`]);
          setJsonlData([]);
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

  // Update handleSave to include preferences
  const handleSave = () => {
    // Create a backup of the current state including preferences
    const dataWithPreferences = jsonlData.map((item, index) => ({
      ...item,
      preference: preferences[index] || null
    }));
    
    const jsonlString = stringifyJSONL(dataWithPreferences);
    localStorage.setItem('jsonlEditorBackup', jsonlString);
    
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

  const performDPOExport = () => {
    // Get counts for filename
    const chosenCount = Object.values(preferences).filter(p => p === 'chosen').length;
    const rejectedCount = Object.values(preferences).filter(p => p === 'rejected').length;
    const timestamp = new Date().toISOString().split('T')[0];
    const baseFilename = `dpo_export_${chosenCount}chosen_${rejectedCount}rejected_${timestamp}`;

    // Prepare JSONL data
    const jsonlData1 = jsonlData.map((item, index) => ({
      ...item,
      preference: preferences[index] || null
    }));
    const jsonlString = stringifyJSONL(jsonlData1);

    // Helper function to escape CSV values
    const escapeCSV = (str: string) => {
      if (!str) return '';
      const escaped = str.replace(/"/g, '""');
      return /[,"\n]/.test(str) ? `"${escaped}"` : str;
    };

    // Prepare CSV data with proper escaping
    const chosen = jsonlData.filter((_, i) => preferences[i] === 'chosen');
    const rejected = jsonlData.filter((_, i) => preferences[i] === 'rejected');
    const maxLength = Math.max(chosen.length, rejected.length);
    
    let csvContent = "chosen,rejected\n";
    for (let i = 0; i < maxLength; i++) {
      const chosenContent = chosen[i] ? escapeCSV(JSON.stringify(chosen[i])) : '';
      const rejectedContent = rejected[i] ? escapeCSV(JSON.stringify(rejected[i])) : '';
      csvContent += `${chosenContent},${rejectedContent}\n`;
    }

    // Download JSONL file
    const jsonlBlob = new Blob([jsonlString], { type: 'application/jsonl' });
    const jsonlUrl = URL.createObjectURL(jsonlBlob);
    const jsonlLink = document.createElement('a');
    jsonlLink.href = jsonlUrl;
    jsonlLink.download = `${baseFilename}.jsonl`;
    document.body.appendChild(jsonlLink);
    jsonlLink.click();
    document.body.removeChild(jsonlLink);
    URL.revokeObjectURL(jsonlUrl);

    // Download CSV file
    const csvBlob = new Blob([csvContent], { type: 'text/csv' });
    const csvUrl = URL.createObjectURL(csvBlob);
    const csvLink = document.createElement('a');
    csvLink.href = csvUrl;
    csvLink.download = `${baseFilename}.csv`;
    document.body.appendChild(csvLink);
    csvLink.click();
    document.body.removeChild(csvLink);
    URL.revokeObjectURL(csvUrl);
  };

  const handleDPOExport = () => {
    const chosen = jsonlData.filter((_, i) => preferences[i] === 'chosen');
    const rejected = jsonlData.filter((_, i) => preferences[i] === 'rejected');
    
    if (chosen.length === 0 || rejected.length === 0) {
      setShowDPOWarning(true);
      return;
    }
    
    performDPOExport();
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
    if (nextSelectedIndex === null) {
      setJsonlData([]);
      setPreferences({}); // Clear preferences when confirming navigation to home
      localStorage.removeItem('jsonlEditorBackup');
    }
    setSelectedIndex(nextSelectedIndex);
    setDirtyFields({});
    setShowSaveButton(false);
    setShowConfirmDialog(false);
  };

  const handleCancelNavigation = () => {
    setShowConfirmDialog(false);
  };

  // Update handleHomeClick to also clear preferences
  const handleHomeClick = () => {
    if (Object.keys(dirtyFields).length > 0) {
      setShowConfirmDialog(true);
      setNextSelectedIndex(null);
    } else {
      setJsonlData([]);
      setSelectedIndex(null);
      setDirtyFields({});
      setShowSaveButton(false);
      setPreferences({}); // Clear preferences when clearing the editor
      localStorage.removeItem('jsonlEditorBackup'); // Clear backup as well
    }
  };

  const handleSystemMessageEdit = (index: number) => {
    const conversation = jsonlData[index];
    const sysMsg = conversation.messages.find((m: any) => m.role === 'system')?.content || '';
    setSystemMessage(sysMsg);
    setEditingIndex(index);
    setShowSystemDialog(true);
  };

  const handleSystemMessageSave = () => {
    if (editingIndex === null) return;
    
    const newData = [...jsonlData];
    const conversation = newData[editingIndex];
    const systemIndex = conversation.messages.findIndex((m: any) => m.role === 'system');
    
    if (systemIndex >= 0) {
      // Update existing system message
      conversation.messages[systemIndex].content = systemMessage;
    } else {
      // Add new system message at the start
      conversation.messages.unshift({
        id: crypto.randomUUID(),
        role: 'system',
        content: systemMessage
      });
    }
    
    setJsonlData(newData);
    setShowSystemDialog(false);
    setEditingIndex(null);
    setShowSaveButton(true);
  };

  const handleAddConversation = () => {
    const newConversation = {
      messages: [
        {
          id: crypto.randomUUID(),
          role: 'user',
          content: 'Start a new conversation...'  // Changed from 'New conversation' to be more descriptive
        },
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: 'Hello! How can I help you today?'  // Add an initial assistant response
        }
      ]
    };
    
    const newData = [...jsonlData, newConversation];
    setJsonlData(newData);
    setSelectedIndex(newData.length - 1);
    setDirtyFields(prev => ({
      ...prev, 
      [newConversation.messages[0].id]: true,
      [newConversation.messages[1].id]: true
    }));
    setShowSaveButton(true);
  };

  if (isUnrecognizedFormat) {
    const jsonObjects = rawJsonlContent.split('\n\n').map((content, index) => ({
      content,
      index
    }));

    return (
      <div className="w-full">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-amber-500" />
            <h1 className="text-2xl font-bold text-white/90">Unrecognized JSONL Format</h1>
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
                <span>Upload Another File</span>
              </div>
            </label>
          </div>
        </div>

        <div className="flex flex-1 h-[calc(100vh-8rem)] overflow-hidden bg-[#1a1a1a] rounded-lg border border-white/10">
          {/* Left sidebar with JSON object list */}
          <motion.div 
            ref={leftBarRef} 
            initial={{ x: -360 }}  // Changed from -320 to -360
            animate={{ x: 0 }}
            transition={{ type: "spring", damping: 20 }}
            className="border-r border-white/10 bg-[#1a1a1a] overflow-hidden relative"
            style={{ width: leftBarWidth }}
          >
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold text-white/90">JSON Objects</h2>
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
                  {jsonObjects.map((item, index) => (
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
                        onClick={() => setSelectedIndex(index)}
                      >
                        <div className="w-full overflow-hidden flex items-center gap-2">
                          <ChevronRight className={`w-4 h-4 transition-transform ${
                            selectedIndex === index ? 'rotate-90 text-primary' : 'text-white/70 group-hover:text-white group-hover:translate-x-1'
                          }`} />
                          <p className="truncate text-sm font-medium">
                            Object {index + 1}
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

          {/* Main content area */}
          <div className="flex-1 overflow-auto">
            <div className="p-6">
              <Card className="border-amber-500/30 bg-[#1a1a1a]">
                <CardHeader className="border-b border-white/10">
                  <CardTitle className="text-amber-500">Read-only View</CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <pre className="bg-[#111111] p-4 rounded-lg overflow-x-auto text-white/90 text-sm whitespace-pre">
                    {selectedIndex !== null ? jsonObjects[selectedIndex].content : 'Select a JSON object from the sidebar'}
                  </pre>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Add auto-recovery on component mount
  useEffect(() => {
    const backup = localStorage.getItem('jsonlEditorBackup');
    if (backup && jsonlData.length === 0) {
      try {
        const { data, errors } = parseJSONL(backup);
        if (data.length > 0) {
          setJsonlData(data);
          // Restore preferences and mark them as dirty
          const newPreferences: {[key: number]: 'chosen' | 'rejected'} = {};
          const newDirtyFields: {[key: string]: boolean} = {};
          data.forEach((item, index) => {
            if (item.preference === 'chosen' || item.preference === 'rejected') {
              newPreferences[index] = item.preference;
              newDirtyFields[`pref_${index}`] = true;
            }
          });
          setPreferences(newPreferences);
          setDirtyFields(newDirtyFields);
          setShowSaveButton(Object.keys(newPreferences).length > 0);
          setParseErrors(errors);
          setSelectedIndex(0);
        }
      } catch (error) {
        console.error('Failed to recover backup:', error);
      }
    }
  }, []);

  return (
    <div className="w-full">
      <div className="flex flex-1 h-screen overflow-hidden bg-[#111111]">
        {/* Left sidebar */}
        {jsonlData.length > 0 && (
          <motion.div 
            ref={leftBarRef} 
            initial={{ x: -360 }}  // Changed from -320 to -360
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
              <div className="flex items-center">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleAddConversation}
                  className="w-8 h-8 text-white/70 hover:text-white hover:bg-white/5 rounded-r-none border-r border-white/10"
                  title="New Conversation"
                >
                  <Plus className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleHomeClick}
                  className="w-8 h-8 text-white/70 hover:text-white hover:bg-white/5 rounded-none border-r border-white/10"
                  title="Clear Editor"
                >
                  <Home className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleDownload}
                  className="w-8 h-8 text-white/70 hover:text-white hover:bg-white/5 rounded-none border-r border-white/10"
                  title="Download JSONL"
                >
                  <Download className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleDPOExport}
                  className="w-8 h-8 text-white/70 hover:text-white hover:bg-white/5 rounded-l-none"
                  title="Export DPO Dataset"
                >
                  <FileDown className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <ScrollArea className="h-[calc(100vh-65px)]">
              <div className="p-2">
                {jsonlData.map((item, index) => (
                  <div
                    key={index}
                    className="mb-1"
                  >
                    <div className="flex items-center gap-1">
                      <Button
                        variant={selectedIndex === index ? "secondary" : "ghost"}
                        className={`flex-1 justify-start p-3 h-auto text-left transition-all group ${
                          selectedIndex === index 
                            ? 'bg-primary/20 text-primary border border-primary/20' 
                            : 'text-white/70 hover:bg-white/5 hover:text-white'
                        }`}
                        onClick={() => handleSubjectClick(index)}
                      >
                        <div className="w-full flex items-center gap-2">
                          <ChevronRight className={`w-4 h-4 flex-none transition-transform ${
                            selectedIndex === index ? 'rotate-90 text-primary' : 'text-white/70 group-hover:text-white group-hover:translate-x-1'
                          }`} />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <p className="truncate text-sm font-medium" style={{ maxWidth: `${leftBarWidth - 200}px` }}>
                                {extractSubject(item)}
                              </p>
                              <div className="flex gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setPreferences(prev => ({
                                      ...prev,
                                      [index]: prev[index] === 'chosen' ? undefined : 'chosen'
                                    }));
                                    // Mark as dirty and show save button when preference changes
                                    setDirtyFields(prev => ({...prev, [`pref_${index}`]: true}));
                                    setShowSaveButton(true);
                                  }}
                                  className={`h-6 w-6 transition-colors ${
                                    preferences[index] === 'chosen' 
                                      ? 'text-green-500 hover:text-green-400 bg-green-500/10' 
                                      : 'text-white/20 hover:text-white/40 hover:bg-white/5'
                                  }`}
                                  title={preferences[index] === 'chosen' ? 'Unmark as Chosen' : 'Mark as Chosen'}
                                >
                                  <ThumbsUp className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setPreferences(prev => ({
                                      ...prev,
                                      [index]: prev[index] === 'rejected' ? undefined : 'rejected'
                                    }));
                                    // Mark as dirty and show save button when preference changes
                                    setDirtyFields(prev => ({...prev, [`pref_${index}`]: true}));
                                    setShowSaveButton(true);
                                  }}
                                  className={`h-6 w-6 transition-colors ${
                                    preferences[index] === 'rejected' 
                                      ? 'text-red-500 hover:text-red-400 bg-red-500/10' 
                                      : 'text-white/20 hover:text-white/40 hover:bg-white/5'
                                  }`}
                                  title={preferences[index] === 'rejected' ? 'Unmark as Rejected' : 'Mark as Rejected'}
                                >
                                  <ThumbsDown className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                            <p className="text-xs text-white/50 truncate">
                              {item.messages.filter((m: any) => m.role === 'user').length} user / {item.messages.filter((m: any) => m.role === 'assistant').length} assistant
                              {item.messages.some((m: any) => m.role === 'system') && ' + system'}
                              {preferences[index] && ` • ${preferences[index]}`}
                            </p>
                          </div>
                        </div>
                      </Button>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSystemMessageEdit(index);
                          }}
                          className="h-8 w-8 text-white/40 hover:text-primary hover:bg-primary/10"  
                          title="Edit System Message"
                        >
                          <Settings2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            const newData = [...jsonlData];
                            newData.splice(index, 1);
                            setJsonlData(newData);
                            // Update preferences when deleting a conversation
                            const newPreferences = { ...preferences };
                            delete newPreferences[index];
                            // Shift all preference indices down
                            Object.keys(newPreferences).forEach((key) => {
                              const numKey = parseInt(key);
                              if (numKey > index) {
                                newPreferences[numKey - 1] = newPreferences[numKey];
                                delete newPreferences[numKey];
                              }
                            });
                            setPreferences(newPreferences);
                            if (selectedIndex === index) {
                              setSelectedIndex(null);
                            } else if (selectedIndex && selectedIndex > index) {
                              setSelectedIndex(selectedIndex - 1);
                            }
                          }}
                          className="h-8 w-8 text-white/40 hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
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
          {jsonlData.length === 0 ? (
            <div className="w-full flex items-center justify-center h-screen">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", damping: 20 }}
                className="w-full max-w-md"
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
          ) : (
            <div className="p-4">
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
                      <CardContent className="p-0">
                        <Reorder.Group
                          axis="y"
                          values={jsonlData[selectedIndex].messages}
                          onReorder={(newOrder) => {
                            const newData = [...jsonlData];
                            newData[selectedIndex].messages = newOrder;
                            setJsonlData(newData);
                            setDirtyFields(prev => ({...prev, [newData[selectedIndex].messages.at(-1).id]: true}));
                            setShowSaveButton(true);
                          }}
                          className="divide-y divide-white/10"
                        >
                          {jsonlData[selectedIndex].messages.map((msg: any, msgIndex: number) => (
                            <motion.div key={msg.id}>
                              {msgIndex === 0 && (
                                <div className="flex justify-center gap-2 py-2 -mt-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      const newData = [...jsonlData];
                                      newData[selectedIndex].messages.splice(0, 0, {
                                        id: crypto.randomUUID(),
                                        role: 'user',
                                        content: ''
                                      });
                                      setJsonlData(newData);
                                      setDirtyFields(prev => ({...prev, [newData[selectedIndex].messages[0].id]: true}));
                                      setShowSaveButton(true);
                                    }}
                                    className="gap-1 text-xs h-7 px-2 bg-white/5 text-white hover:bg-white/10 border-white/40"
                                  >
                                    <Plus className="h-3 w-3" />
                                    Insert User
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      const newData = [...jsonlData];
                                      newData[selectedIndex].messages.splice(0, 0, {
                                        id: crypto.randomUUID(),
                                        role: 'assistant',
                                        content: ''
                                      });
                                      setJsonlData(newData);
                                      setDirtyFields(prev => ({...prev, [newData[selectedIndex].messages[0].id]: true}));
                                      setShowSaveButton(true);
                                    }}
                                    className="gap-1 text-xs h-7 px-2 bg-white/5 text-white hover:bg-white/10 border-white/40"
                                  >
                                    <Plus className="h-3 w-3" />
                                    Insert Assistant
                                  </Button>
                                </div>
                              )}
                              <Reorder.Item
                                value={msg}
                                id={msg.id}
                                className={`p-4 transition-colors cursor-move`}
                                whileDrag={{
                                  scale: 1.02,
                                  boxShadow: "0 8px 20px rgba(0,0,0,0.3)",
                                  backgroundColor: "rgba(255,255,255,0.05)"
                                }}
                                style={{
                                  backgroundColor: msg.role === 'system' 
                                    ? 'rgba(59, 130, 246, 0.1)' 
                                    : msg.role === 'assistant'
                                      ? 'rgba(34, 197, 94, 0.1)'
                                      : 'rgba(107, 114, 128, 0.1)'
                                }}
                              >
                                <div className="max-w-3xl mx-auto">
                                  <div className="flex items-center justify-between gap-2 mb-2">
                                    <div className="flex items-center gap-2">
                                      <div className="cursor-move hover:bg-white/10 p-1 rounded">
                                        <DragHandleDots2Icon className="w-4 h-4 text-white/40" />
                                      </div>
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
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => {
                                        const newData = [...jsonlData];
                                        newData[selectedIndex].messages = newData[selectedIndex].messages.filter(m => m.id !== msg.id);
                                        setJsonlData(newData);
                                        setDirtyFields(prev => {
                                          const newFields = {...prev};
                                          delete newFields[msg.id];
                                          return newFields;
                                        });
                                        setShowSaveButton(true);
                                      }}
                                      className="h-8 w-8 text-white/40 hover:text-destructive hover:bg-destructive/10"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
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
                              </Reorder.Item>
                              <div className="flex justify-center gap-2 py-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    const newData = [...jsonlData];
                                    newData[selectedIndex].messages.splice(msgIndex + 1, 0, {
                                      id: crypto.randomUUID(),
                                      role: 'user',
                                      content: ''
                                    });
                                    setJsonlData(newData);
                                    setDirtyFields(prev => ({...prev, [newData[selectedIndex].messages[msgIndex + 1].id]: true}));
                                    setShowSaveButton(true);
                                  }}
                                  className="gap-1 text-xs h-7 px-2 bg-white/5 text-white hover:bg-white/10 border-white/40"
                                >
                                  <Plus className="h-3 w-3" />
                                  Insert User
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    const newData = [...jsonlData];
                                    newData[selectedIndex].messages.splice(msgIndex + 1, 0, {
                                      id: crypto.randomUUID(),
                                      role: 'assistant',
                                      content: ''
                                    });
                                    setJsonlData(newData);
                                    setDirtyFields(prev => ({...prev, [newData[selectedIndex].messages[msgIndex + 1].id]: true}));
                                    setShowSaveButton(true);
                                  }}
                                  className="gap-1 text-xs h-7 px-2 bg-white/5 text-white hover:bg-white/10 border-white/40"
                                >
                                  <Plus className="h-3 w-3" />
                                  Insert Assistant
                                </Button>
                              </div>
                            </motion.div>
                          ))}
                        </Reorder.Group>
                      </CardContent>
                      {/* Replace the single Add Message button with two buttons */}
                      <div className="flex justify-center gap-2 p-4 border-t border-white/10">
                        <Button
                          variant="outline"
                          onClick={() => {
                            if (selectedIndex !== null) {
                              const newData = [...jsonlData];
                              newData[selectedIndex].messages.push({
                                id: crypto.randomUUID(),
                                role: 'user',
                                content: ''
                              });
                              setJsonlData(newData);
                              setDirtyFields(prev => ({...prev, [newData[selectedIndex].messages.at(-1).id]: true}));
                              setShowSaveButton(true);
                            }
                          }}
                          className="gap-2 bg-white/5 text-white hover:bg-white/10 border-white/40"
                        >
                          <Plus className="h-4 w-4" />
                          Add User Message
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            if (selectedIndex !== null) {
                              const newData = [...jsonlData];
                              newData[selectedIndex].messages.push({
                                id: crypto.randomUUID(),
                                role: 'assistant',
                                content: ''
                              });
                              setJsonlData(newData);
                              setDirtyFields(prev => ({...prev, [newData[selectedIndex].messages.at(-1).id]: true}));
                              setShowSaveButton(true);
                            }
                          }}
                          className="gap-2 bg-white/5 text-white hover:bg-white/10 border-white/40"
                        >
                          <Plus className="h-4 w-4" />
                          Add Assistant Message
                        </Button>
                      </div>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showSaveButton && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 right-6"
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

      <Dialog open={showSystemDialog} onOpenChange={(open) => !open && setShowSystemDialog(false)}>
        <DialogContent className="bg-[#1a1a1a] border-white/10">
          <DialogHeader>
            <DialogTitle className="text-white">Edit System Message</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              value={systemMessage}
              onChange={(e) => setSystemMessage(e.target.value)}
              className="w-full min-h-[150px] resize-y bg-[#1f1f1f] text-white/90 border-white/20 rounded-lg transition-all focus:border-primary focus:ring-1 focus:ring-primary"
              placeholder="Enter system message..."
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              onClick={() => setShowSystemDialog(false)}
              className="text-white/70 hover:text-white hover:bg-white/5"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSystemMessageSave}
              className="bg-primary hover:bg-primary/90"
            >
              Save
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add DPO Warning Dialog */}
      <AlertDialog open={showDPOWarning} onOpenChange={setShowDPOWarning}>
        <AlertDialogContent className="bg-[#1a1a1a] border-white/10">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-white">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Insufficient Data Pairs
            </AlertDialogTitle>
            <AlertDialogDescription className="text-white/70">
              You need at least one chosen and one rejected conversation to create a valid DPO dataset. Would you like to export anyway?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              onClick={() => setShowDPOWarning(false)}
              className="text-white/70 hover:text-white hover:bg-white/5"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setShowDPOWarning(false);
                performDPOExport();
              }}
              className="bg-amber-500 hover:bg-amber-600"
            >
              Export Anyway
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
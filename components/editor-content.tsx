'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { parseJSONL, stringifyJSONL, extractSubject } from '../utils/jsonl'
import { MessageSquare, Download, Upload, Save, ChevronRight, Bot, User, Settings, AlertTriangle } from 'lucide-react'
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

  return (
    <div className="w-full">
      {jsonlData.length === 0 ? (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", damping: 20 }}
          className="w-full"
        >
          <label className="relative cursor-pointer">
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
      ) : (
        <div className="space-y-6">
          <div className="flex justify-end gap-2">
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

          {/* ... rest of the editor UI (conversations list, editor, etc.) ... */}
        </div>
      )}

      {/* ... existing dialogs ... */}
    </div>
  )
} 
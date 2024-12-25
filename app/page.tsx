'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { parseJSONL, stringifyJSONL, extractSubject } from '../utils/jsonl'

export default function FineTuneEditor() {
  const [jsonlData, setJsonlData] = useState<any[]>([]);
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [dirtyFields, setDirtyFields] = useState<{[key: string]: boolean}>({});
  const [showSaveButton, setShowSaveButton] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [nextSelectedIndex, setNextSelectedIndex] = useState<number | null>(null);
  const [leftBarWidth, setLeftBarWidth] = useState(256); // Default width
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
        setSelectedIndex(null);
        setDirtyFields({});
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
    <div className="flex h-screen bg-gray-100">
      <div ref={leftBarRef} className="bg-white shadow-md overflow-hidden relative" style={{ width: leftBarWidth }}>
        <ScrollArea className="h-full">
          <div className="p-4">
            <h2 className="text-lg font-semibold mb-4 text-gray-700">Subjects</h2>
            {jsonlData.map((item, index) => (
              <Button
                key={index}
                variant="ghost"
                className={`w-full justify-start mb-2 text-left ${
                  selectedIndex === index ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
                }`}
                onClick={() => handleSubjectClick(index)}
              >
                <div className="w-full overflow-hidden">
                  <p className="truncate">
                    {extractSubject(item)}
                  </p>
                </div>
              </Button>
            ))}
          </div>
        </ScrollArea>
        <div
          ref={resizeRef}
          className="absolute top-0 right-0 w-1 h-full cursor-col-resize bg-gray-300 hover:bg-blue-500 transition-colors"
        />
      </div>
      <div className="flex-1 overflow-auto relative">
        <div className="max-w-4xl mx-auto p-6">
          <h1 className="text-3xl font-bold mb-6 text-gray-800">OpenAI Fine-tune JSONL Editor</h1>
          <Input type="file" onChange={handleFileUpload} accept=".jsonl" className="mb-6" />
          {parseErrors.length > 0 && (
            <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg shadow">
              <h2 className="font-bold mb-2">Parsing Errors:</h2>
              <ul className="list-disc pl-5">
                {parseErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}
          {jsonlData.length > 0 && (
            <Button onClick={handleDownload} className="mb-6 bg-green-500 hover:bg-green-600 text-white">
              Download Edited JSONL
            </Button>
          )}
          {selectedIndex !== null && (
            <Card className="mb-6 shadow-lg">
              <CardHeader className="bg-gray-50 sticky top-0 z-10">
                <CardTitle className="text-xl text-gray-700">Entry {selectedIndex + 1}</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {jsonlData[selectedIndex].messages.map((msg: any, msgIndex: number) => (
                  <div 
                    key={msg.id} 
                    className={`p-4 ${
                      msg.role === 'system' 
                        ? 'bg-blue-50 border-b border-blue-100' 
                        : msg.role === 'assistant' 
                          ? 'flex justify-start' 
                          : 'flex justify-end'
                    }`}
                  >
                    <div className={`${msg.role !== 'system' ? 'w-[80%]' : 'w-full'} ${
                      msg.role === 'assistant' ? 'mr-[20%]' : msg.role === 'user' ? 'ml-[20%]' : ''
                    }`}>
                      <h3 className={`font-semibold mb-2 ${
                        msg.role === 'system' 
                          ? 'text-blue-700' 
                          : msg.role === 'assistant' 
                            ? 'text-green-700' 
                            : 'text-blue-700'
                      } capitalize`}>
                        {msg.role}
                      </h3>
                      <Textarea
                        value={msg.content}
                        onChange={(e) => handleInputChange(msg.id, e.target.value)}
                        className={`w-full p-2 border rounded-md ${
                          msg.role === 'system' 
                            ? 'bg-white' 
                            : msg.role === 'assistant' 
                              ? 'bg-green-50' 
                              : 'bg-blue-50'
                        } ${dirtyFields[msg.id] ? 'bg-red-100 border-yellow-500' : ''}`}
                        rows={Math.min(10, Math.max(3, msg.content.split('\n').length))}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
        {showSaveButton && (
          <div className="fixed bottom-4 right-4">
            <Button onClick={handleSave} className="bg-blue-500 hover:bg-blue-600 text-white">
              Save Changes
            </Button>
          </div>
        )}
      </div>
      <AlertDialog open={showConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
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


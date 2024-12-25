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

          {/* Welcome content - This will be hidden when editor is active */}
          <div className="mt-12">
            {/* Second row: Welcome and AI Journey */}
            <div className="flex items-start justify-between gap-12 mt-12">
              <div className="flex-1 space-y-4">
                <h2 className="text-xl font-semibold text-white/90">👋 Welcome!</h2>
                <p className="text-white/70">
                  I created this editor because I couldn't find a simple tool for editing OpenAI fine-tuning datasets. 
                  The video above from Corbin Brown shows what fine-tuning is about - that's exactly what this tool helps you prepare for. 
                  It's completely free to use and runs entirely in your browser. 
                  With enough support, I'd love to add real-time validation and more advanced features to make your workflow even smoother!
                </p>
              </div>

              <div className="flex-1 space-y-4">
                <h2 className="text-xl font-semibold text-white/90">The AI-Powered Journey</h2>
                <p className="text-white/70">
                  Here's something cool: I didn't write a single line of code for this tool! The entire project was created through AI pair programming.
                  It started as a sketch using v0 by Vercel, then moved to GitHub where Cursor (an AI-powered IDE) helped build everything you see here.
                  The initial version, from idea to public deployment, took just 2 hours of my time.
                  This rapid development showcases how AI tools can help turn ideas into reality incredibly fast - 
                  from ideation to deployment on Vercel, all through natural conversations with AI.
                  This project is a testament to how AI can help create useful tools for the AI community.
                </p>
                <div className="flex items-center gap-4 pt-4 border-t border-white/10">
                  <a
                    href="https://x.com/buryhuang"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-white/70 hover:text-primary transition-colors"
                  >
                    <Twitter className="w-5 h-5" />
                    <span className="text-sm">Follow my journey</span>
                  </a>
                  <a
                    href="https://www.linkedin.com/in/baryhuang/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-white/70 hover:text-primary transition-colors"
                  >
                    <Linkedin className="w-5 h-5" />
                    <span className="text-sm">Connect on LinkedIn</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Third row: Article */}
            <article className="mt-12 pt-8 border-t border-white/10">
              <div className="prose prose-invert max-w-none [&_p]:text-white/70 [&_h1]:text-white/90 [&_h2]:text-white/90 [&_li]:text-white/70">
                <h1 className="text-2xl font-bold mb-6">Understanding JSONL Files and AI Training</h1>
                
                <section>
                  <h2 className="text-xl font-semibold mt-8 mb-4">What is a JSONL File?</h2>
                  <p>
                    A JSONL (JSON Lines) file is a convenient format for storing structured data where each line is a valid JSON object.
                    In the context of AI training, each line represents a single training example, making it perfect for handling large datasets
                    without loading everything into memory at once.
                  </p>
                  <pre className="bg-[#1a1a1a] p-4 rounded-lg overflow-x-auto my-4">
                    <code className="text-sm text-white/90">{`{"name": "example1", "value": 42}
{"name": "example2", "value": 43}
{"name": "example3", "value": 44}`}</code>
                  </pre>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mt-8 mb-4">JSONL Files and OpenAI Fine-tuning</h2>
                  <p>
                    OpenAI's fine-tuning process uses JSONL files as the standard format for training data. Each line contains a conversation
                    with messages from different roles (system, user, assistant), allowing you to teach the AI specific patterns, styles, or
                    domain knowledge. This format ensures that the AI model can clearly understand the role and context of each message in the
                    conversation.
                  </p>
                  <pre className="bg-[#1a1a1a] p-4 rounded-lg overflow-x-auto my-4">
                    <code className="text-sm text-white/90">{`{
  "messages": [
    {"role": "system", "content": "You are a helpful AI assistant focused on technical support."},
    {"role": "user", "content": "How do I check my Python version?"},
    {"role": "assistant", "content": "You can check your Python version by opening a terminal and running: python --version"}
  ]
}
{
  "messages": [
    {"role": "system", "content": "You are a helpful AI assistant focused on technical support."},
    {"role": "user", "content": "How do I install pip?"},
    {"role": "assistant", "content": "To install pip on most systems, you can download get-pip.py and run it with Python: curl https://bootstrap.pypa.io/get-pip.py -o get-pip.py && python get-pip.py"}
  ]
}`}</code>
                  </pre>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mt-8 mb-4">The Critical Role of Human Evaluation</h2>
                  <p>
                    Human evaluation and editing of training data is crucial for developing reliable AI agents. By carefully reviewing and
                    editing JSONL files, we can:
                  </p>
                  <ul className="list-disc pl-6 mt-4 space-y-2" role="list">
                    <li>Ensure the quality and accuracy of training examples</li>
                    <li>Remove biases or inappropriate content from the dataset</li>
                    <li>Maintain consistency in the AI's responses</li>
                    <li>Add context-specific instructions through system messages</li>
                    <li>Iterate and improve based on observed AI behavior</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mt-8 mb-4">Building Smarter AI Agents</h2>
                  <p>
                    The path to creating autonomous and intelligent AI agents heavily relies on the quality of their training data.
                    By providing well-structured, carefully curated examples through JSONL files, we can guide AI models to better
                    understand context, maintain consistency, and provide more helpful responses. This human-in-the-loop approach
                    to AI training ensures that models remain aligned with human values and expectations while continuously improving
                    their capabilities.
                  </p>
                </section>
              </div>
            </article>
          </div>
        </div>
      </div>
    </div>
  )
}


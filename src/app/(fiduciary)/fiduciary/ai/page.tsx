'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Sparkles, MessageSquare, FileText, AlertTriangle, Shield, Brain, Loader2 } from 'lucide-react'

type Tool = 'qa' | 'consent' | null

export default function AIToolsPage() {
  const [activeTool, setActiveTool] = useState<Tool>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState('')

  // QA Tool
  const [question, setQuestion] = useState('')

  // Consent text tool
  const [consentPurpose, setConsentPurpose] = useState('')
  const [consentCategories, setConsentCategories] = useState('')

  async function handleDPDPQA() {
    if (!question) return
    setLoading(true)
    setResult('')
    const res = await fetch('/api/ai/dpdp-qa', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question }),
    })
    const data = await res.json()
    setResult(data.answer ?? data.error)
    setLoading(false)
  }

  async function handleConsentText() {
    if (!consentPurpose || !consentCategories) return
    setLoading(true)
    setResult('')
    const res = await fetch('/api/ai/consent-text', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        purpose: consentPurpose,
        dataCategories: consentCategories.split(',').map(c => c.trim()),
        orgName: 'Your Organisation',
      }),
    })
    const data = await res.json()
    setResult(data.text ?? data.error)
    setLoading(false)
  }

  const tools = [
    {
      id: 'qa' as Tool,
      icon: MessageSquare,
      title: 'DPDP Q&A Assistant',
      desc: 'Ask any question about the Digital Personal Data Protection Act. Get plain-language answers with Act section references.',
    },
    {
      id: 'consent' as Tool,
      icon: Shield,
      title: 'Consent Text Generator',
      desc: 'Generate clear, DPDP-compliant consent notice text for any data collection purpose.',
    },
    {
      id: null,
      icon: FileText,
      title: 'Privacy Notice Generator',
      desc: 'AI-generates your full DPDP privacy notice from your processing activities. Go to Privacy Notices to use this.',
      disabled: true,
    },
    {
      id: null,
      icon: AlertTriangle,
      title: 'Breach Report Drafter',
      desc: 'Auto-draft a DPB breach notification report. Go to a breach record to use this.',
      disabled: true,
    },
    {
      id: null,
      icon: Brain,
      title: 'DPIA Assistant',
      desc: 'Data Protection Impact Assessment guidance for high-risk processing activities. Go to your RoPA to use this.',
      disabled: true,
    },
    {
      id: null,
      icon: Sparkles,
      title: 'Request Risk Analyser',
      desc: 'Assess the complexity and risk of a rights request. Go to a request record to use this.',
      disabled: true,
    },
  ]

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">AI Tools</h1>
        <p className="text-zinc-400 text-sm mt-1">
          Claude-powered tools for DPDP compliance. Accuracy over cleverness — always verify outputs.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tools.map((tool, i) => (
          <Card
            key={i}
            className={`bg-zinc-900 border-zinc-800 transition-colors ${
              !tool.disabled ? 'hover:border-zinc-600 cursor-pointer' : 'opacity-60'
            } ${activeTool === tool.id && tool.id !== null ? 'border-[#2A9D8F]' : ''}`}
            onClick={() => !tool.disabled && tool.id !== null && setActiveTool(tool.id === activeTool ? null : tool.id)}
          >
            <CardHeader>
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <tool.icon className="h-4 w-4 text-[#2A9D8F]" />
                {tool.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-zinc-400 text-xs leading-relaxed">{tool.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Active tool panel */}
      {activeTool === 'qa' && (
        <Card className="bg-zinc-900 border-[#2A9D8F]/50">
          <CardHeader>
            <CardTitle className="text-white text-sm">DPDP Q&A Assistant</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-zinc-300">Your question</Label>
              <Textarea
                value={question}
                onChange={e => setQuestion(e.target.value)}
                placeholder="e.g. Do I need to appoint a DPO? What is the deadline for responding to erasure requests?"
                className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 min-h-[80px]"
              />
            </div>
            <Button onClick={handleDPDPQA} disabled={loading || !question} className="bg-[#C23B22] hover:bg-[#a8321d] text-white">
              {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Thinking...</> : 'Get answer'}
            </Button>
            {result && (
              <div className="bg-zinc-800 rounded-lg p-4 text-zinc-300 text-sm whitespace-pre-wrap leading-relaxed">
                {result}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeTool === 'consent' && (
        <Card className="bg-zinc-900 border-[#2A9D8F]/50">
          <CardHeader>
            <CardTitle className="text-white text-sm">Consent Text Generator</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-zinc-300">Processing purpose</Label>
                <Input
                  value={consentPurpose}
                  onChange={e => setConsentPurpose(e.target.value)}
                  placeholder="e.g. Marketing emails"
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-300">Data categories (comma-separated)</Label>
                <Input
                  value={consentCategories}
                  onChange={e => setConsentCategories(e.target.value)}
                  placeholder="Name, Email, Purchase history"
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
              </div>
            </div>
            <Button onClick={handleConsentText} disabled={loading || !consentPurpose || !consentCategories} className="bg-[#C23B22] hover:bg-[#a8321d] text-white">
              {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Generating...</> : 'Generate consent text'}
            </Button>
            {result && (
              <div className="bg-zinc-800 rounded-lg p-4 text-zinc-300 text-sm whitespace-pre-wrap leading-relaxed border border-[#2A9D8F]/30">
                {result}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

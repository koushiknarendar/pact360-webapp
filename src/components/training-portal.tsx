'use client'

import { useState } from 'react'
import { TRAINING_MODULES, Slide } from '@/lib/training-content'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, XCircle, ChevronRight, BookOpen, Trophy, Star } from 'lucide-react'
import { toast } from 'sonner'

interface TrainingPortalProps {
  session: Record<string, unknown>
  orgId: string
  orgName: string
}

export function TrainingPortal({ session, orgId, orgName }: TrainingPortalProps) {
  const [participantName, setParticipantName] = useState('')
  const [participantEmail, setParticipantEmail] = useState('')
  const [started, setStarted] = useState(false)
  const [currentModule, setCurrentModule] = useState(0)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({})
  const [quizResults, setQuizResults] = useState<Record<string, boolean>>({})
  const [showExplanation, setShowExplanation] = useState(false)
  const [completedModules, setCompletedModules] = useState<string[]>([])
  const [totalXP, setTotalXP] = useState(0)
  const [allDone, setAllDone] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const module = TRAINING_MODULES[currentModule]
  const slide = module?.slides[currentSlide]
  const totalSlides = module?.slides.length ?? 0
  const progress = totalSlides > 0 ? ((currentSlide + 1) / totalSlides) * 100 : 0

  function handleStart() {
    if (!participantName || !participantEmail) return
    setStarted(true)
  }

  function handleAnswer(optionIndex: number) {
    if (quizResults[slide.id] !== undefined) return // already answered
    const isCorrect = slide.options?.[optionIndex]?.correct ?? false
    setQuizAnswers(prev => ({ ...prev, [slide.id]: optionIndex }))
    setQuizResults(prev => ({ ...prev, [slide.id]: isCorrect }))
    setShowExplanation(true)
  }

  async function handleNextSlide() {
    setShowExplanation(false)

    if (currentSlide < totalSlides - 1) {
      setCurrentSlide(prev => prev + 1)
    } else {
      // Module complete
      const quizSlides = module.slides.filter(s => s.type === 'quiz')
      const correctCount = quizSlides.filter(s => quizResults[s.id] === true).length
      const score = quizSlides.length > 0 ? Math.round((correctCount / quizSlides.length) * 100) : 100
      const xpEarned = score >= 70 ? module.xpReward : Math.round(module.xpReward * 0.5)

      setCompletedModules(prev => [...prev, module.id])
      setTotalXP(prev => prev + xpEarned)

      // Save module completion
      try {
        await fetch('/api/training/complete-module', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orgId,
            sessionId: session.id,
            moduleId: module.id,
            participantName,
            participantEmail,
            score,
            xpEarned,
          }),
        })
      } catch {}

      if (currentModule < TRAINING_MODULES.length - 1) {
        setCurrentModule(prev => prev + 1)
        setCurrentSlide(0)
        toast.success(`${module.title} complete! +${xpEarned} XP`)
      } else {
        // All modules done
        setAllDone(true)
        setSubmitting(true)
        await fetch('/api/training/complete-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId: session.id,
            participantName,
            participantEmail,
          }),
        })
        setSubmitting(false)
      }
    }
  }

  if (allDone) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="text-center max-w-md">
          <Trophy className="h-16 w-16 text-[#D4A843] mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-white">Training Complete!</h1>
          <p className="text-zinc-400 mt-2">You&apos;ve completed all 5 DPDP awareness modules.</p>
          <div className="flex items-center justify-center gap-2 mt-4">
            <Star className="h-5 w-5 text-[#D4A843]" />
            <span className="text-2xl font-bold text-[#D4A843]">{totalXP} XP earned</span>
          </div>
          <p className="text-zinc-500 text-sm mt-4">
            Your certificate has been sent to {participantEmail}.<br />
            {orgName} has been notified of your completion.
          </p>
        </div>
      </div>
    )
  }

  if (!started) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="bg-zinc-900 border-zinc-800 max-w-md w-full">
          <CardHeader>
            <div className="text-center mb-2">
              <BookOpen className="h-8 w-8 text-[#2A9D8F] mx-auto mb-3" />
              <CardTitle className="text-white">DPDP Awareness Training</CardTitle>
              <p className="text-zinc-400 text-sm mt-1">{orgName}</p>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-zinc-800 rounded-lg p-4 space-y-2">
              <p className="text-white text-sm font-medium">5 modules · ~65 minutes · Certificate on completion</p>
              {TRAINING_MODULES.map((m, i) => (
                <div key={m.id} className="flex items-center gap-2 text-zinc-400 text-xs">
                  <span className="w-4 h-4 rounded-full bg-zinc-700 flex items-center justify-center text-xs">{i + 1}</span>
                  {m.title}
                </div>
              ))}
            </div>
            <div className="space-y-3">
              <div className="space-y-2">
                <Label className="text-zinc-300">Your full name</Label>
                <Input
                  value={participantName}
                  onChange={e => setParticipantName(e.target.value)}
                  placeholder="Arjun Mehta"
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-300">Work email</Label>
                <Input
                  value={participantEmail}
                  onChange={e => setParticipantEmail(e.target.value)}
                  type="email"
                  placeholder="arjun@company.com"
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
              </div>
            </div>
            <Button
              onClick={handleStart}
              disabled={!participantName || !participantEmail}
              className="w-full bg-[#C23B22] hover:bg-[#a8321d] text-white h-12"
            >
              Start training
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!module || !slide) return null

  const isQuiz = slide.type === 'quiz'
  const hasAnswered = quizResults[slide.id] !== undefined
  const isCorrect = quizResults[slide.id]

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-zinc-500 text-xs">Module {currentModule + 1} of {TRAINING_MODULES.length}</p>
          <p className="text-white text-sm font-medium">{module.title}</p>
        </div>
        <div className="flex items-center gap-2">
          <Star className="h-4 w-4 text-[#D4A843]" />
          <span className="text-[#D4A843] text-sm font-bold">{totalXP} XP</span>
        </div>
      </div>

      {/* Progress */}
      <Progress value={progress} className="mb-6 h-1 bg-zinc-800" />

      {/* Slide */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs border-zinc-700 text-zinc-500 capitalize">
              {slide.type === 'quiz' ? '❓ Quiz' : slide.type}
            </Badge>
          </div>
          <CardTitle className="text-white text-lg leading-snug">{slide.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isQuiz && (
            <div className="text-zinc-300 text-sm leading-relaxed whitespace-pre-line">
              {slide.content}
            </div>
          )}

          {isQuiz && (
            <>
              <p className="text-zinc-300 text-sm leading-relaxed">{slide.content}</p>
              <div className="space-y-2">
                {slide.options?.map((option, i) => {
                  let optionClass = 'border-zinc-700 hover:border-zinc-500 text-zinc-300'
                  if (hasAnswered) {
                    if (option.correct) optionClass = 'border-teal-500 bg-teal-500/10 text-teal-300'
                    else if (quizAnswers[slide.id] === i) optionClass = 'border-red-500 bg-red-500/10 text-red-300'
                    else optionClass = 'border-zinc-800 text-zinc-600'
                  }

                  return (
                    <button
                      key={i}
                      onClick={() => handleAnswer(i)}
                      disabled={hasAnswered}
                      className={`w-full text-left px-4 py-3 rounded-lg border text-sm transition-colors ${optionClass}`}
                    >
                      <div className="flex items-center justify-between">
                        {option.text}
                        {hasAnswered && option.correct && <CheckCircle className="h-4 w-4 text-teal-400 shrink-0" />}
                        {hasAnswered && !option.correct && quizAnswers[slide.id] === i && <XCircle className="h-4 w-4 text-red-400 shrink-0" />}
                      </div>
                    </button>
                  )
                })}
              </div>

              {showExplanation && slide.explanation && (
                <div className={`p-3 rounded-lg text-sm ${isCorrect ? 'bg-teal-500/10 border border-teal-500/30 text-teal-300' : 'bg-orange-500/10 border border-orange-500/30 text-orange-300'}`}>
                  <p className="font-medium mb-1">{isCorrect ? '✓ Correct' : '✗ Not quite'}</p>
                  <p className="text-xs leading-relaxed">{slide.explanation}</p>
                </div>
              )}
            </>
          )}

          <Button
            onClick={handleNextSlide}
            disabled={isQuiz && !hasAnswered}
            className="w-full bg-[#C23B22] hover:bg-[#a8321d] text-white mt-4"
          >
            {currentSlide === totalSlides - 1 && currentModule === TRAINING_MODULES.length - 1
              ? 'Complete training'
              : currentSlide === totalSlides - 1
              ? 'Next module'
              : 'Continue'}
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </CardContent>
      </Card>

      {/* Module progress dots */}
      <div className="flex justify-center gap-1 mt-4">
        {module.slides.map((_, i) => (
          <div
            key={i}
            className={`w-1.5 h-1.5 rounded-full ${i <= currentSlide ? 'bg-[#C23B22]' : 'bg-zinc-700'}`}
          />
        ))}
      </div>
    </div>
  )
}

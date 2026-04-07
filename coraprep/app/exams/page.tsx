"use client"
import { useMemo, useState } from 'react'
import ScreenContainer from '../../components/ScreenContainer'
import GradientButton from '../../components/GradientButton'
import { useApp } from '../../context/AppContext'

const TABS = ['setup','running','results'] as const

export default function Exams(){
  const { content } = useApp()
  const [phase,setPhase] = useState<'setup'|'running'|'results'>('setup')
  const [questions,setQuestions] = useState((content?.exams || []).slice(0,10))
  const [index,setIndex] = useState(0)
  const [answers,setAnswers] = useState<Record<number,string>>({})
  const [chapters,setChapters] = useState<string>('All Chapters')
  const [count,setCount] = useState(25)
  const [competition,setCompetition] = useState(false)
  const [selectedDate,setSelectedDate] = useState('2026-06-01')

  const countdown = useMemo(() => {
    const diff = new Date(selectedDate).getTime() - Date.now()
    if(diff <= 0) return 'Ended'
    const d = Math.floor(diff / (1000*60*60*24));
    const h = Math.floor((diff%(1000*60*60*24))/(1000*60*60));
    const m = Math.floor((diff%(1000*60*60))/(1000*60));
    return `${d}d ${h}h ${m}m`
  }, [selectedDate])

  function startExam(){
    setQuestions((content?.exams || []).slice(0,count))
    setIndex(0)
    setPhase('running')
  }

  function submit(){
    setPhase('results')
  }

  const recentScores = [
    {date:'Mar 15, 2026',score:'91',mode: competition ? 'Competition':'Practice'},
    {date:'Mar 08, 2026',score:'88',mode:'Practice'},
    {date:'Mar 02, 2026',score:'93',mode:'Competition'},
  ]

  if(phase === 'setup'){
    return (
      <ScreenContainer>
        <div className="card space-y-4">
          <h1 className="text-5xl font-black text-primary">Practice Exam</h1>
          <p className="text-gray-600">Configure your exam and track performance over time.</p>
        </div>

        <section className="card space-y-4">
          <div>
            <h3 className="text-xl font-bold text-primary">Select Chapters</h3>
            <select className="w-full rounded-xl border p-3 mt-2" value={chapters} onChange={(e)=>setChapters(e.target.value)}>
              <option>All Chapters</option>
              <option>Sensation and Perception</option>
              <option>Neurodegenerative Diseases</option>
            </select>
          </div>

          <div>
            <h3 className="text-xl font-bold text-primary">Number of Questions</h3>
            <select className="w-full rounded-xl border p-3 mt-2" value={count} onChange={(e)=>setCount(Number(e.target.value))}>
              {[10,25,50,100].map(n => <option key={n} value={n}>{n} Questions</option>)}
            </select>
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2"> <input type="checkbox" checked={competition} onChange={(e)=>setCompetition(e.target.checked)} /> Competition Mode (strict timer)</label>
          </div>

          <button onClick={startExam} className="w-full btn">Start Exam</button>
        </section>

        <section className="card space-y-3">
          <h3 className="text-xl font-bold text-primary">Countdown to Competition</h3>
          <div className="flex flex-col gap-2 md:flex-row md:items-center">
            <input type="date" className="rounded-xl border p-3" value={selectedDate} onChange={(e)=>setSelectedDate(e.target.value)} />
            <p className="font-bold">{countdown}</p>
          </div>
        </section>

        <section className="card space-y-2">
          <h3 className="text-xl font-bold text-primary">Recent Scores</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2 text-sm">
            <span className="font-semibold">Date</span>
            <span className="font-semibold">Score</span>
            <span className="font-semibold">Mode</span>
            <span className="font-semibold">Review</span>
          </div>
          {recentScores.map((row)=> (
            <div key={row.date} className="grid grid-cols-1 md:grid-cols-4 gap-2 items-center text-sm border-t pt-2">
              <span>{row.date}</span>
              <span>{row.score}%</span>
              <span>{row.mode}</span>
              <button className="text-blue-700 underline">Review</button>
            </div>
          ))}
        </section>
      </ScreenContainer>
    )
  }

  if(phase === 'running'){
    const q = questions[index]
    return (
      <ScreenContainer>
        <div className="card space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-bold text-blue-700">Question {index+1} / {questions.length}</h4>
            <span className="text-sm text-gray-600">00:30</span>
          </div>
          <div>
            <p className="text-xl font-semibold text-blue-800">{q.question}</p>
            <div className="mt-3 space-y-2">
              {q.choices.map((c:string,i:number)=> (
                <button
                  key={i}
                  onClick={()=>{ setAnswers({...answers, [index]: c}); setIndex(Math.min(index+1, questions.length-1)) }}
                  className="w-full border border-[#cbe2f6] rounded-btn p-3 text-left"
                  type="button"
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <GradientButton onClick={() => setIndex(Math.max(0,index-1))}>Back</GradientButton>
            <GradientButton onClick={() => setIndex(Math.min(index+1, questions.length-1))}>Next</GradientButton>
            <GradientButton onClick={submit}>Finish</GradientButton>
          </div>
        </div>
      </ScreenContainer>
    )
  }

  return (
    <ScreenContainer>
      <div className="card text-center">
        <h2 className="text-3xl font-bold main-heading">Results</h2>
        <p className="mt-3 text-gray-600">Score: 80% • Correct: 8 • Incorrect: 2</p>
        <div className="mt-4">
          <GradientButton onClick={() => setPhase('setup')}>Try Again</GradientButton>
        </div>
      </div>
    </ScreenContainer>
  )
}

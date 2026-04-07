import React from 'react'

export default function ProgressCard({ title, progress=0, total=100 }: { title: string, progress?: number, total?: number }){
  const pct = Math.min(100, Math.round((progress/total)*100))
  return (
    <div className="p-3 bg-slate-50 rounded">
      <div className="flex justify-between"><div>{title}</div><div>{pct}%</div></div>
      <div className="w-full h-2 bg-slate-200 mt-2 rounded-full overflow-hidden">
        <div style={{ width: `${pct}%` }} className="h-2 bg-neural"></div>
      </div>
    </div>
  )
}

import React, { useState } from 'react'

export default function FlashcardCard({ item }: { item: any }){
  const [show,setShow] = useState(false)

  if(!item) return <div className="text-slate-500">Select a card</div>

  return (
    <div>
      <h3 className="text-xl font-semibold">{item.title ?? item.question}</h3>
      {item.question && <p className="mt-2 text-slate-600">{item.question}</p>}
      <div className="mt-4 flex gap-2">
        <button onClick={()=>setShow(!show)} className="border rounded-lg px-3 py-2">{show? 'Hide' : 'Reveal Answer'}</button>
        <button className="border rounded-lg px-3 py-2">Mark Mastered</button>
        <button className="border rounded-lg px-3 py-2">Needs Review</button>
      </div>
      {show && <div className="mt-4 p-3 bg-slate-50 rounded">{item.answer}</div>}
      <div className="mt-4">
        <label className="text-sm">Confidence</label>
        <div className="flex gap-2 mt-2">
          {[1,2,3,4,5].map(n=> <button key={n} className="border rounded px-2">{n}</button>)}
        </div>
      </div>
    </div>
  )
}

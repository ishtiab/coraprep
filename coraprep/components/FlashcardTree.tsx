import React, { useState } from 'react'

type Node = {
  id: string
  title?: string
  question?: string
  answer?: string
  children?: Node[]
}

export default function FlashcardTree({ data, onSelect }: { data: Node[], onSelect: (n: any)=>void }){
  return (
    <div>
      {data.map(d=> <TreeNode key={d.id} node={d} onSelect={onSelect} />)}
    </div>
  )
}

function TreeNode({ node, onSelect }: { node: Node, onSelect: (n:any)=>void }){
  const [open,setOpen] = useState(true)
  return (
    <div className="mb-2">
      <div className="flex items-center justify-between cursor-pointer" onClick={()=>setOpen(!open)}>
        <div className="font-medium" onClick={()=>onSelect(node)}>{node.title ?? node.question}</div>
        {node.children && <div className="text-sm text-slate-400">{open?'-':'+'}</div>}
      </div>
      {open && node.children && (
        <div className="pl-4 mt-2 border-l">
          {node.children.map(c=> <TreeNode key={c.id} node={c} onSelect={onSelect} />)}
        </div>
      )}
    </div>
  )
}

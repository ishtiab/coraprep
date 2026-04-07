import React from 'react'

export interface CardButtonProps {
  title: string
  icon: string
  onClick?: () => void
}

export default function CardButton({ title, icon, onClick }: CardButtonProps){
  return (
    <button
      onClick={onClick}
      type="button"
      className="hover-lift w-full rounded-[20px] border border-blue-200 bg-white p-4 flex items-center gap-4 shadow-sm hover:shadow-md transition duration-150"
    >
      <span className="h-14 w-14 rounded-[16px] bg-gradient-to-br from-primary to-[#2B90E8] flex items-center justify-center text-white text-2xl">{icon}</span>
      <span className="font-bold text-2xl text-[#0A3F8A]">{title}</span>
    </button>
  )
}

import React, { useRef } from "react"

interface GlassCardProps {
  children?: React.ReactNode
  className?: string
}

export function GlassCard({
  children,
  className = "",
} : GlassCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const frameRef = useRef<number | null>(null)
  const boundsRef = useRef<DOMRect | null>(null)

  const MAX_TILT = 8

  const updateTransform = (rotateX: number, rotateY: number) => {
    const card = cardRef.current
    if (!card) return

    card.style.transform = `
      perspective(1000px)
      rotateX(${rotateX}deg)
      rotateY(${rotateY}deg)
    `
  }

  const handleMouseEnter = () => {
    if (!cardRef.current) return
    boundsRef.current = cardRef.current.getBoundingClientRect()
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!boundsRef.current) return

    const { left, top, width, height } = boundsRef.current

    const x = e.clientX - left
    const y = e.clientY - top

    const rotateX = ((y - height / 2) / height) * MAX_TILT
    const rotateY = ((x - width / 2) / width) * -MAX_TILT

    if (frameRef.current) cancelAnimationFrame(frameRef.current)

    frameRef.current = requestAnimationFrame(() => {
      updateTransform(rotateX, rotateY)
    })
  }

  const handleMouseLeave = () => {
    if (frameRef.current) cancelAnimationFrame(frameRef.current)
    updateTransform(0, 0)
  }

  return (
    <div
      ref={cardRef}
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`
        relative p-2 rounded-2xl
        backdrop-blur-xl bg-white/10
        border border-white/20 shadow-xl
        transition-transform duration-200 ease-out
        hover:scale-105 hover:bg-white/15 hover:transition hover:duration-200 hover:ease-out
        cursor-pointer will-change-transform
        ${className}
      `}
      style={{
        transform: "perspective(1000px)",
        transformStyle: "preserve-3d",
      }}
    >
      {children}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/20 to-transparent opacity-40 pointer-events-none" />
    </div>
  )
}
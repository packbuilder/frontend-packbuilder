type GlassCardProps = {
  children: React.ReactNode
  className?: string
}

export default function GlassCard({ children, className = "" }: GlassCardProps) {
  return (
    <div
      className={`duration-100 cursor-pointer relative before:content-[''] before:absolute before:top-0 before:left-[-150%] before:w-[60%] before:h-full before:bg-white before:opacity-40 before:skew-x-[45deg] before:transition-all before:duration-500 before:ease-linear hover:before:left-[180%] hover:cursor-pointer focus:shadow focus:scale-110 hover:shadow hover:scale-110 p-2 flex flex-col gap-2 items-center rounded overflow-hidden max-w-45 bg-[var(--surface-2)] rounded-2xl shadow-[0_4px_30px_rgba(0,0,0,0.1)] backdrop-blur-[12.1px] border-[.1px] border-white/30 ${className}`}
    >
      {children}
    </div>
  )
}
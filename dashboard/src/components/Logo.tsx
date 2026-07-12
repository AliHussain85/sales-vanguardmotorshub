type LogoProps = {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizes = {
  sm: 'h-10 w-10',
  md: 'h-14 w-14',
  lg: 'h-20 w-20',
}

export function Logo({ size = 'sm', className = '' }: LogoProps) {
  return (
    <img
      src="/logo.png"
      alt="Vanguard Motors Hub"
      className={`${sizes[size]} shrink-0 rounded-xl object-contain ${className}`}
    />
  )
}

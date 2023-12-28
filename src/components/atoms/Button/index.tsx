import { forwardRef, ReactNode } from 'react'

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary'
  className?: string
  children?: ReactNode
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, className, ...rest }, ref) => {
    return (
      <button {...rest} ref={ref} className={`button ${className}`}>
        {children}
      </button>
    )
  }
)

export default Button

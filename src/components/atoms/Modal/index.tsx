'use client'

import * as Dialog from '@radix-ui/react-dialog'
import * as VisuallyHidden from '@radix-ui/react-visually-hidden'
import { isValidElement, ReactNode } from 'react'

import './modal.scss'

import Button from '../Button'

type ModalProps = {
  trigger: ReactNode
  children: ReactNode
  ariaTitle?: string
  ariaDescription?: string
  className?: string
}

const Modal: React.FC<ModalProps> = ({
  className,
  children,
  trigger,
  ariaDescription,
  ariaTitle,
}) => (
  <Dialog.Root>
    <Dialog.Trigger asChild>
      {isValidElement(trigger) ? trigger : <Button>{trigger}</Button>}
    </Dialog.Trigger>
    <Dialog.Portal>
      <Dialog.Overlay className='dialog-overlay' />
      <Dialog.Content className={`dialog-content ${className}`}>
        {ariaTitle && (
          <VisuallyHidden.Root asChild>
            <Dialog.Title>{ariaTitle}</Dialog.Title>
          </VisuallyHidden.Root>
        )}
        {ariaDescription && (
          <VisuallyHidden.Root asChild>
            <Dialog.Description>{ariaDescription}</Dialog.Description>
          </VisuallyHidden.Root>
        )}
        {children}
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>
)

export default Modal

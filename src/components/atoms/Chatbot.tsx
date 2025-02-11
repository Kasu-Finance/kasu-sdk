'use client'

import PlunoWebChatbot, { PlunoWebChatbotConfig } from 'pluno-web-chatbot'
import { memo } from 'react'

const config: PlunoWebChatbotConfig = {
  theme: 'dark',
  primaryColor: 'rgba(196, 153, 108, 1)',
  isWidgetEnabled: true,
}

const Chatbot = () => (
  <PlunoWebChatbot
    communityId={process.env.NEXT_PUBLIC_PLUNO_CHATBOT_ID}
    config={config}
  />
)

export default memo(Chatbot)

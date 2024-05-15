'use client'

import React from 'react'

import useTranslation from '@/hooks/useTranslation'

import MultiTrancheMetricDisplay from '@/components/molecules/TranchDetailCard/TrancheMetricDisplay/MultiTrancheMetricDisplay'
import SingleTrancheMetricDisplay from '@/components/molecules/TranchDetailCard/TrancheMetricDisplay/SingleTrancheMetricDisplay'

interface TrancheMetricDisplayProps {
  titleKey: string
  tooltipKey: string
  content: string
  additionalContent?: string
  suffix?: string
  isLast?: boolean
  isSingleTranche?: boolean
  isRemainingCapacity?: boolean
}

const TrancheMetricDisplay: React.FC<TrancheMetricDisplayProps> = ({
  titleKey,
  tooltipKey,
  content,
  additionalContent,
  suffix,
  isLast,
  isSingleTranche,
  isRemainingCapacity,
}) => {
  const { t } = useTranslation()

  if (isSingleTranche) {
    return (
      <SingleTrancheMetricDisplay
        titleKey={titleKey}
        tooltipKey={tooltipKey}
        content={content}
        additionalContent={additionalContent}
        suffix={suffix}
        isLast={isLast}
        isRemainingCapacity={isRemainingCapacity}
      />
    )
  } else {
    return (
      <MultiTrancheMetricDisplay
        titleKey={titleKey}
        tooltipKey={tooltipKey}
        content={content}
        additionalContent={additionalContent}
        suffix={suffix}
        isLast={isLast}
        isRemainingCapacity={isRemainingCapacity}
      />
    )
  }
}

export default TrancheMetricDisplay

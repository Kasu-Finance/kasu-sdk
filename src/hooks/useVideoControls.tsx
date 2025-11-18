import { MouseEvent, RefObject, useEffect, useRef, useState } from 'react'

export type VideoControls = {
  visible: boolean
  play: boolean
  fullscreen: boolean
  volume: number
  muted: boolean
  currentTime: number
  duration: number
}

const useVideoControls = (
  videoRef: RefObject<HTMLVideoElement>,
  videoContainerRef: RefObject<HTMLDivElement>
) => {
  const [controls, setControls] = useState<VideoControls>({
    visible: false,
    play: false,
    fullscreen: false,
    volume: 0.5,
    muted: false,
    currentTime: 0,
    duration: 0,
  })

  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const video = videoRef.current
    const videoContainer = videoContainerRef.current

    if (!video || !videoContainer) return

    const fullscreenEvent = () => {
      setControls((prev) => ({
        ...prev,
        fullscreen: Boolean(document.fullscreenElement),
      }))
    }

    const durationChangeEvent = () => {
      setControls((prev) => ({
        ...prev,
        duration: video.duration,
      }))
    }

    const timeUpdateEvent = () => {
      setControls((prev) => ({
        ...prev,
        currentTime: video.currentTime,
      }))

      if (video.currentTime === video.duration) {
        setControls((prev) => ({ ...prev, play: false }))
      }
    }

    videoContainer.addEventListener('fullscreenchange', fullscreenEvent)
    video.addEventListener('durationchange', durationChangeEvent)
    video.addEventListener('timeupdate', timeUpdateEvent)

    return () => {
      videoContainer.removeEventListener('fullscreenchange', fullscreenEvent)
      video.removeEventListener('durationchange', durationChangeEvent)
      video.removeEventListener('timeupdate', timeUpdateEvent)
    }
  }, [videoContainerRef, videoRef])

  const handleSeek = (_: Event, value: number | number[]) => {
    if (!videoRef.current) return

    const seekTime = Array.isArray(value) ? value[0] : value

    setControls((prev) => ({
      ...prev,
      currentTime: seekTime,
    }))

    videoRef.current.currentTime = seekTime
  }

  const handleVolumeChange = (_: Event, value: number | number[]) => {
    if (!videoRef.current) return

    const volume = Array.isArray(value) ? value[0] : value

    videoRef.current.volume = volume

    setControls((prev) => ({
      ...prev,
      volume,
      muted: volume === 0 ? true : false,
    }))
  }

  const handleMouseMove = (_: MouseEvent<HTMLDivElement>) => {
    if (controls.currentTime === 0) return

    setControls((prev) => ({ ...prev, visible: true }))

    clearTimeout(timer.current ?? undefined)

    const timeout = setTimeout(() => {
      setControls((prev) => ({ ...prev, visible: false }))
    }, 2000)

    timer.current = timeout
  }

  const toggleMute = (_: MouseEvent<HTMLButtonElement>) => {
    if (!videoRef.current) return

    videoRef.current.muted = !videoRef.current.muted

    setControls((prev) => ({ ...prev, muted: !prev.muted }))
  }

  const togglePlay = () => {
    if (!videoRef.current) return

    setControls((prev) => ({ ...prev, play: !prev.play }))

    if (videoRef.current.paused) {
      videoRef.current.play()
    } else {
      videoRef.current.pause()
    }
  }

  const handlePlay = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()

    if (!videoRef.current) return

    setControls((prev) => ({ ...prev, play: true }))

    videoRef.current.play()
  }

  const handlePause = (_: MouseEvent<HTMLButtonElement>) => {
    if (!videoRef.current) return

    setControls((prev) => ({ ...prev, play: false, visible: true }))

    videoRef.current.pause()
  }

  const focusEventListener = (event: KeyboardEvent) => {
    if (!videoContainerRef.current) return

    // Note that "F" is case-sensitive (uppercase):
    if (event.key === 'F') {
      // Check if we're in fullscreen mode
      if (document.fullscreenElement) {
        document.exitFullscreen()
        return
      }
      // Otherwise enter fullscreen mode
      videoContainerRef.current
        .requestFullscreen({ navigationUI: 'hide' })
        .catch((err) => {
          console.error(`Error enabling fullscreen: ${err.message}`)
        })
    }

    if (event.key === 'Esc') {
      if (document.fullscreenElement) {
        document.exitFullscreen()
        return
      }
    }
  }

  const handleFocus = () => {
    document.addEventListener('keydown', focusEventListener)
  }

  const handleBlur = () => {
    document.removeEventListener('keydown', focusEventListener)
  }

  const toggleFullscreen = (_: MouseEvent<HTMLButtonElement>) => {
    if (!videoContainerRef.current) return

    if (controls.fullscreen) {
      if (document.fullscreenElement) {
        document.exitFullscreen()
      }
    } else {
      videoContainerRef.current.requestFullscreen({ navigationUI: 'hide' })
    }
  }

  return {
    controls,
    handleBlur,
    handleFocus,
    handlePause,
    handlePlay,
    handleSeek,
    handleMouseMove,
    handleVolumeChange,
    togglePlay,
    toggleMute,
    toggleFullscreen,
  }
}

export default useVideoControls

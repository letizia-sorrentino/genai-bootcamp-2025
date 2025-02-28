import { Button } from "./button"
import { PlayIcon, StopIcon } from "@radix-ui/react-icons"
import { useState, useRef } from "react"

interface AudioPlayerProps {
  src: string
  className?: string
}

export function AudioPlayer({ src, className }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const togglePlay = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio(src)
      audioRef.current.onended = () => setIsPlaying(false)
    }

    if (isPlaying) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    } else {
      audioRef.current.play()
    }
    
    setIsPlaying(!isPlaying)
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={togglePlay}
      className={className}
    >
      {isPlaying ? (
        <StopIcon className="h-4 w-4" />
      ) : (
        <PlayIcon className="h-4 w-4" />
      )}
    </Button>
  )
} 
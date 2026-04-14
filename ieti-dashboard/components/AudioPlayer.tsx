'use client'

import { useState, useRef } from 'react'
import { Play, Pause, Volume2 } from 'lucide-react'

export default function AudioPlayer({ url }: { url: string }) {
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const audioRef = useRef<HTMLAudioElement>(null)

  if (!url) return <span className="text-slate-400 text-xs">No recording</span>

  const toggle = () => {
    if (!audioRef.current) return
    if (playing) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }
    setPlaying(!playing)
  }

  const onTimeUpdate = () => {
    if (!audioRef.current) return
    const pct = (audioRef.current.currentTime / audioRef.current.duration) * 100
    setProgress(isNaN(pct) ? 0 : pct)
  }

  const onEnded = () => setPlaying(false)

  return (
    <div className="flex items-center gap-2 bg-slate-50 rounded-lg px-3 py-2 border border-slate-200 w-full max-w-xs">
      <audio ref={audioRef} src={url} onTimeUpdate={onTimeUpdate} onEnded={onEnded} />
      <button
        onClick={toggle}
        className="w-7 h-7 rounded-full bg-[#3B5323] flex items-center justify-center text-white shrink-0 hover:bg-[#4a6830] transition-colors"
      >
        {playing ? <Pause size={13} /> : <Play size={13} />}
      </button>
      <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-[#3B5323] rounded-full transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>
      <Volume2 size={13} className="text-slate-400 shrink-0" />
    </div>
  )
}

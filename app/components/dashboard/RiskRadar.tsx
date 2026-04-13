import React from 'react'

interface RiskWorker {
  name: string
  days: number
}

interface RiskRadarProps {
  workers: RiskWorker[]
}

export default function RiskRadar({ workers }: RiskRadarProps) {
  if (!workers || workers.length === 0) return null

  return (
    <div className="p-6 bg-rose-50 rounded-3xl border border-rose-100 shadow-sm overflow-hidden relative group">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-rose-600 uppercase tracking-wider flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          보험료 리스크 레이더
        </h3>
        <span className="px-2.5 py-0.5 bg-rose-600 text-[10px] font-black text-white rounded-full animate-pulse uppercase tracking-tight">
          Risk Detected
        </span>
      </div>

      <p className="text-xs text-rose-700 font-medium leading-relaxed mb-4">
        월 8일 근무 시 <span className="font-bold underline">4대 사회보험 의무 가입</span> 대상으로 전환되어 노무비가 급증합니다. 리스크 대상자를 확인하세요.
      </p>

      <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1 custom-scrollbar">
        {workers.map((worker, i) => (
          <div key={i} className="flex items-center justify-between p-3 bg-white/60 backdrop-blur-sm rounded-xl border border-rose-100">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 font-bold text-xs">
                {worker.name[0]}
              </div>
              <span className="text-sm font-bold text-gray-900">{worker.name}</span>
            </div>
            <div className="flex items-center gap-2 text-right">
                <div className="flex flex-col items-end">
                    <span className={`text-[10px] font-black ${worker.days === 7 ? 'text-rose-600' : 'text-orange-500'}`}>
                        {worker.days === 7 ? '경고: 7일 근무' : '주의: 6일 근무'}
                    </span>
                    <div className="flex gap-0.5 mt-1">
                        {Array.from({ length: 8 }).map((_, idx) => (
                        <div 
                            key={idx} 
                            className={`w-2 h-1 rounded-full ${idx < worker.days ? (worker.days === 7 ? 'bg-rose-500' : 'bg-orange-400') : 'bg-rose-100'}`} 
                        />
                        ))}
                    </div>
                </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-rose-600/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700 pointer-events-none" />
    </div>
  )
}

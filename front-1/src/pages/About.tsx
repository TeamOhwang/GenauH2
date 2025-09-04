import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { LineChart, Line, ResponsiveContainer } from 'recharts'
import {
  Wifi,
  WifiOff,
  Power,
  PowerOff,
  TrendingUp,
  TrendingDown,
  Minus,
  Gauge,
  Thermometer,
  Zap,
  BarChart3
} from 'lucide-react'
import { useDarkModeStore } from '@/stores/useDarkModeStore'

interface StreamData {
  facId: number
  electrolyzerType: string
  ts: string
  status: 'RUN' | 'IDLE' | 'FAULT'
  stackTempC: number
  stackPressBar: number
  outletPressBar: number
  dcVoltageV: number
  dcCurrentA: number
  purityPct: number
  faultCode: string | null
}

interface SensorData {
  id: string
  name: string
  value: number
  previousValue: number
  unit: string
  status: 'HIGH' | 'NORMAL' | 'LOW' | 'FAULT'
  isOn: boolean
  history: { time: string; value: number }[]
  icon: React.ReactNode
  change: number
  changeDirection: 'up' | 'down' | 'same'
}

const About = () => {
  const [sensorData, setSensorData] = useState<SensorData[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const [streamData, setStreamData] = useState<StreamData | null>(null)
  const { isDarkMode } = useDarkModeStore()

  useEffect(() => {
    // 초기 센서 데이터 설정 (실제 Flask 서버 데이터에 맞춤)
    const initialData: SensorData[] = [
      {
        id: 'temp',
        name: '스택 온도',
        value: 68.0,
        previousValue: 68.0,
        unit: '°C',
        status: 'NORMAL',
        isOn: true,
        icon: <Thermometer className="w-5 h-5" />,
        change: 0,
        changeDirection: 'same',
        history: Array.from({ length: 10 }, (_, j) => ({
          time: new Date(Date.now() - (9 - j) * 2000).toLocaleTimeString(),
          value: 68.0 + Math.random() * 4 - 2
        }))
      },
      {
        id: 'stackPress',
        name: '스택 압력',
        value: 30.0,
        previousValue: 30.0,
        unit: 'bar',
        status: 'NORMAL',
        isOn: true,
        icon: <BarChart3 className="w-5 h-5" />,
        change: 0,
        changeDirection: 'same',
        history: Array.from({ length: 10 }, (_, j) => ({
          time: new Date(Date.now() - (9 - j) * 2000).toLocaleTimeString(),
          value: 30.0 + Math.random() * 2 - 1
        }))
      },
      {
        id: 'outletPress',
        name: '출구 압력',
        value: 30.0,
        previousValue: 30.0,
        unit: 'bar',
        status: 'NORMAL',
        isOn: true,
        icon: <BarChart3 className="w-5 h-5" />,
        change: 0,
        changeDirection: 'same',
        history: Array.from({ length: 10 }, (_, j) => ({
          time: new Date(Date.now() - (9 - j) * 2000).toLocaleTimeString(),
          value: 30.0 + Math.random() * 1 - 0.5
        }))
      },
      {
        id: 'voltage',
        name: 'DC 전압',
        value: 400.0,
        previousValue: 400.0,
        unit: 'V',
        status: 'NORMAL',
        isOn: true,
        icon: <Zap className="w-5 h-5" />,
        change: 0,
        changeDirection: 'same',
        history: Array.from({ length: 10 }, (_, j) => ({
          time: new Date(Date.now() - (9 - j) * 2000).toLocaleTimeString(),
          value: 400.0 + Math.random() * 20 - 10
        }))
      },
      {
        id: 'current',
        name: 'DC 전류',
        value: 1250.0,
        previousValue: 1250.0,
        unit: 'A',
        status: 'NORMAL',
        isOn: true,
        icon: <Zap className="w-5 h-5" />,
        change: 0,
        changeDirection: 'same',
        history: Array.from({ length: 10 }, (_, j) => ({
          time: new Date(Date.now() - (9 - j) * 2000).toLocaleTimeString(),
          value: 1250.0 + Math.random() * 100 - 50
        }))
      },
      {
        id: 'purity',
        name: '순도',
        value: 99.999,
        previousValue: 99.999,
        unit: '%',
        status: 'NORMAL',
        isOn: true,
        icon: <Gauge className="w-5 h-5" />,
        change: 0,
        changeDirection: 'same',
        history: Array.from({ length: 10 }, (_, j) => ({
          time: new Date(Date.now() - (9 - j) * 2000).toLocaleTimeString(),
          value: 99.999 + Math.random() * 0.002 - 0.001
        }))
      }
    ]
    setSensorData(initialData)

    // SSE 연결 시작 (약간의 지연 후)
    const timer = setTimeout(() => {
      const eventSource = connectToStream()

      // cleanup 함수에서 사용할 수 있도록 ref에 저장
      return () => {
        if (eventSource) {
          eventSource.close()
        }
      }
    }, 1000)

    return () => {
      clearTimeout(timer)
    }
  }, [])

  const connectToStream = () => {
    try {
      const eventSource = new EventSource('/stream')

      eventSource.onopen = () => {
        console.log('SSE connection opened')
        setIsConnected(true)
      }

      eventSource.onmessage = (event) => {
        try {
          const data: StreamData = JSON.parse(event.data)
          console.log('Received stream data:', data)
          setStreamData(data)
          updateSensorDataFromStream(data)
          setLastUpdate(new Date())
        } catch (error) {
          console.error('Error parsing stream data:', error)
          setIsConnected(false)
          resetSensorDataToZero()
        }
      }

      eventSource.onerror = (error) => {
        console.error('SSE connection error:', error)
        setIsConnected(false)
        resetSensorDataToZero()

        // EventSource 정리
        if (eventSource.readyState !== EventSource.CLOSED) {
          eventSource.close()
        }

        // 5초 후 재연결 시도
        setTimeout(() => {
          connectToStream()
        }, 5000)
      }

      return eventSource
    } catch (error) {
      console.error('Failed to connect to stream:', error)
      setIsConnected(false)
      resetSensorDataToZero()
      return null
    }
  }

  const resetSensorDataToZero = () => {
    const currentTime = new Date().toLocaleTimeString()

    setSensorData(prev => prev.map(sensor => {
      return {
        ...sensor,
        previousValue: sensor.value,
        value: 0,
        status: 'LOW',
        change: Math.abs(0 - sensor.value),
        changeDirection: 'down' as const,
        history: [
          ...sensor.history.slice(1),
          { time: currentTime, value: 0 }
        ]
      }
    }))

    setLastUpdate(new Date())
  }

  const updateSensorDataFromStream = (data: StreamData) => {
    const currentTime = new Date().toLocaleTimeString()

    setSensorData(prev => prev.map(sensor => {
      // OFF 상태인 센서는 데이터 업데이트하지 않음
      if (!sensor.isOn) {
        return sensor
      }

      let newValue = sensor.value
      let newStatus: 'HIGH' | 'NORMAL' | 'LOW' | 'FAULT' = 'NORMAL'

      // Flask 서버 데이터를 각 센서에 매핑
      switch (sensor.id) {
        case 'temp':
          newValue = data.stackTempC
          newStatus = data.status === 'FAULT' ? 'FAULT' :
            newValue > 75 ? 'HIGH' :
              newValue < 35 ? 'LOW' : 'NORMAL'
          break
        case 'stackPress':
          newValue = data.stackPressBar
          newStatus = data.status === 'FAULT' ? 'FAULT' :
            newValue > 35 ? 'HIGH' :
              newValue < 10 ? 'LOW' : 'NORMAL'
          break
        case 'outletPress':
          newValue = data.outletPressBar
          newStatus = data.status === 'FAULT' ? 'FAULT' :
            newValue > 32 ? 'HIGH' :
              newValue < 28 ? 'LOW' : 'NORMAL'
          break
        case 'voltage':
          newValue = data.dcVoltageV
          newStatus = data.status === 'FAULT' ? 'FAULT' :
            newValue > 420 ? 'HIGH' :
              newValue < 50 ? 'LOW' : 'NORMAL'
          break
        case 'current':
          newValue = data.dcCurrentA
          newStatus = data.status === 'FAULT' ? 'FAULT' :
            newValue > 1500 ? 'HIGH' :
              newValue < 100 ? 'LOW' : 'NORMAL'
          break
        case 'purity':
          newValue = data.purityPct
          newStatus = data.status === 'FAULT' ? 'FAULT' :
            newValue < 99.5 ? 'LOW' : 'NORMAL'
          break
      }

      // 변화량 계산
      const change = Math.abs(newValue - sensor.value)
      const changeDirection: 'up' | 'down' | 'same' =
        newValue > sensor.value ? 'up' :
          newValue < sensor.value ? 'down' : 'same'

      return {
        ...sensor,
        previousValue: sensor.value,
        value: newValue,
        status: newStatus,
        // 스위치 상태는 사용자가 직접 제어하므로 변경하지 않음
        change: change,
        changeDirection: changeDirection,
        history: [
          ...sensor.history.slice(1),
          { time: currentTime, value: newValue }
        ]
      }
    }))
  }

  const toggleSensor = (id: string) => {
    setSensorData(prev => prev.map(sensor =>
      sensor.id === id ? { ...sensor, isOn: !sensor.isOn } : sensor
    ))
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'HIGH': return <TrendingUp className="w-4 h-4" />
      case 'LOW': return <TrendingDown className="w-4 h-4" />
      default: return <Minus className="w-4 h-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'HIGH': return 'text-red-400 bg-red-500/20 border-red-500/30'
      case 'LOW': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30'
      case 'FAULT': return 'text-red-500 bg-red-600/30 border-red-600/50'
      default: return 'text-green-400 bg-green-500/20 border-green-500/30'
    }
  }

  const getStatusColorInline = (status: string) => {
    switch (status) {
      case 'HIGH': return { color: '#f87171', backgroundColor: 'rgba(239, 68, 68, 0.2)', borderColor: 'rgba(239, 68, 68, 0.3)' }
      case 'LOW': return { color: '#fbbf24', backgroundColor: 'rgba(245, 158, 11, 0.2)', borderColor: 'rgba(245, 158, 11, 0.3)' }
      case 'FAULT': return { color: '#ef4444', backgroundColor: 'rgba(220, 38, 38, 0.3)', borderColor: 'rgba(220, 38, 38, 0.5)' }
      default: return { color: '#4ade80', backgroundColor: 'rgba(34, 197, 94, 0.2)', borderColor: 'rgba(34, 197, 94, 0.3)' }
    }
  }

  return (
    <div className={`min-h-screen p-6 transition-colors duration-300 ${
      isDarkMode 
        ? 'bg-gradient-to-br from-stone-900 via-blue-900 to-stone-900' 
        : 'bg-white'
    }`}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center mb-8"
      >
        <div>
          <h1 className={`text-4xl font-bold mb-2 transition-colors duration-300 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            수소 전해조 모니터링
          </h1>
          <div className={`space-y-1 transition-colors duration-300 ${
            isDarkMode ? 'text-stone-300' : 'text-gray-600'
          }`}>
            <p>마지막 업데이트: {lastUpdate.toLocaleTimeString()}</p>
            {streamData && (
              <div className="flex items-center gap-4 text-sm">
                <span>설비 ID: {streamData.facId}</span>
                <span>타입: {streamData.electrolyzerType}</span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${streamData.status === 'RUN' ? 'bg-green-500/20 text-green-400' :
                  streamData.status === 'IDLE' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                  {streamData.status}
                </span>
                {streamData.faultCode && (
                  <span className="px-2 py-1 rounded text-xs font-medium bg-red-600/30 text-red-400">
                    오류: {streamData.faultCode}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        <motion.div
          animate={{ scale: isConnected ? 1 : 0.95 }}
          className={`flex items-center gap-3 px-6 py-3 rounded-full border backdrop-blur-sm transition-all duration-300 ${isConnected
            ? 'text-green-400 bg-green-500/20 border-green-500/30'
            : 'text-red-400 bg-red-500/20 border-red-500/30'
            }`}
        >
          <motion.div
            animate={{ rotate: isConnected ? 0 : 360 }}
            transition={{ duration: 2, repeat: isConnected ? 0 : Infinity }}
          >
            {isConnected ? <Wifi className="w-5 h-5" /> : <WifiOff className="w-5 h-5" />}
          </motion.div>
          <span className="font-semibold">
            {isConnected ? '연결됨' : '연결 끊김'}
          </span>
        </motion.div>
      </motion.div>

      {/* Sensor Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {sensorData.map((sensor, index) => (
            <motion.div
              key={sensor.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02, y: -5 }}
              style={{
                backgroundColor: 'rgba(30, 41, 59, 0.8)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(71, 85, 105, 0.5)',
                borderRadius: '16px',
                padding: '24px',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
              }}
              className="rounded-2xl"
            >
              {/* Card Header - 다크모드 고정 */}
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <div style={{ color: '#60a5fa' }}>{sensor.icon}</div>
                  <span style={{ color: '#ffffff', fontWeight: '600', fontSize: '14px' }}>{sensor.name}</span>
                </div>
                <motion.div
                  animate={{ rotate: sensor.isOn ? 0 : 180 }}
                  style={{
                    padding: '4px',
                    borderRadius: '50%',
                    color: sensor.isOn ? '#4ade80' : '#6b7280'
                  }}
                >
                  {sensor.isOn ? <Power className="w-4 h-4" /> : <PowerOff className="w-4 h-4" />}
                </motion.div>
              </div>

              {/* Value Display - 다크모드 고정 */}
              <div className="text-center mb-4">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <div style={{ fontSize: '30px', fontWeight: 'bold', color: '#ffffff' }}>
                    {sensor.id === 'purity' ? sensor.value.toFixed(4) : sensor.value.toFixed(2)}
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: 'bold' }} className="flex items-center gap-1">
                    {sensor.changeDirection === 'same' || sensor.change === 0 ? (
                      <span style={{ color: '#9ca3af' }}>0</span>
                    ) : (
                      <>
                        <span style={{ color: sensor.changeDirection === 'up' ? '#f87171' : '#60a5fa' }}>
                          {sensor.changeDirection === 'up' ? '⬆' : '⬇'}
                        </span>
                        <span style={{ color: sensor.changeDirection === 'up' ? '#f87171' : '#60a5fa' }}>
                          {sensor.id === 'purity' ? sensor.change.toFixed(4) :
                            sensor.id === 'current' ? sensor.change.toFixed(0) :
                              sensor.id === 'voltage' ? sensor.change.toFixed(0) :
                                sensor.change.toFixed(2)}
                        </span>
                      </>
                    )}
                  </div>

                </div>
                <div style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '8px' }}>{sensor.unit}</div>

                <div 
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '4px 12px',
                    borderRadius: '9999px',
                    fontSize: '12px',
                    fontWeight: '500',
                    border: '1px solid',
                    ...getStatusColorInline(sensor.status)
                  }}
                >
                  {getStatusIcon(sensor.status)}
                  {sensor.status === 'HIGH' ? '높음' :
                    sensor.status === 'LOW' ? '낮음' :
                      sensor.status === 'FAULT' ? '오류' : '정상'}
                </div>
              </div>

              {/* Mini Chart - 다크모드 고정 */}
              <div className="h-16 mb-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={sensor.history}>
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#60a5fa"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Controls - 다크모드 고정 */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#94a3b8' }}>
                  <span>H/H</span>
                  <span>H</span>
                  <span>L</span>
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => toggleSensor(sensor.id)}
                  style={{
                    width: '100%',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontWeight: '600',
                    transition: 'all 0.3s',
                    backgroundColor: sensor.isOn ? '#3b82f6' : '#4b5563',
                    color: sensor.isOn ? '#ffffff' : '#d1d5db',
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: sensor.isOn ? '0 10px 15px -3px rgba(59, 130, 246, 0.25)' : 'none'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = sensor.isOn ? '#2563eb' : '#374151'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = sensor.isOn ? '#3b82f6' : '#4b5563'
                  }}
                >
                  {sensor.isOn ? 'ON' : 'OFF'}
                </motion.button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>


    </div>
  )
}

export default About
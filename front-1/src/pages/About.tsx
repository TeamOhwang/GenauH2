import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { LineChart, Line, ResponsiveContainer } from 'recharts'
import {
  Activity,
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
      const eventSource = new EventSource('http://127.0.0.1:5000/stream')

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
          // 파싱 오류 시 시뮬레이션 데이터 사용
          simulateData()
        }
      }

      eventSource.onerror = (error) => {
        console.error('SSE connection error:', error)
        setIsConnected(false)

        // 시뮬레이션 데이터로 대체
        simulateData()

        // EventSource 정리
        if (eventSource.readyState !== EventSource.CLOSED) {
          eventSource.close()
        }

        // 5초 후 재연결 시도
        setTimeout(() => {
          if (!isConnected) {
            connectToStream()
          }
        }, 5000)
      }

      return eventSource
    } catch (error) {
      console.error('Failed to connect to stream:', error)
      setIsConnected(false)
      // 연결 실패 시 시뮬레이션 데이터 시작
      startSimulation()
      return null
    }
  }

  const simulateData = () => {
    const currentTime = new Date().toLocaleTimeString()

    setSensorData(prev => prev.map(sensor => {
      // OFF 상태인 센서는 데이터 업데이트하지 않음
      if (!sensor.isOn) {
        return sensor
      }

      const baseValue = sensor.value
      const variation = baseValue * 0.05 // 5% 변동
      const newValue = baseValue + (Math.random() - 0.5) * variation

      let newStatus: 'HIGH' | 'NORMAL' | 'LOW' | 'FAULT' = 'NORMAL'

      // 각 센서별 임계값 체크
      switch (sensor.id) {
        case 'temp':
          newStatus = newValue > 75 ? 'HIGH' : newValue < 35 ? 'LOW' : 'NORMAL'
          break
        case 'stackPress':
          newStatus = newValue > 35 ? 'HIGH' : newValue < 10 ? 'LOW' : 'NORMAL'
          break
        case 'outletPress':
          newStatus = newValue > 32 ? 'HIGH' : newValue < 28 ? 'LOW' : 'NORMAL'
          break
        case 'voltage':
          newStatus = newValue > 420 ? 'HIGH' : newValue < 50 ? 'LOW' : 'NORMAL'
          break
        case 'current':
          newStatus = newValue > 1500 ? 'HIGH' : newValue < 100 ? 'LOW' : 'NORMAL'
          break
        case 'purity':
          newStatus = newValue < 99.5 ? 'LOW' : 'NORMAL'
          break
      }

      // 변화량 계산
      const finalValue = Math.max(0, newValue)
      const change = Math.abs(finalValue - sensor.value)
      const changeDirection: 'up' | 'down' | 'same' =
        finalValue > sensor.value ? 'up' :
          finalValue < sensor.value ? 'down' : 'same'

      return {
        ...sensor,
        previousValue: sensor.value,
        value: finalValue,
        status: newStatus,
        change: change,
        changeDirection: changeDirection,
        history: [
          ...sensor.history.slice(1),
          { time: currentTime, value: finalValue }
        ]
      }
    }))

    setLastUpdate(new Date())
  }

  const startSimulation = () => {
    // 2초마다 시뮬레이션 데이터 업데이트
    const interval = setInterval(() => {
      if (!isConnected) {
        simulateData()
      } else {
        clearInterval(interval)
      }
    }, 2000)

    return interval
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center mb-8"
      >
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">수소 전해조 모니터링</h1>
          <div className="text-slate-300 space-y-1">
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
              className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-2xl"
            >
              {/* Card Header */}
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <div className="text-blue-400">{sensor.icon}</div>
                  <span className="text-white font-semibold text-sm">{sensor.name}</span>
                </div>
                <motion.div
                  animate={{ rotate: sensor.isOn ? 0 : 180 }}
                  className={`p-1 rounded-full ${sensor.isOn ? 'text-green-400' : 'text-gray-500'}`}
                >
                  {sensor.isOn ? <Power className="w-4 h-4" /> : <PowerOff className="w-4 h-4" />}
                </motion.div>
              </div>

              {/* Value Display */}
              <div className="text-center mb-4">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <div className="text-3xl font-bold text-white">
                    {sensor.id === 'purity' ? sensor.value.toFixed(0) : sensor.value.toFixed(2)}
                  </div>
                  <div className="text-sm font-bold flex items-center gap-1">
                    {sensor.changeDirection === 'same' || sensor.change === 0 ? (
                      <span className="text-gray-400">0</span>
                    ) : (
                      <>
                        <span className={sensor.changeDirection === 'up' ? 'text-red-400' : 'text-blue-400'}>
                          {sensor.changeDirection === 'up' ? '⬆' : '⬇'}
                        </span>
                        <span className={sensor.changeDirection === 'up' ? 'text-red-400' : 'text-blue-400'}>
                          {sensor.id === 'purity' ? sensor.change.toFixed(0) :
                            sensor.id === 'current' ? sensor.change.toFixed(0) :
                              sensor.id === 'voltage' ? sensor.change.toFixed(0) :
                                sensor.change.toFixed(2)}
                        </span>
                      </>
                    )}
                  </div>

                </div>
                <div className="text-slate-400 text-sm mb-2">{sensor.unit}</div>

                <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(sensor.status)}`}>
                  {getStatusIcon(sensor.status)}
                  {sensor.status === 'HIGH' ? '높음' :
                    sensor.status === 'LOW' ? '낮음' :
                      sensor.status === 'FAULT' ? '오류' : '정상'}
                </div>
              </div>

              {/* Mini Chart */}
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

              {/* Controls */}
              <div className="space-y-3">
                <div className="flex justify-between text-xs text-slate-400">
                  <span>H/H</span>
                  <span>H</span>
                  <span>L</span>
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => toggleSensor(sensor.id)}
                  className={`w-full py-2 px-4 rounded-lg font-semibold transition-all ${sensor.isOn
                    ? 'bg-blue-500 hover:bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                    : 'bg-gray-600 hover:bg-gray-700 text-gray-300'
                    }`}
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
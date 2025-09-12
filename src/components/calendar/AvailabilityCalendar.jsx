import React, { useState, useEffect } from 'react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isBefore, startOfDay } from 'date-fns'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const AvailabilityCalendar = ({ availability = {}, onDateClick, readOnly = false }) => {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [hoveredDate, setHoveredDate] = useState(null)

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate)
    newDate.setMonth(currentDate.getMonth() + direction)
    setCurrentDate(newDate)
  }

  const getDateStatus = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    return availability[dateStr] || 'available'
  }

  const getDateColor = (date) => {
    const status = getDateStatus(date)
    const isPast = isBefore(date, startOfDay(new Date()))
    
    if (isPast) {
      return 'bg-dark-700 text-dark-500 cursor-not-allowed'
    }
    
    switch (status) {
      case 'booked':
        return 'bg-red-500 text-white cursor-pointer hover:bg-red-600'
      case 'blocked':
        return 'bg-red-400 text-white cursor-pointer hover:bg-red-500'
      case 'available':
        return 'bg-green-500 text-white cursor-pointer hover:bg-green-600'
      default:
        return 'bg-green-500 text-white cursor-pointer hover:bg-green-600'
    }
  }

  const handleDateClick = (date) => {
    if (readOnly || isBefore(date, startOfDay(new Date()))) return
    
    if (onDateClick) {
      onDateClick(date, getDateStatus(date))
    }
  }

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return (
    <div className="bg-dark-800 rounded-lg p-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">
          {format(currentDate, 'MMMM yyyy')}
        </h3>
        <div className="flex space-x-2">
          <button
            onClick={() => navigateMonth(-1)}
            className="p-2 text-dark-300 hover:text-white hover:bg-dark-700 rounded-lg transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => navigateMonth(1)}
            className="p-2 text-dark-300 hover:text-white hover:bg-dark-700 rounded-lg transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Week Days Header */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map(day => (
          <div key={day} className="text-center text-sm font-medium text-dark-300 py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map(date => {
          const isCurrentMonth = isSameMonth(date, currentDate)
          const isCurrentDay = isToday(date)
          
          return (
            <div
              key={date.toISOString()}
              className={`
                relative h-8 w-8 rounded text-xs font-medium flex items-center justify-center transition-all duration-200
                ${isCurrentMonth ? getDateColor(date) : 'bg-dark-700 text-dark-500'}
                ${isCurrentDay ? 'ring-2 ring-primary-500' : ''}
                ${hoveredDate === date ? 'scale-110' : ''}
              `}
              onClick={() => handleDateClick(date)}
              onMouseEnter={() => setHoveredDate(date)}
              onMouseLeave={() => setHoveredDate(null)}
              title={`${format(date, 'MMM d, yyyy')} - ${getDateStatus(date)}`}
            >
              {format(date, 'd')}
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="mt-6 flex flex-wrap gap-4 text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded"></div>
          <span className="text-dark-300">Available</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-red-500 rounded"></div>
          <span className="text-dark-300">Booked</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-red-400 rounded"></div>
          <span className="text-dark-300">Blocked</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-dark-700 rounded"></div>
          <span className="text-dark-300">Past</span>
        </div>
      </div>

      {!readOnly && (
        <div className="mt-4 text-sm text-dark-400">
          Click on dates to toggle availability. Green = Available, Red = Blocked/Booked
        </div>
      )}
    </div>
  )
}

export default AvailabilityCalendar

import { useState, useEffect } from 'react';
import { Navbar } from '../components/Navbar';
import { ConfirmModal } from '../components/ConfirmModal';
import { useAuth } from '../contexts/AuthContext';
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  CheckCircle2,
  X,
  Edit2,
  Trash2,
  Plus,
  Filter,
  Calendar as CalendarIcon,
  AlertCircle
} from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export const CalendarView = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [trips, setTrips] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [showDateEventsModal, setShowDateEventsModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedDateForAdd, setSelectedDateForAdd] = useState(null);
  const [filters, setFilters] = useState(['trips', 'pending', 'completed']);
  const [draggedEvent, setDraggedEvent] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, event: null });
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const { user } = useAuth();

  const [newTask, setNewTask] = useState({
    title: '',
    due_date: new Date().toISOString().split('T')[0],
    trip_id: null,
    completed: false
  });

  useEffect(() => {
    fetchTripsAndTasks();
  }, [user]);

  const fetchTripsAndTasks = async () => {
    try {
      const token = localStorage.getItem('token');

      const [tripsResponse, tasksResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/trips`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }),
        fetch(`${API_BASE_URL}/tasks`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
      ]);

      if (!tripsResponse.ok) throw new Error('Failed to fetch trips');
      if (!tasksResponse.ok) throw new Error('Failed to fetch tasks');

      const tripsData = await tripsResponse.json();
      const tasksData = await tasksResponse.json();

      console.log('Fetched trips:', tripsData);
      console.log('Fetched tasks:', tasksData);

      setTrips(tripsData || []);
      setTasks(tasksData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  const getEventsForDate = (date) => {
    if (!date) return { trips: [], tasks: [] };

    // Format date as YYYY-MM-DD in local timezone
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;

    let dateTrips = trips.filter((trip) => {
      const start = new Date(trip.startDate);
      const end = new Date(trip.endDate);
      
      // Normalize all dates to local midnight for proper comparison
      const startLocal = new Date(start.getFullYear(), start.getMonth(), start.getDate());
      const endLocal = new Date(end.getFullYear(), end.getMonth(), end.getDate());
      const dateLocal = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      
      // Show trip if it falls within the date range and is not completed
      const isWithinDateRange = dateLocal >= startLocal && dateLocal <= endLocal;
      const isNotCompleted = trip.status !== 'completed';
      
      return isWithinDateRange && isNotCompleted;
    });

    let dateTasks = tasks.filter((task) => {
      if (!task.dueDate) return false;
      const taskDate = new Date(task.dueDate);
      // Normalize both dates to local midnight to avoid timezone issues
      const taskDateLocal = new Date(taskDate.getFullYear(), taskDate.getMonth(), taskDate.getDate());
      const dateLocal = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      return taskDateLocal.getTime() === dateLocal.getTime();
    });

    if (!filters.includes('trips')) {
      dateTrips = [];
    }

    // Apply task filters correctly
    const hasPendingFilter = filters.includes('pending');
    const hasCompletedFilter = filters.includes('completed');
    
    if (!hasPendingFilter && !hasCompletedFilter) {
      // Show no tasks if both filters are unchecked
      dateTasks = [];
    } else if (hasPendingFilter && !hasCompletedFilter) {
      // Show only pending tasks
      dateTasks = dateTasks.filter(t => !t.completed);
    } else if (!hasPendingFilter && hasCompletedFilter) {
      // Show only completed tasks
      dateTasks = dateTasks.filter(t => t.completed);
    }
    // If both filters are checked, show all tasks (no filtering needed)

    return { trips: dateTrips, tasks: dateTasks };
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const isToday = (date) => {
    if (!date) return false;
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const isPastDate = (date) => {
    if (!date) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    return checkDate < today;
  };

  const handleEventClick = (event, type) => {
    setSelectedEvent({ ...event, type });
  };

  const handleDateClick = (date) => {
    if (!date) return;

    // Allow clicking on any date to view events, but restrict adding tasks to future dates
    setSelectedDate(date);
    setShowDateEventsModal(true);
  };

  const handleAddTaskForDate = (date) => {
    // Format date as YYYY-MM-DD in local timezone
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;

    setSelectedDateForAdd(dateStr);
    setNewTask({ ...newTask, due_date: dateStr });
    setShowDateEventsModal(false);
    setShowAddTaskModal(true);
  };

  const handleFilterToggle = (filterValue) => {
    setFilters(prev => {
      if (prev.includes(filterValue)) {
        return prev.filter(f => f !== filterValue);
      } else {
        return [...prev, filterValue];
      }
    });
  };

  const handleDeleteEvent = () => {
    if (!selectedEvent) return;
    setDeleteConfirm({ show: true, event: selectedEvent });
  };

  const confirmDeleteEvent = async () => {
    if (!deleteConfirm.event) return;

    try {
      const token = localStorage.getItem('token');
      const endpoint = deleteConfirm.event.type === 'trip' ? 'trips' : 'tasks';
      const response = await fetch(`${API_BASE_URL}/${endpoint}/${deleteConfirm.event._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to delete event');

      setSelectedEvent(null);
      fetchTripsAndTasks();
    } catch (error) {
      console.error('Error deleting:', error);
    }
  };

  const handleUpdateTask = async (taskId, updates) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updates)
      });

      if (!response.ok) throw new Error('Failed to update task');

      fetchTripsAndTasks();
      setSelectedEvent(null);
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTask.title.trim()) {
      setErrorMessage('Please enter a task title');
      setShowErrorModal(true);
      return;
    }
    if (!newTask.due_date) {
      setErrorMessage('Please select a due date');
      setShowErrorModal(true);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: newTask.title,
          dueDate: newTask.due_date,
          tripId: newTask.trip_id,
          completed: newTask.completed,
          userId: user.id
        })
      });

      if (!response.ok) throw new Error('Failed to add task');

      setShowAddTaskModal(false);
      setNewTask({
        title: '',
        due_date: new Date().toISOString().split('T')[0],
        trip_id: null,
        completed: false
      });
      fetchTripsAndTasks();
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  const handleDragStart = (e, event, type) => {
    setDraggedEvent({ ...event, type });
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e, date) => {
    e.preventDefault();
    if (!draggedEvent || !date) return;

    // Format date as YYYY-MM-DD in local timezone
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;

    try {
      const token = localStorage.getItem('token');

      if (draggedEvent.type === 'task') {
        const response = await fetch(`${API_BASE_URL}/tasks/${draggedEvent._id || draggedEvent.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ dueDate: dateStr })
        });

        if (!response.ok) throw new Error('Failed to update task');
      } else if (draggedEvent.type === 'trip') {
        const oldStart = new Date(draggedEvent.startDate || draggedEvent.start_date + 'T00:00:00');
        const oldEnd = new Date(draggedEvent.endDate || draggedEvent.end_date + 'T00:00:00');
        const duration = oldEnd - oldStart;
        const newStart = new Date(date);
        newStart.setHours(0, 0, 0, 0);
        const newEnd = new Date(newStart.getTime() + duration);

        const endYear = newEnd.getFullYear();
        const endMonth = String(newEnd.getMonth() + 1).padStart(2, '0');
        const endDay = String(newEnd.getDate()).padStart(2, '0');
        const endDateStr = `${endYear}-${endMonth}-${endDay}`;

        const response = await fetch(`${API_BASE_URL}/trips/${draggedEvent._id || draggedEvent.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            startDate: dateStr,
            endDate: endDateStr
          })
        });

        if (!response.ok) throw new Error('Failed to update trip');
      }

      setDraggedEvent(null);
      fetchTripsAndTasks();
    } catch (error) {
      console.error('Error updating event:', error);
    }
  };

  const monthYear = currentDate.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const days = getDaysInMonth(currentDate);

  return (
    <div className="min-h-screen page-background">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 flex items-center gap-3">
            <CalendarIcon className="w-8 h-8 text-blue-600" />
            Calendar
          </h1>

          <div className="flex items-center gap-4">
            <button
              onClick={previousMonth}
              className="p-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-all hover:scale-105 shadow-sm border border-blue-200"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-xl text-gray-900 font-semibold min-w-[180px] text-center">
              {monthYear}
            </span>
            <button
              onClick={nextMonth}
              className="p-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-all hover:scale-105 shadow-sm border border-blue-200"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="mb-6 bg-white backdrop-blur-sm rounded-xl border border-blue-200 p-4 shadow-md">
          <div className="flex items-center gap-2 text-gray-600 mb-3">
            <Filter className="w-4 h-4" />
            <span className="text-sm font-semibold">Filters:</span>
          </div>
          <div className="flex flex-wrap gap-4">
            {[
              { value: 'trips', label: 'Trips', color: 'from-blue-600 to-purple-600' },
              { value: 'pending', label: 'Pending Tasks', color: 'from-yellow-600 to-orange-600' },
              { value: 'completed', label: 'Completed Tasks', color: 'from-green-600 to-emerald-600' }
            ].map(({ value, label, color }) => (
              <label
                key={value}
                className="flex items-center gap-2 cursor-pointer group"
              >
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={filters.includes(value)}
                    onChange={() => handleFilterToggle(value)}
                    className="w-5 h-5 rounded border-blue-200 bg-white text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer"
                  />
                </div>
                <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors">
                  {label}
                </span>
                <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${color}`}></div>
              </label>
            ))}
          </div>
        </div>

        <div className="bg-white backdrop-blur-sm rounded-2xl border border-blue-200 overflow-hidden shadow-md">
          <div className="grid grid-cols-7 gap-px bg-blue-100">
            {weekDays.map((day) => (
              <div
                key={day}
                className="bg-white px-2 sm:px-4 py-3 text-center text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wider"
              >
                <span className="hidden sm:inline">{day}</span>
                <span className="sm:hidden">{day.slice(0, 1)}</span>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-px bg-blue-100">
            {days.map((date, index) => {
              const events = getEventsForDate(date);
              const hasEvents = events.trips.length > 0 || events.tasks.length > 0;
              const past = isPastDate(date);

              return (
                <div
                  key={index}
                  onClick={() => date && handleDateClick(date)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => date && handleDrop(e, date)}
                  className={`bg-white min-h-[80px] sm:min-h-[120px] p-1 sm:p-2 transition-all ${
                    !date ? 'bg-blue-50 cursor-default' : past ? 'cursor-default opacity-60' : 'cursor-pointer hover:bg-blue-50'
                  } ${isToday(date) ? 'ring-2 ring-blue-500 ring-inset' : ''}`}
                >
                  {date && (
                    <>
                      <div
                        className={`text-xs sm:text-sm mb-1 sm:mb-2 ${
                          isToday(date)
                            ? 'text-blue-600 font-bold'
                            : past
                            ? 'text-gray-400 font-normal'
                            : 'text-gray-900 font-bold'
                        }`}
                      >
                        {date.getDate()}
                      </div>
                      <div className="space-y-1">
                        {events.trips.slice(0, 2).map((trip) => (
                          <div
                            key={trip._id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, trip, 'trip')}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEventClick(trip, 'trip');
                            }}
                            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-[10px] sm:text-xs px-1.5 sm:px-2 py-1 rounded-lg flex items-center gap-1 truncate cursor-move hover:shadow-lg hover:scale-105 transition-all"
                          >
                            <MapPin className="w-2.5 h-2.5 sm:w-3 sm:h-3 flex-shrink-0" />
                            <span className="truncate font-medium">{trip.destination}</span>
                          </div>
                        ))}
                        {events.tasks.slice(0, 2).map((task) => (
                          <div
                            key={task._id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, task, 'task')}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEventClick(task, 'task');
                            }}
                            className={`text-white text-[10px] sm:text-xs px-1.5 sm:px-2 py-1 rounded-lg flex items-center gap-1 truncate cursor-move hover:shadow-lg hover:scale-105 transition-all ${
                              task.completed
                                ? 'bg-gradient-to-r from-green-600 to-emerald-600'
                                : 'bg-gradient-to-r from-yellow-600 to-orange-600'
                            }`}
                          >
                            <CheckCircle2 className="w-2.5 h-2.5 sm:w-3 sm:h-3 flex-shrink-0" />
                            <span className={`truncate font-medium ${task.completed ? 'line-through' : ''}`}>
                              {task.title}
                            </span>
                          </div>
                        ))}
                        {(() => {
                          const displayedTrips = Math.min(events.trips.length, 2);
                          const displayedTasks = Math.min(events.tasks.length, 2);
                          const totalDisplayed = displayedTrips + displayedTasks;
                          const totalEvents = events.trips.length + events.tasks.length;
                          const remaining = totalEvents - totalDisplayed;

                          if (remaining > 0) {
                            return (
                              <div className="text-[10px] sm:text-xs text-gray-600 px-1 sm:px-2 font-medium bg-blue-50 rounded py-0.5 border border-blue-100">
                                +{remaining} more
                              </div>
                            );
                          }
                          return null;
                        })()}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-4 items-center justify-center text-xs sm:text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-gradient-to-r from-blue-600 to-purple-600"></div>
            <span className="text-gray-700">Trips</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-gradient-to-r from-yellow-600 to-orange-600"></div>
            <span className="text-gray-700">Pending Tasks</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-gradient-to-r from-green-600 to-emerald-600"></div>
            <span className="text-gray-700">Completed Tasks</span>
          </div>
        </div>
      </div>

      {selectedEvent && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl border border-blue-200 p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-3">
                {selectedEvent.type === 'trip' ? (
                  <div className="p-3 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                ) : (
                  <div className={`p-3 rounded-xl ${
                    selectedEvent.completed
                      ? 'bg-gradient-to-br from-green-600 to-emerald-600'
                      : 'bg-gradient-to-br from-yellow-600 to-orange-600'
                  }`}>
                    <CheckCircle2 className="w-6 h-6 text-white" />
                  </div>
                )}
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {selectedEvent.type === 'trip' ? selectedEvent.destination : selectedEvent.title}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {selectedEvent.type === 'trip' ? 'Trip' : selectedEvent.completed ? 'Completed Task' : 'Task'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedEvent(null)}
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              {selectedEvent.type === 'trip' ? (
                <>
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <p className="text-sm text-gray-600 mb-1">Duration</p>
                    <p className="text-gray-900 font-medium">
                      {new Date(selectedEvent.startDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric'
                      })} - {new Date(selectedEvent.endDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                  {selectedEvent.budget && (
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                      <p className="text-sm text-gray-600 mb-1">Budget</p>
                      <p className="text-gray-900 font-medium">${selectedEvent.budget}</p>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <p className="text-sm text-gray-600 mb-1">Due Date</p>
                    <p className="text-gray-900 font-medium">
                      {new Date(selectedEvent.dueDate || selectedEvent.due_date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                  {selectedEvent.trips && (
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                      <p className="text-sm text-gray-600 mb-1">Related Trip</p>
                      <p className="text-gray-900 font-medium">{selectedEvent.trips.destination}</p>
                    </div>
                  )}
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <p className="text-sm text-gray-600 mb-2">Status</p>
                      <button
                        onClick={() => handleUpdateTask(selectedEvent._id, { completed: !selectedEvent.completed })}
                        className={`w-full px-4 py-2 rounded-lg font-medium transition-all shadow-sm ${
                          selectedEvent.completed
                            ? 'bg-green-600 hover:bg-green-700 text-white'
                            : 'bg-white border border-blue-200 hover:bg-blue-50 text-gray-700'
                        }`}
                      >
                        {selectedEvent.completed ? 'Completed ✓' : 'Mark as Complete'}
                      </button>
                  </div>
                </>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleDeleteEvent}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 shadow-md"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddTaskModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl border border-blue-200 p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Add New Task</h3>
              <button
                onClick={() => setShowAddTaskModal(false)}
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleAddTask} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Task Title *
                </label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  className="w-full bg-white border border-blue-200 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter task title"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Due Date *
                </label>
                <input
                  type="date"
                  value={newTask.due_date}
                  onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
                  className="w-full bg-white border border-blue-200 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Related Trip (Optional)
                </label>
                <select
                  value={newTask.trip_id || ''}
                  onChange={(e) => setNewTask({ ...newTask, trip_id: e.target.value || null })}
                  className="w-full bg-white border border-blue-200 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">No trip</option>
                  {trips.map((trip) => (
                    <option key={trip.id} value={trip.id}>
                      {trip.destination}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-3 bg-blue-50 rounded-lg p-4 border border-blue-200">
                <input
                  type="checkbox"
                  id="completed"
                  checked={newTask.completed}
                  onChange={(e) => setNewTask({ ...newTask, completed: e.target.checked })}
                  className="w-5 h-5 rounded border-blue-200 text-blue-600 focus:ring-2 focus:ring-blue-500"
                />
                <label htmlFor="completed" className="text-gray-700 cursor-pointer">
                  Mark as completed
                </label>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddTaskModal(false)}
                  className="flex-1 bg-white border border-blue-200 hover:bg-blue-50 text-gray-700 px-4 py-3 rounded-lg font-medium transition-all shadow-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white px-4 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 shadow-md"
                >
                  <Plus className="w-4 h-4" />
                  Add Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDateEventsModal && selectedDate && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl border border-blue-200 p-6 max-w-2xl w-full shadow-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">
                  {selectedDate.toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {(() => {
                    const events = getEventsForDate(selectedDate);
                    const total = events.trips.length + events.tasks.length;
                    return total === 0 ? 'No events' : `${total} event${total !== 1 ? 's' : ''}`;
                  })()}
                </p>
              </div>
              <button
                onClick={() => setShowDateEventsModal(false)}
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {(() => {
              const events = getEventsForDate(selectedDate);

              return (
                <div className="space-y-4">
                  {events.trips.length > 0 && (
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-blue-600" />
                        Trips ({events.trips.length})
                      </h4>
                      <div className="space-y-2">
                        {events.trips.map((trip) => (
                          <div
                            key={trip._id}
                            onClick={() => {
                              setShowDateEventsModal(false);
                              handleEventClick(trip, 'trip');
                            }}
                            className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 rounded-lg cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all"
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <h5 className="text-white font-semibold">{trip.destination}</h5>
                                <p className="text-blue-100 text-sm mt-1">
                                  {new Date(trip.startDate).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric'
                                  })} - {new Date(trip.endDate).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric'
                                  })}
                                </p>
                              </div>
                              {trip.budget && (
                                <div className="text-white font-semibold">${trip.budget}</div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {events.tasks.length > 0 && (
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-yellow-600" />
                        Tasks ({events.tasks.length})
                      </h4>
                      <div className="space-y-2">
                        {events.tasks.map((task) => (
                          <div
                            key={task._id}
                            onClick={() => {
                              setShowDateEventsModal(false);
                              handleEventClick(task, 'task');
                            }}
                            className={`p-4 rounded-lg cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all ${
                              task.completed
                                ? 'bg-gradient-to-r from-green-600 to-emerald-600'
                                : 'bg-gradient-to-r from-yellow-600 to-orange-600'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <CheckCircle2 className="w-5 h-5 text-white flex-shrink-0" />
                                <div>
                                  <h5 className={`text-white font-semibold ${task.completed ? 'line-through' : ''}`}>
                                    {task.title}
                                  </h5>
                                  {task.tripId && (
                                    <p className="text-white/80 text-sm mt-1">
                                      <MapPin className="w-3 h-3 inline mr-1" />
                                      {task.tripId.destination}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <span className={`text-xs px-2 py-1 rounded ${
                                task.completed ? 'bg-green-900/50' : 'bg-orange-900/50'
                              } text-white font-medium`}>
                                {task.completed ? 'Done' : 'Pending'}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {events.trips.length === 0 && events.tasks.length === 0 && (
                    <div className="text-center py-12">
                      <CalendarIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-700 text-lg">No events on this day</p>
                      <p className="text-gray-600 text-sm mt-2">Click "Add Task" to create one</p>
                    </div>
                  )}

                  <div className="flex gap-3 pt-4 border-t border-blue-200">
                    <button
                      onClick={() => setShowDateEventsModal(false)}
                      className="flex-1 bg-white border border-blue-200 hover:bg-blue-50 text-gray-700 px-4 py-3 rounded-lg font-medium transition-all shadow-sm"
                    >
                      Close
                    </button>
                    <button
                      onClick={() => handleAddTaskForDate(selectedDate)}
                      className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white px-4 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 shadow-md"
                    >
                      <Plus className="w-4 h-4" />
                      Add Task
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={deleteConfirm.show}
        onClose={() => setDeleteConfirm({ show: false, event: null })}
        onConfirm={confirmDeleteEvent}
        title={`Delete ${deleteConfirm.event?.type === 'trip' ? 'Trip' : 'Task'}`}
        message={`Are you sure you want to delete "${deleteConfirm.event?.type === 'trip' ? deleteConfirm.event?.destination : deleteConfirm.event?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        confirmStyle="danger"
      />

      {/* Error Modal */}
      {showErrorModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full animate-fadeIn">
            <div className="flex items-start gap-4">
              <div className="bg-red-100 rounded-full p-3 flex-shrink-0">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Error</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{errorMessage}</p>
              </div>
            </div>
            <button
              onClick={() => setShowErrorModal(false)}
              className="mt-6 w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

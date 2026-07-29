import { EntityManagerPage } from '../components/EntityManagerPage'
import { StatusBadge } from '../components/ui/AppPrimitives'
import { formatDate } from '../utils/formatters'

const config = {
  resource: 'sessions',
  title: 'Sessions',
  description: 'Coordinate workshops, onboarding calls, training deliveries, trainers, and attendance targets across each session.',
  singularLabel: 'Session',
  ctaLabel: 'Schedule session',
  defaultValues: {
    client: '',
    title: '',
    trainer: '',
    location: '',
    sessionDate: new Date().toISOString().slice(0, 10),
    seats: 0,
    attendance: 0,
    status: 'scheduled',
  },
  fields: [
    { name: 'client', label: 'Client', type: 'select', required: 'Client is required.' },
    { name: 'title', label: 'Session title', type: 'text', required: 'Session title is required.', placeholder: 'Enterprise onboarding cohort' },
    { name: 'trainer', label: 'Trainer', type: 'text', required: 'Trainer name is required.', placeholder: 'Lead Trainer' },
    { name: 'location', label: 'Location', type: 'text', required: 'Location is required.', placeholder: 'Mumbai HQ / Zoom' },
    { name: 'sessionDate', label: 'Session date', type: 'date', required: 'Session date is required.' },
    { name: 'seats', label: 'Seat capacity', type: 'number', required: 'Seat capacity is required.', placeholder: '40' },
    { name: 'attendance', label: 'Attendance', type: 'number', required: 'Attendance is required.', placeholder: '35' },
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      required: 'Status is required.',
      options: [
        { label: 'Scheduled', value: 'scheduled' },
        { label: 'Completed', value: 'completed' },
        { label: 'Cancelled', value: 'cancelled' },
      ],
    },
  ],
  columns: [
    {
      key: 'title',
      label: 'Session',
      render: (session) => (
        <div>
          <p className="font-semibold text-white">{session.title}</p>
          <p className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-500">{session.location}</p>
        </div>
      ),
    },
    { key: 'trainer', label: 'Trainer' },
    { key: 'sessionDate', label: 'Date', render: (session) => formatDate(session.sessionDate) },
    { key: 'seats', label: 'Seats' },
    { key: 'attendance', label: 'Attendance' },
    { key: 'status', label: 'Status', render: (session) => <StatusBadge value={session.status} /> },
  ],
  summary: (sessions) => {
    const seats = sessions.reduce((total, session) => total + Number(session.seats || 0), 0)
    const attendance = sessions.reduce((total, session) => total + Number(session.attendance || 0), 0)
    return [
      { label: 'Scheduled sessions', value: sessions.length.toString() },
      { label: 'Completed', value: sessions.filter((session) => session.status === 'completed').length.toString() },
      { label: 'Seat capacity', value: seats.toString() },
      { label: 'Fill rate', value: seats ? `${Math.round((attendance / seats) * 100)}%` : '0%' },
    ]
  },
}

export function SessionsPage() {
  return <EntityManagerPage config={config} />
}

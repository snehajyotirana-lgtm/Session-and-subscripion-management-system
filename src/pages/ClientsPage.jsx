import { EntityManagerPage } from '../components/EntityManagerPage'
import { StatusBadge } from '../components/ui/AppPrimitives'
import { formatDate, sentenceCase } from '../utils/formatters'

const config = {
  resource: 'clients',
  title: 'Clients',
  description: 'Manage customer records, contact details, plan ownership, and lifecycle status across the CSPMS platform.',
  singularLabel: 'Client',
  ctaLabel: 'Add client',
  defaultValues: {
    name: '',
    email: '',
    phone: '',
    company: '',
    plan: '',
    status: 'lead',
    joinedAt: new Date().toISOString().slice(0, 10),
  },
  fields: [
    { name: 'name', label: 'Full name', type: 'text', required: 'Client name is required.', placeholder: 'Aarav Sharma' },
    { name: 'email', label: 'Email', type: 'email', required: 'Email is required.', placeholder: 'aarav@acme.com' },
    { name: 'phone', label: 'Phone', type: 'text', required: 'Phone number is required.', placeholder: '+91 98765 43210' },
    { name: 'company', label: 'Company', type: 'text', required: 'Company is required.', placeholder: 'Acme Learning Pvt Ltd' },
    { name: 'plan', label: 'Plan', type: 'text', required: 'Plan is required.', placeholder: 'Enterprise Growth' },
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      required: 'Status is required.',
      options: [
        { label: 'Lead', value: 'lead' },
        { label: 'Active', value: 'active' },
        { label: 'Inactive', value: 'inactive' },
      ],
    },
    { name: 'joinedAt', label: 'Joined at', type: 'date', required: 'Join date is required.' },
  ],
  columns: [
    {
      key: 'name',
      label: 'Client',
      render: (client) => (
        <div>
          <p className="font-semibold text-white">{client.name}</p>
          <p className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-500">{sentenceCase(client.plan)}</p>
        </div>
      ),
    },
    { key: 'company', label: 'Company' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
    { key: 'status', label: 'Status', render: (client) => <StatusBadge value={client.status} /> },
    { key: 'joinedAt', label: 'Joined', render: (client) => formatDate(client.joinedAt) },
  ],
  summary: (clients) => [
    { label: 'Total records', value: clients.length.toString() },
    { label: 'Active clients', value: clients.filter((client) => client.status === 'active').length.toString() },
    { label: 'Warm leads', value: clients.filter((client) => client.status === 'lead').length.toString() },
    { label: 'Inactive', value: clients.filter((client) => client.status === 'inactive').length.toString() },
  ],
}

export function ClientsPage() {
  return <EntityManagerPage config={config} />
}

import { EntityManagerPage } from '../components/EntityManagerPage'
import { StatusBadge } from '../components/ui/AppPrimitives'
import { formatCurrency, formatDate } from '../utils/formatters'

const config = {
  resource: 'subscriptions',
  title: 'Subscriptions',
  description: 'Track each billing plan, renewal cycle, pricing tier, and service status for your customer accounts.',
  singularLabel: 'Subscription',
  ctaLabel: 'Create subscription',
  defaultValues: {
    client: '',
    plan: '',
    amount: 0,
    billingCycle: 'Monthly',
    startDate: new Date().toISOString().slice(0, 10),
    renewalDate: new Date().toISOString().slice(0, 10),
    status: 'pending',
  },
  fields: [
    { name: 'client', label: 'Client', type: 'select', required: 'Client is required.' },
    { name: 'plan', label: 'Plan', type: 'text', required: 'Plan is required.', placeholder: 'Enterprise Growth' },
    { name: 'amount', label: 'Amount', type: 'number', required: 'Subscription amount is required.', step: '0.01', placeholder: '125000' },
    {
      name: 'billingCycle',
      label: 'Billing cycle',
      type: 'select',
      required: 'Billing cycle is required.',
      options: [
        { label: 'Monthly', value: 'Monthly' },
        { label: 'Quarterly', value: 'Quarterly' },
        { label: 'Yearly', value: 'Yearly' },
      ],
    },
    { name: 'startDate', label: 'Start date', type: 'date', required: 'Start date is required.' },
    { name: 'renewalDate', label: 'Renewal date', type: 'date', required: 'Renewal date is required.' },
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      required: 'Status is required.',
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Pending', value: 'pending' },
        { label: 'Cancelled', value: 'cancelled' },
      ],
    },
  ],
  columns: [
    {
      key: 'clientName',
      label: 'Client',
      render: (subscription) => (
        <div>
          <p className="font-semibold text-white">{subscription.client?.name || subscription.clientName}</p>
          <p className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-500">{subscription.plan}</p>
        </div>
      ),
    },
    { key: 'billingCycle', label: 'Cycle' },
    { key: 'amount', label: 'Amount', render: (subscription) => formatCurrency(Number(subscription.amount || 0)) },
    { key: 'startDate', label: 'Start', render: (subscription) => formatDate(subscription.startDate) },
    { key: 'renewalDate', label: 'Renewal', render: (subscription) => formatDate(subscription.renewalDate) },
    { key: 'status', label: 'Status', render: (subscription) => <StatusBadge value={subscription.status} /> },
  ],
  summary: (subscriptions) => [
    { label: 'Total plans', value: subscriptions.length.toString() },
    { label: 'Active plans', value: subscriptions.filter((subscription) => subscription.status === 'active').length.toString() },
    {
      label: 'Monthly recurring',
      value: formatCurrency(
        subscriptions
          .filter((subscription) => subscription.status === 'active')
          .reduce((total, subscription) => total + Number(subscription.amount || 0), 0),
      ),
    },
    { label: 'Renewing soon', value: subscriptions.filter((subscription) => subscription.status === 'pending').length.toString() },
  ],
}

export function SubscriptionsPage() {
  return <EntityManagerPage config={config} />
}

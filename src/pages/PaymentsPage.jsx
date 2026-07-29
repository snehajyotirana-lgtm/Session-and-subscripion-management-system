import { EntityManagerPage } from '../components/EntityManagerPage'
import { StatusBadge } from '../components/ui/AppPrimitives'
import { formatCurrency, formatDate } from '../utils/formatters'

const config = {
  resource: 'payments',
  title: 'Payments',
  description: 'Capture invoices, payment methods, settlement dates, and collection status across every account.',
  singularLabel: 'Payment',
  ctaLabel: 'Record payment',
  defaultValues: {
    client: '',
    amount: 0,
    method: 'Bank Transfer',
    invoiceId: '',
    paidAt: new Date().toISOString().slice(0, 10),
    status: 'pending',
  },
  fields: [
    { name: 'client', label: 'Client', type: 'select', required: 'Client is required.' },
    { name: 'amount', label: 'Amount', type: 'number', required: 'Amount is required.', step: '0.01', placeholder: '50000' },
    {
      name: 'method',
      label: 'Payment method',
      type: 'select',
      required: 'Payment method is required.',
      options: [
        { label: 'Bank Transfer', value: 'Bank Transfer' },
        { label: 'Card', value: 'Card' },
        { label: 'UPI', value: 'UPI' },
        { label: 'Cash', value: 'Cash' },
      ],
    },
    { name: 'invoiceId', label: 'Invoice ID', type: 'text', required: 'Invoice ID is required.', placeholder: 'INV-2026-001' },
    { name: 'paidAt', label: 'Paid at', type: 'date', required: 'Payment date is required.' },
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      required: 'Status is required.',
      options: [
        { label: 'Paid', value: 'paid' },
        { label: 'Pending', value: 'pending' },
        { label: 'Failed', value: 'failed' },
      ],
    },
  ],
  columns: [
    {
      key: 'clientName',
      label: 'Client',
      render: (payment) => (
        <div>
          <p className="font-semibold text-white">{payment.client?.name || payment.clientName}</p>
          <p className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-500">{payment.invoiceId}</p>
        </div>
      ),
    },
    { key: 'method', label: 'Method' },
    { key: 'amount', label: 'Amount', render: (payment) => formatCurrency(Number(payment.amount || 0)) },
    { key: 'paidAt', label: 'Paid at', render: (payment) => formatDate(payment.paidAt) },
    { key: 'status', label: 'Status', render: (payment) => <StatusBadge value={payment.status} /> },
  ],
  summary: (payments) => [
    { label: 'Invoices', value: payments.length.toString() },
    { label: 'Paid invoices', value: payments.filter((payment) => payment.status === 'paid').length.toString() },
    {
      label: 'Collected',
      value: formatCurrency(payments.filter((payment) => payment.status === 'paid').reduce((total, payment) => total + Number(payment.amount || 0), 0)),
    },
    {
      label: 'Outstanding',
      value: formatCurrency(payments.filter((payment) => payment.status !== 'paid').reduce((total, payment) => total + Number(payment.amount || 0), 0)),
    },
  ],
}

export function PaymentsPage() {
  return <EntityManagerPage config={config} />
}

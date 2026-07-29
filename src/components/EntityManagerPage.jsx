import { PencilLine, Plus, Trash2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { createResource, deleteResource, fetchCollection, getApiErrorMessage, updateResource } from '../services/api'
import { formatDate, getEntityId, sentenceCase, toInputDate } from '../utils/formatters'
import {
  EmptyState,
  LoadingState,
  Modal,
  PageHeader,
  Panel,
  PrimaryButton,
  SearchInput,
  SecondaryButton,
  StatCard,
  StatusBadge,
} from './ui/AppPrimitives'

function FieldInput({
  field,
  register,
  clients,
}) {
  const common = {
    ...register(field.name, {
      required: field.required,
      valueAsNumber: field.type === 'number',
    }),
    placeholder: field.placeholder,
    className: 'field-input',
  }

  return (
    <label className="space-y-2">
      <span className="text-sm font-medium text-slate-200">{field.label}</span>
      {field.type === 'select' ? (
        // if this is a client selector and we have clients loaded, render them
        field.name === 'client' && Array.isArray(clients) ? (
          <select {...register(field.name, { required: field.required })} className="field-input">
            <option value="">Select {field.label.toLowerCase()}</option>
            {clients.map((c) => (
              <option key={c.id || c._id} value={c.id ?? c._id}>
                {c.name || `${c.firstName || ''} ${c.lastName || ''}`.trim() || c.email}
              </option>
            ))}
          </select>
        ) : (
          <select {...register(field.name, { required: field.required })} className="field-input">
            <option value="">Select {field.label.toLowerCase()}</option>
            {field.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        )
      ) : (
        <input type={field.type} step={field.step} {...common} />
      )}
    </label>
  )
}

export function EntityManagerPage({ config }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [clients, setClients] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [search, setSearch] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const form = useForm({
    defaultValues: config.defaultValues,
  })

  const loadItems = async () => {
    setLoading(true)
    try {
      const response = await fetchCollection(config.resource)
      setItems(response)
    } catch (error) {
      toast.error(getApiErrorMessage(error))
    } finally {
      setLoading(false)
    }
  }

  const loadClients = async () => {
    try {
      const response = await fetchCollection('clients')
      setClients(response)
    } catch (error) {
      // non-fatal
    }
  }

  useEffect(() => {
    void loadItems()
    void loadClients()
  }, [])

  const filteredItems = useMemo(() => {
    if (!search.trim()) {
      return items
    }

    const needle = search.toLowerCase()
    return items.filter((item) =>
      JSON.stringify(item)
        .toLowerCase()
        .includes(needle),
    )
  }, [items, search])

  const metrics = useMemo(() => config.summary(items), [config, items])

  const openCreateModal = () => {
    setEditingItem(null)
    form.reset(config.defaultValues)
    setIsModalOpen(true)
  }

  useEffect(() => {
    form.reset(config.defaultValues)
  }, [config.defaultValues])

  const openEditModal = (item) => {
    setEditingItem(item)
    const normalized = config.fields.reduce((accumulator, field) => {
      let value = item[field.name]
      // when editing and the field is a client reference, resolve to id
      if (field.name === 'client' && value && typeof value === 'object') {
        value = value._id ?? value.id
      }
      accumulator[field.name] = field.type === 'date' ? toInputDate(value) : value
      return accumulator
    }, {})

    form.reset(normalized)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    form.reset(config.defaultValues)
    setEditingItem(null)
    setIsModalOpen(false)
  }

  const onSubmit = form.handleSubmit(async (values) => {
    setSubmitting(true)
    try {
      if (editingItem) {
        await updateResource(config.resource, getEntityId(editingItem), values)
        toast.success(`${config.singularLabel} updated successfully.`)
      } else {
        await createResource(config.resource, values)
        toast.success(`${config.singularLabel} created successfully.`)
      }

      closeModal()
      await loadItems()
    } catch (error) {
      toast.error(getApiErrorMessage(error))
    } finally {
      setSubmitting(false)
    }
  })

  const handleDelete = async (item) => {
    const confirmed = window.confirm(`Delete this ${config.singularLabel.toLowerCase()} record?`)
    if (!confirmed) {
      return
    }

    try {
      await deleteResource(config.resource, getEntityId(item))
      setItems((current) => current.filter((entry) => getEntityId(entry) !== getEntityId(item)))
      toast.success(`${config.singularLabel} deleted.`)
    } catch (error) {
      toast.error(getApiErrorMessage(error))
    }
  }

  return (
    <section className="space-y-6">
      <PageHeader
        title={config.title}
        description={config.description}
        action={
          <PrimaryButton onClick={openCreateModal} className="justify-center">
            <Plus className="h-4 w-4" />
            {config.ctaLabel}
          </PrimaryButton>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <StatCard key={metric.label} label={metric.label} value={metric.value} />
        ))}
      </div>

      <Panel className="overflow-hidden">
        <div className="flex flex-col gap-4 border-b border-white/10 px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">{config.title} directory</h2>
            <p className="mt-1 text-sm text-slate-400">Monitor, search, and maintain every {config.singularLabel.toLowerCase()} record in one place.</p>
          </div>
          <div className="w-full max-w-md">
            <SearchInput value={search} onChange={setSearch} placeholder={`Search ${config.title.toLowerCase()}...`} />
          </div>
        </div>

        {loading ? (
          <LoadingState />
        ) : filteredItems.length === 0 ? (
          <EmptyState
            title={`No ${config.title.toLowerCase()} found`}
            description={`Create your first ${config.singularLabel.toLowerCase()} record or adjust the search filters to see results.`}
            action={<PrimaryButton onClick={openCreateModal}>{config.ctaLabel}</PrimaryButton>}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-white/10 text-left">
              <thead className="bg-slate-900/80">
                <tr>
                  {config.columns.map((column) => (
                    <th key={column.key} className={`px-6 py-4 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 ${column.className ?? ''}`.trim()}>
                      {column.label}
                    </th>
                  ))}
                  <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredItems.map((item) => (
                  <tr key={getEntityId(item) || JSON.stringify(item)} className="transition hover:bg-white/[0.02]">
                    {config.columns.map((column) => (
                      <td key={column.key} className={`px-6 py-4 align-top text-sm text-slate-200 ${column.className ?? ''}`.trim()}>
                        {column.render ? column.render(item) : renderValue(item[column.key])}
                      </td>
                    ))}
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEditModal(item)}
                          className="rounded-xl border border-white/10 p-2 text-slate-300 transition hover:border-cyan-400/30 hover:bg-cyan-400/10 hover:text-cyan-100"
                          aria-label={`Edit ${config.singularLabel}`}
                        >
                          <PencilLine className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleDelete(item)}
                          className="rounded-xl border border-white/10 p-2 text-slate-300 transition hover:border-rose-400/30 hover:bg-rose-400/10 hover:text-rose-100"
                          aria-label={`Delete ${config.singularLabel}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      <Modal
        open={isModalOpen}
        onClose={closeModal}
        title={editingItem ? `Edit ${config.singularLabel}` : config.ctaLabel}
        description={`Use the form below to ${editingItem ? 'update' : 'create'} your ${config.singularLabel.toLowerCase()} record.`}
      >
        <form onSubmit={(event) => void onSubmit(event)} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            {config.fields.map((field) => (
              <div key={field.name} className={field.type === 'select' ? 'md:col-span-1' : ''}>
                <FieldInput field={field} register={form.register} clients={clients} />
                {form.formState.errors[field.name] ? (
                  <p className="mt-2 text-sm text-rose-300">
                    {String(form.formState.errors[field.name]?.message ?? `${field.label} is required.`)}
                  </p>
                ) : null}
              </div>
            ))}
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-white/10 pt-5 sm:flex-row sm:justify-end">
            <SecondaryButton onClick={closeModal} disabled={submitting}>
              Cancel
            </SecondaryButton>
            <PrimaryButton type="submit" disabled={submitting}>
              {submitting ? 'Saving...' : editingItem ? `Save ${config.singularLabel}` : config.ctaLabel}
            </PrimaryButton>
          </div>
        </form>
      </Modal>
    </section>
  )
}

function renderValue(value) {
  if (typeof value === 'number') {
    return <span className="font-medium text-white">{value.toLocaleString('en-IN')}</span>
  }

  if (typeof value === 'string') {
    const isDate = /^\d{4}-\d{2}-\d{2}/.test(value) || !Number.isNaN(Date.parse(value))
    if (['active', 'lead', 'inactive', 'pending', 'cancelled', 'scheduled', 'completed', 'paid', 'failed'].includes(value.toLowerCase())) {
      return <StatusBadge value={value} />
    }

    return <span className="text-slate-200">{isDate ? formatDate(value) : sentenceCase(value)}</span>
  }

  return <span className="text-slate-500">—</span>
}

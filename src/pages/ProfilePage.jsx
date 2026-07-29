import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { ArrowRight, Camera, Key } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import {
  changeUserPassword,
  fetchUserProfile,
  getApiErrorMessage,
  updateUserProfile,
  uploadUserProfilePicture,
} from '../services/api'
import { PageHeader, Panel, PrimaryButton, SecondaryButton, LoadingState } from '../components/ui/AppPrimitives'

const profileFields = [
  { name: 'firstName', label: 'First name', type: 'text', required: 'First name is required.' },
  { name: 'lastName', label: 'Last name', type: 'text', required: 'Last name is required.' },
  { name: 'email', label: 'Email', type: 'email', required: 'Email is required.' },
  { name: 'phone', label: 'Phone', type: 'text', placeholder: '+1 555 123 4567' },
  { name: 'address', label: 'Address', type: 'text', placeholder: '123 Main St, City, Country' },
]

export function ProfilePage() {
  const { user, updateUser } = useAuth()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [passwordSaving, setPasswordSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

  const profileForm = useForm({ defaultValues: { firstName: '', lastName: '', email: '', phone: '', address: '' } })
  const passwordForm = useForm({ defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' } })

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true)
      try {
        const response = await fetchUserProfile()
        setProfile(response)
        profileForm.reset({
          firstName: response.firstName || '',
          lastName: response.lastName || '',
          email: response.email || '',
          phone: response.phone || '',
          address: response.address || '',
        })
      } catch (error) {
        toast.error(getApiErrorMessage(error))
      } finally {
        setLoading(false)
      }
    }

    void loadProfile()
  }, [profileForm])

  const handleProfileSubmit = profileForm.handleSubmit(async (values) => {
    setSaving(true)
    try {
      const updated = await updateUserProfile(values)
      setProfile(updated)
      updateUser(updated)
      toast.success('Profile updated successfully.')
    } catch (error) {
      toast.error(getApiErrorMessage(error))
    } finally {
      setSaving(false)
    }
  })

  const handlePasswordSubmit = passwordForm.handleSubmit(async (values) => {
    setPasswordSaving(true)
    try {
      await changeUserPassword(values)
      passwordForm.reset({ currentPassword: '', newPassword: '', confirmPassword: '' })
      toast.success('Password changed successfully.')
    } catch (error) {
      toast.error(getApiErrorMessage(error))
    } finally {
      setPasswordSaving(false)
    }
  })

  const handleProfilePictureUpload = async (event) => {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('profilePicture', file)
      const updated = await uploadUserProfilePicture(formData)
      setProfile(updated)
      updateUser(updated)
      toast.success('Profile picture updated successfully.')
    } catch (error) {
      toast.error(getApiErrorMessage(error))
    } finally {
      setUploading(false)
      event.target.value = ''
    }
  }

  if (loading) {
    return <LoadingState message="Loading your profile..." />
  }

  return (
    <section className="space-y-6">
      <PageHeader title="My profile" description="Update your profile details, change your password, and upload a profile image." />

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Panel className="space-y-6 p-6">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="relative">
              <img
                src={profile?.profilePicture || '/placeholder-avatar.svg'}
                alt="Profile"
                onError={(event) => {
                  event.currentTarget.src = '/placeholder-avatar.svg'
                }}
                className="h-28 w-28 rounded-full border border-white/10 object-cover"
              />
              <label className="absolute bottom-0 right-0 inline-flex cursor-pointer items-center gap-2 rounded-full border border-white/10 bg-slate-900/90 px-3 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-200 transition hover:bg-slate-800">
                <Camera className="h-3.5 w-3.5" />
                <span>{uploading ? 'Uploading' : 'Upload'}</span>
                <input type="file" accept="image/*" onChange={handleProfilePictureUpload} className="sr-only" />
              </label>
            </div>
            <div>
              <p className="text-xl font-semibold text-white">{profile?.name || `${profile?.firstName} ${profile?.lastName}`}</p>
              <p className="mt-1 text-sm text-slate-400">{profile?.role || 'Team member'}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-white">Profile summary</h2>
              <p className="mt-1 text-sm text-slate-400">Your current account details and contact information.</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-slate-950/80 p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Email</p>
                <p className="mt-2 text-sm text-white">{profile?.email || 'Not set'}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-950/80 p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Phone</p>
                <p className="mt-2 text-sm text-white">{profile?.phone || 'Not set'}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-950/80 p-4 sm:col-span-2">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Address</p>
                <p className="mt-2 text-sm text-white">{profile?.address || 'Not set'}</p>
              </div>
            </div>
          </div>
        </Panel>

        <div className="space-y-6">
          <Panel className="p-6">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-white">Edit profile</h2>
              <p className="mt-1 text-sm text-slate-400">Update your account information for the workspace.</p>
            </div>
            <form onSubmit={(event) => void handleProfileSubmit(event)} className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                {profileFields.map((field) => (
                  <label key={field.name} className="space-y-2">
                    <span className="text-sm font-medium text-slate-200">{field.label}</span>
                    <input
                      type={field.type}
                      placeholder={field.placeholder}
                      {...profileForm.register(field.name, { required: field.required })}
                      className="field-input w-full"
                    />
                    {profileForm.formState.errors[field.name] ? (
                      <p className="text-sm text-rose-300">{String(profileForm.formState.errors[field.name]?.message)}</p>
                    ) : null}
                  </label>
                ))}
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <PrimaryButton type="submit" disabled={saving} className="justify-center">
                  {saving ? 'Saving changes...' : 'Save profile'}
                </PrimaryButton>
                <SecondaryButton type="button" disabled={saving} onClick={() => profileForm.reset({
                  firstName: profile?.firstName || '',
                  lastName: profile?.lastName || '',
                  email: profile?.email || '',
                  phone: profile?.phone || '',
                  address: profile?.address || '',
                })}
                >
                  Reset
                </SecondaryButton>
              </div>
            </form>
          </Panel>

          <Panel className="p-6">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-white">Change password</h2>
              <p className="mt-1 text-sm text-slate-400">Use a strong new password and confirm it before saving.</p>
            </div>
            <form onSubmit={(event) => void handlePasswordSubmit(event)} className="space-y-6">
              <div className="grid gap-4">
                <label className="space-y-2">
                  <span className="text-sm font-medium text-slate-200">Current password</span>
                  <input type="password" {...passwordForm.register('currentPassword', { required: 'Current password is required.' })} className="field-input w-full" />
                  {passwordForm.formState.errors.currentPassword ? (
                    <p className="text-sm text-rose-300">{String(passwordForm.formState.errors.currentPassword?.message)}</p>
                  ) : null}
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-medium text-slate-200">New password</span>
                  <input type="password" {...passwordForm.register('newPassword', { required: 'New password is required.', minLength: { value: 8, message: 'Password must be at least 8 characters long.' } })} className="field-input w-full" />
                  {passwordForm.formState.errors.newPassword ? (
                    <p className="text-sm text-rose-300">{String(passwordForm.formState.errors.newPassword?.message)}</p>
                  ) : null}
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-medium text-slate-200">Confirm password</span>
                  <input type="password" {...passwordForm.register('confirmPassword', {
                    required: 'Please confirm your new password.',
                    validate: (value) => value === passwordForm.watch('newPassword') || 'Passwords must match.',
                  })} className="field-input w-full" />
                  {passwordForm.formState.errors.confirmPassword ? (
                    <p className="text-sm text-rose-300">{String(passwordForm.formState.errors.confirmPassword?.message)}</p>
                  ) : null}
                </label>
              </div>
              <div className="flex justify-end">
                <PrimaryButton type="submit" disabled={passwordSaving} className="justify-center">
                  {passwordSaving ? 'Updating password...' : 'Change password'}
                </PrimaryButton>
              </div>
            </form>
          </Panel>
        </div>
      </div>
    </section>
  )
}

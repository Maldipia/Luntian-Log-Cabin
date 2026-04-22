'use client'
export const dynamic = 'force-dynamic'
import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'

export default function PaymentsPage() {
  const [currentUrl, setCurrentUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [recordId, setRecordId] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  // Load the active payment QR on mount
  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from('payment_settings')
        .select('id, qr_image_url')
        .eq('is_active', true)
        .order('sort_order')
        .limit(1)
        .single()

      if (!error && data) {
        setCurrentUrl(data.qr_image_url || null)
        setRecordId(data.id)
      }
    }
    load()
  }, [])

  async function handleUpload(file: File) {
    if (!recordId) { setError('No active payment record found. Contact support.'); return }
    setError('')
    setUploading(true)

    // Upload to Supabase storage
    const ext = file.name.split('.').pop()
    const path = `qr-${recordId}-${Date.now()}.${ext}`
    const { data: uploadData, error: uploadErr } = await supabase.storage
      .from('payment-qr')
      .upload(path, file, { upsert: true })

    if (uploadErr || !uploadData) {
      setError('Upload failed: ' + (uploadErr?.message || 'unknown error'))
      setUploading(false)
      return
    }

    // Get public URL
    const { data: urlData } = supabase.storage.from('payment-qr').getPublicUrl(uploadData.path)
    const publicUrl = urlData.publicUrl

    // Auto-save URL to database immediately
    const { error: dbErr } = await supabase
      .from('payment_settings')
      .update({ qr_image_url: publicUrl, qr_url: publicUrl })
      .eq('id', recordId)

    if (dbErr) {
      setError('Saved to storage but DB update failed: ' + dbErr.message)
      setUploading(false)
      return
    }

    // Log it
    await supabase.from('system_logs').insert([{
      action: 'UPDATE_PAYMENT_QR',
      module: 'Payments',
      description: 'Payment QR image replaced',
    }])

    setCurrentUrl(publicUrl)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
    setUploading(false)
  }

  return (
    <div className="max-w-xl">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Payment QR Code</h1>
        <p className="text-sm text-gray-400 mt-1">
          This image is shown full-width to guests at checkout. Upload your GCash, Maya, or InstaPay QR.
        </p>
      </div>

      {/* Current QR preview */}
      <div className="rounded-2xl border border-gray-200 overflow-hidden bg-gray-50 mb-5">
        {currentUrl ? (
          <img
            src={currentUrl}
            alt="Current Payment QR"
            className="w-full object-contain"
            style={{ maxHeight: 480, display: 'block' }}
          />
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-gray-300">
            <span className="text-5xl mb-3">📲</span>
            <span className="text-sm font-medium">No QR uploaded yet</span>
          </div>
        )}

        {/* Status bar */}
        <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between bg-white">
          <span className="text-sm text-gray-500">
            {currentUrl ? '✅ Active — shown at checkout' : '⚠️ No QR uploaded'}
          </span>
          {saved && (
            <span className="text-xs font-bold text-green-600 animate-pulse">Saved!</span>
          )}
        </div>
      </div>

      {/* Upload button */}
      <label
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: 10, width: '100%', padding: '14px 0', borderRadius: 14,
          background: uploading ? '#9ca3af' : 'linear-gradient(135deg,#2d6a4f,#40916c)',
          color: 'white', fontWeight: 700, fontSize: '0.95rem',
          cursor: uploading ? 'wait' : 'pointer', border: 'none',
        }}
      >
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={e => {
            const file = e.target.files?.[0]
            if (file) handleUpload(file)
            e.target.value = ''
          }}
          disabled={uploading}
        />
        {uploading ? (
          <>
            <span className="animate-spin">⏳</span> Uploading & Saving…
          </>
        ) : (
          <>📤 {currentUrl ? 'Replace QR Image' : 'Upload QR Image'}</>
        )}
      </label>

      <p className="text-xs text-gray-400 text-center mt-3">
        JPG, PNG, or WebP · Max 5MB · Saves automatically after upload
      </p>

      {error && (
        <div className="mt-4 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
          ⚠️ {error}
        </div>
      )}
    </div>
  )
}

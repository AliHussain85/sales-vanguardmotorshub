import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import flatpickr from 'flatpickr'
import html2canvas from 'html2canvas'
import { Download, Filter, Image as ImageIcon, Loader2 } from 'lucide-react'
import 'flatpickr/dist/flatpickr.min.css'
import { supabaseData } from '../lib/supabase'
import { getCountryFromPhone } from '../lib/countryPrefixes'
import {
  formatDateHeader,
  formatShortDate,
  formatTimeUae,
  getDubaiToday,
  getInquiryDatePart,
} from '../lib/dubai'
import { parseBookings, type Booking, type WatiContact } from '../lib/types'

function stageBadgeClass(stage?: string): string {
  if (!stage) return 'bg-neutral-100 text-neutral-600'
  const key = stage.toLowerCase().replace(/\s+/g, '-')
  const map: Record<string, string> = {
    booked: 'bg-green-100 text-green-800',
    hot: 'bg-yellow-100 text-yellow-800',
    cold: 'bg-blue-100 text-blue-800',
    lost: 'bg-red-100 text-red-800',
    'follow-up': 'bg-purple-100 text-purple-800',
  }
  return map[key] ?? 'bg-neutral-100 text-neutral-600'
}

function filterLeadsByRange(allLeads: WatiContact[], from: string, to: string) {
  return allLeads.filter((lead) => {
    const bookings = parseBookings(lead.bookings)
    return bookings.some((booking) => {
      const datePart = getInquiryDatePart(booking.inquiry_start_date)
      if (!datePart) return false
      return datePart >= from && datePart <= to
    })
  })
}

function BookingCard({ booking }: { booking: Booking }) {
  return (
    <div className="mb-2 grid gap-3 rounded-xl border border-neutral-200 bg-white p-4 last:mb-0 sm:grid-cols-2 lg:grid-cols-4">
      <div className="col-span-full flex items-center justify-between border-b border-neutral-100 pb-3">
        <span className="text-sm font-extrabold text-neutral-900">
          {booking.car_name || '—'} {booking.car_model || ''}
        </span>
        <span className="rounded-md border border-neutral-200 bg-neutral-50 px-2 py-1 text-[11px] font-semibold text-neutral-500">
          {booking.fleet_name || '—'}
        </span>
      </div>
      <Field label="Revenue" value={`AED ${(booking.revenue || 0).toLocaleString()}`} accent />
      <Field
        label="Plate"
        value={
          <span className="rounded border border-neutral-200 bg-neutral-50 px-2 py-0.5 font-mono text-xs font-bold">
            {booking.car_plate || '—'}
          </span>
        }
      />
      <Field label="Days" value={String(booking.booking_days ?? '—')} />
      <Field label="Booking Start" value={formatShortDate(booking.booking_start_date)} />
      <Field label="Booking End" value={formatShortDate(booking.booking_end_date)} />
      <Field label="Inq. Start" value={formatShortDate(booking.inquiry_start_date)} />
      <Field label="Inq. End" value={formatShortDate(booking.inquiry_end_date)} />
      <Field label="Notes" value={booking.external_notes || '—'} className="col-span-full" />
    </div>
  )
}

function Field({
  label,
  value,
  accent,
  className = '',
}: {
  label: string
  value: ReactNode
  accent?: boolean
  className?: string
}) {
  return (
    <div className={className}>
      <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-neutral-400">{label}</p>
      <p className={`text-sm ${accent ? 'font-bold text-green-600' : 'font-medium text-neutral-700'}`}>
        {value}
      </p>
    </div>
  )
}

export function DailyReportPage() {
  const reportRef = useRef<HTMLDivElement>(null)
  const fromRef = useRef<HTMLInputElement>(null)
  const toRef = useRef<HTMLInputElement>(null)
  const fpFromRef = useRef<flatpickr.Instance | null>(null)
  const fpToRef = useRef<flatpickr.Instance | null>(null)

  const [dateFrom, setDateFrom] = useState(() => getDubaiToday())
  const [dateTo, setDateTo] = useState(() => getDubaiToday())
  const [reportTitle, setReportTitle] = useState(() =>
    formatDateHeader(getDubaiToday(), getDubaiToday()),
  )
  const [allLeads, setAllLeads] = useState<WatiContact[]>([])
  const [leads, setLeads] = useState<WatiContact[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [openBookings, setOpenBookings] = useState<Set<string>>(new Set())
  const [capturing, setCapturing] = useState(false)

  const applyRange = useCallback((from: string, to: string, source: WatiContact[]) => {
    setDateFrom(from)
    setDateTo(to)
    setReportTitle(formatDateHeader(from, to))
    setOpenBookings(new Set())
    setLeads(filterLeadsByRange(source, from, to))
  }, [])

  const getPickerRange = useCallback(() => {
    const from = fpFromRef.current?.input.value || fromRef.current?.value || dateFrom
    const to = fpToRef.current?.input.value || toRef.current?.value || dateTo
    return { from, to }
  }, [dateFrom, dateTo])

  const loadAllLeads = useCallback(async (from: string, to: string) => {
    setLoading(true)
    setError(null)

    const { data, error: fetchError } = await supabaseData
      .from('wati_contacts')
      .select('*')
      .order('created_at', { ascending: true })

    if (fetchError) {
      setAllLeads([])
      setLeads([])
      setError(fetchError.message)
      setLoading(false)
      return
    }

    const contacts = (data as WatiContact[]) || []
    setAllLeads(contacts)
    applyRange(from, to, contacts)
    setLoading(false)
  }, [applyRange])

  useEffect(() => {
    if (!fromRef.current || !toRef.current) return

    const initialToday = getDubaiToday()

    fpFromRef.current = flatpickr(fromRef.current, {
      dateFormat: 'Y-m-d',
      defaultDate: initialToday,
      disableMobile: true,
      onChange: (_dates, dateStr) => {
        setDateFrom(dateStr)
        if (fpToRef.current && dateStr > (fpToRef.current.input.value || '')) {
          fpToRef.current.setDate(dateStr, true)
          setDateTo(dateStr)
        }
      },
    })

    fpToRef.current = flatpickr(toRef.current, {
      dateFormat: 'Y-m-d',
      defaultDate: initialToday,
      disableMobile: true,
      onChange: (_dates, dateStr) => {
        setDateTo(dateStr)
        if (fpFromRef.current && dateStr < (fpFromRef.current.input.value || '')) {
          fpFromRef.current.setDate(dateStr, true)
          setDateFrom(dateStr)
        }
      },
    })

    loadAllLeads(initialToday, initialToday)

    return () => {
      fpFromRef.current?.destroy()
      fpToRef.current?.destroy()
      fpFromRef.current = null
      fpToRef.current = null
    }
  }, [loadAllLeads])

  function applyFilter() {
    const { from, to } = getPickerRange()
    if (!from || !to) {
      alert('Please select both From and To dates.')
      return
    }
    applyRange(from, to, allLeads)
  }

  function setToday() {
    const t = getDubaiToday()
    fpFromRef.current?.setDate(t, true)
    fpToRef.current?.setDate(t, true)
    applyRange(t, t, allLeads)
  }

  function toggleBookings(rowId: string) {
    setOpenBookings((prev) => {
      const next = new Set(prev)
      if (next.has(rowId)) next.delete(rowId)
      else next.add(rowId)
      return next
    })
  }

  function downloadCsv() {
    if (leads.length === 0) {
      alert('No data to export.')
      return
    }

    const filename =
      dateFrom === dateTo
        ? `vanguard-motors-report-${dateFrom}.csv`
        : `vanguard-motors-report-${dateFrom}_to_${dateTo}.csv`

    const headers = ['S.No.', 'Name', 'Country', 'Ph. Number', 'Time', 'Status', 'Stage', 'Type', 'Value', 'Remarks']
    const rows = leads.map((lead, idx) => {
      const country = getCountryFromPhone(lead.phone)
      const time = formatTimeUae(lead.created_at)
      const name = [lead.first_name, lead.last_name].filter(Boolean).join(' ') || ''
      const value = lead.lead_value ? `AED ${Number(lead.lead_value).toLocaleString()}` : ''
      const remarks = (lead.lead_notes_report || '').replace(/"/g, '""')
      return [
        idx + 1,
        name,
        country,
        lead.phone || '',
        time,
        lead.lead_icon || '',
        lead.lead_stage || '',
        lead.lead_source || '',
        value,
        `"${remarks}"`,
      ].join(',')
    })

    const blob = new Blob(['\uFEFF' + [headers.join(','), ...rows].join('\n')], {
      type: 'text/csv;charset=utf-8;',
    })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = filename
    anchor.click()
    URL.revokeObjectURL(url)
  }

  async function downloadImage() {
    if (!reportRef.current) return
    setCapturing(true)

    const filename =
      dateFrom === dateTo
        ? `vanguard-motors-report-${dateFrom}.png`
        : `vanguard-motors-report-${dateFrom}_to_${dateTo}.png`

    try {
      const canvas = await html2canvas(reportRef.current, {
        backgroundColor: '#f5f5f5',
        scale: 2,
        useCORS: true,
        logging: false,
      })
      const anchor = document.createElement('a')
      anchor.href = canvas.toDataURL('image/png')
      anchor.download = filename
      anchor.click()
    } catch {
      alert('Failed to capture image.')
    } finally {
      setCapturing(false)
    }
  }

  return (
    <div className="flex-1 overflow-y-auto bg-neutral-100 p-4 lg:p-6">
      <div ref={reportRef} className="mx-auto max-w-[1500px]">
        <div className="rounded-t-xl bg-neutral-900 px-6 py-5 text-center">
          <h1 className="text-lg font-black uppercase tracking-wide text-white sm:text-2xl">
            🚘 Vanguard Motors Hub — Daily Inquiry Report 🚘
          </h1>
          <p className="mt-1 text-sm font-semibold text-neutral-400">{reportTitle}</p>
        </div>

        <div
          className={[
            'flex flex-wrap items-center justify-between gap-3 border border-neutral-200 bg-white px-4 py-3 sm:px-6',
            capturing ? 'hidden' : '',
          ].join(' ')}
        >
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-[11px] font-extrabold uppercase tracking-wide text-neutral-500">
              Filter by Date
            </span>
            <div className="flex overflow-hidden rounded-lg border border-neutral-300 bg-white">
              <label className="flex flex-col border-r border-neutral-200 px-3 py-2">
                <span className="text-[9px] font-extrabold uppercase tracking-wider text-neutral-400">
                  From
                </span>
                <input ref={fromRef} type="text" readOnly placeholder="Select date" className="cursor-pointer border-0 bg-transparent text-sm font-semibold text-neutral-900 outline-none" />
              </label>
              <label className="flex flex-col px-3 py-2">
                <span className="text-[9px] font-extrabold uppercase tracking-wider text-neutral-400">
                  To
                </span>
                <input ref={toRef} type="text" readOnly placeholder="Select date" className="cursor-pointer border-0 bg-transparent text-sm font-semibold text-neutral-900 outline-none" />
              </label>
            </div>
            <button
              type="button"
              onClick={setToday}
              className="rounded-lg border border-neutral-300 bg-neutral-50 px-3 py-2 text-xs font-bold uppercase tracking-wide text-neutral-600 transition hover:bg-neutral-100"
            >
              Today
            </button>
            <button
              type="button"
              onClick={applyFilter}
              className="inline-flex items-center gap-1.5 rounded-lg bg-neutral-900 px-4 py-2 text-xs font-bold uppercase tracking-wide text-white transition hover:bg-neutral-700"
            >
              <Filter className="h-3.5 w-3.5" />
              Apply Filter
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={downloadCsv}
              className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-300 bg-neutral-50 px-3 py-2 text-xs font-bold uppercase tracking-wide text-neutral-800 transition hover:bg-neutral-900 hover:text-white"
            >
              <Download className="h-3.5 w-3.5" />
              CSV
            </button>
            <button
              type="button"
              onClick={downloadImage}
              disabled={capturing}
              className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-300 bg-neutral-50 px-3 py-2 text-xs font-bold uppercase tracking-wide text-neutral-800 transition hover:bg-neutral-900 hover:text-white disabled:opacity-50"
            >
              {capturing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ImageIcon className="h-3.5 w-3.5" />}
              Image
            </button>
          </div>
        </div>

        <div className="overflow-x-auto rounded-b-xl border border-t-0 border-neutral-200 bg-white">
          <table className="min-w-[1100px] w-full border-collapse">
            <thead>
              <tr className="bg-neutral-900 text-left text-[11px] font-extrabold uppercase tracking-wider text-white">
                <th className="w-14 px-4 py-3 text-center">S.No.</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Country</th>
                <th className="px-4 py-3">Ph. Number</th>
                <th className="px-4 py-3">Time</th>
                <th className="w-16 px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3">Stage</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Value</th>
                <th className="min-w-[200px] px-4 py-3">Remarks</th>
                <th className="px-4 py-3">Bookings</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={11} className="px-4 py-16 text-center text-neutral-500">
                    <Loader2 className="mx-auto mb-3 h-7 w-7 animate-spin text-neutral-900" />
                    Loading leads…
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={11} className="px-4 py-16 text-center text-red-500">
                    Error loading data: {error}
                  </td>
                </tr>
              ) : leads.length === 0 ? (
                <tr>
                  <td colSpan={11} className="px-4 py-16 text-center text-neutral-400">
                    No leads found for this date range.
                  </td>
                </tr>
              ) : (
                leads.flatMap((lead, idx) => {
                  const bookings = parseBookings(lead.bookings)
                  const rowId = `row-${lead.id ?? idx}`
                  const name = [lead.first_name, lead.last_name].filter(Boolean).join(' ') || '—'
                  const country = getCountryFromPhone(lead.phone)
                  const value = lead.lead_value
                    ? `AED ${Number(lead.lead_value).toLocaleString()}`
                    : '—'

                  const mainRow = (
                    <tr key={rowId} className="border-b border-neutral-100 transition hover:bg-neutral-50">
                      <td className="px-4 py-3 text-center text-sm font-bold text-neutral-400">
                        {idx + 1}
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-neutral-900">{name}</td>
                      <td className="px-4 py-3 text-sm font-semibold">{country}</td>
                      <td className="px-4 py-3 text-sm font-semibold text-neutral-900">
                        {lead.phone || '—'}
                      </td>
                      <td className="px-4 py-3 text-sm">{formatTimeUae(lead.created_at)}</td>
                      <td className="px-4 py-3 text-center text-xl">{lead.lead_icon || '—'}</td>
                      <td className="px-4 py-3 text-sm">
                        {lead.lead_stage ? (
                          <span
                            className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide ${stageBadgeClass(lead.lead_stage)}`}
                          >
                            {lead.lead_stage}
                          </span>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm">{lead.lead_source || '—'}</td>
                      <td className="px-4 py-3 text-sm font-bold text-green-600">{value}</td>
                      <td className="max-w-[280px] px-4 py-3 text-sm text-neutral-600">
                        {lead.lead_notes_report || ''}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {bookings.length > 0 ? (
                          <button
                            type="button"
                            onClick={() => toggleBookings(rowId)}
                            className="rounded-md border border-neutral-300 bg-neutral-50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-neutral-800 transition hover:bg-neutral-900 hover:text-white"
                          >
                            View {bookings.length} Booking{bookings.length > 1 ? 's' : ''}
                          </button>
                        ) : (
                          '—'
                        )}
                      </td>
                    </tr>
                  )

                  const bookingsRow =
                    bookings.length > 0 ? (
                      <tr key={`${rowId}-bookings`} className="border-b border-neutral-100 bg-neutral-50">
                        <td colSpan={11} className="px-4 py-0">
                          <div
                            className={[
                              'overflow-hidden transition-all duration-300',
                              openBookings.has(rowId) ? 'max-h-[800px] py-3' : 'max-h-0',
                            ].join(' ')}
                          >
                            {bookings.map((booking, bookingIdx) => (
                              <BookingCard key={`${rowId}-${bookingIdx}`} booking={booking} />
                            ))}
                          </div>
                        </td>
                      </tr>
                    ) : null

                  return bookingsRow ? [mainRow, bookingsRow] : [mainRow]
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

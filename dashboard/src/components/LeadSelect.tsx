import Select, {
  type GroupBase,
  type OptionProps,
  type SingleValue,
  type StylesConfig,
} from 'react-select'
import { CheckCircle2 } from 'lucide-react'
import { formatDubaiDateTime } from '../lib/dubai'
import { isLeadSaved, parseLeadValue, type WhatsAppLead } from '../lib/types'

export type LeadOption = {
  value: string
  label: string
  lead: WhatsAppLead
  saved: boolean
  searchText: string
}

function buildSearchText(lead: WhatsAppLead): string {
  return [
    lead.id,
    lead.inquiry_time,
    lead.gclid,
    lead.utm_source,
    lead.utm_campaign,
    lead.country,
    lead.country_code,
    lead.city,
    lead.region,
    lead.vipcode,
    lead.whatsapp_number,
    lead.lead_value,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
}

export function buildLeadOptions(leads: WhatsAppLead[]): LeadOption[] {
  return leads.map((lead) => {
    const id = String(lead.id)
    const saved = isLeadSaved(lead)
    const place = lead.city ? `${lead.city}, ${lead.country}` : lead.country
    const gclidTag = lead.gclid ? 'GCLID ✓' : 'No GCLID'
    const vipTag = lead.vipcode ? lead.vipcode : 'No VIP'
    const prefix = saved ? '✓ Saved · ' : ''
    return {
      value: id,
      label: `${prefix}${vipTag} · ${gclidTag} — ${formatDubaiDateTime(lead.inquiry_time)} · ${place}`,
      lead,
      saved,
      searchText: buildSearchText(lead),
    }
  })
}

function optionBackground(saved: boolean, isSelected: boolean, isFocused: boolean): string {
  if (saved) {
    if (isSelected) return 'bg-green-100'
    if (isFocused) return 'bg-green-100'
    return 'bg-green-50'
  }
  if (isSelected) return 'bg-neutral-100'
  if (isFocused) return 'bg-neutral-50'
  return 'bg-white'
}

function VipBadge({ code }: { code?: string | null }) {
  if (code) {
    return (
      <span className="inline-flex items-center rounded-md bg-amber-400 px-2 py-0.5 text-[11px] font-extrabold tracking-wide text-amber-950 shadow-sm ring-1 ring-amber-500/40">
        {code}
      </span>
    )
  }
  return (
    <span className="inline-flex items-center rounded-md bg-neutral-200/80 px-2 py-0.5 text-[11px] font-bold tracking-wide text-neutral-500">
      No VIP
    </span>
  )
}

function GclidBadge({ gclid }: { gclid?: string | null }) {
  if (gclid) {
    return (
      <span className="inline-flex items-center rounded-md bg-neutral-900 px-2 py-0.5 text-[11px] font-extrabold tracking-wide text-white shadow-sm ring-1 ring-neutral-700/40">
        GCLID ✓
      </span>
    )
  }
  return (
    <span className="inline-flex items-center rounded-md bg-neutral-200/80 px-2 py-0.5 text-[11px] font-bold tracking-wide text-neutral-500">
      No GCLID
    </span>
  )
}

function LeadOptionRow(props: OptionProps<LeadOption, false, GroupBase<LeadOption>>) {
  const { data, innerProps, innerRef, isFocused, isSelected } = props
  const place = data.lead.city ? `${data.lead.city}, ${data.lead.country}` : data.lead.country
  const amount = parseLeadValue(data.lead.lead_value)
  const phone = data.lead.whatsapp_number?.trim()

  return (
    <div
      ref={innerRef}
      {...innerProps}
      className={[
        'cursor-pointer border-b border-neutral-100 px-3 py-3 last:border-b-0',
        optionBackground(data.saved, isSelected, isFocused),
        data.saved ? 'border-l-4 border-l-green-400' : 'border-l-4 border-l-transparent',
      ].join(' ')}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <VipBadge code={data.lead.vipcode} />
            <GclidBadge gclid={data.lead.gclid} />
          </div>
          <p className="mt-1.5 text-xs text-neutral-500">
            {formatDubaiDateTime(data.lead.inquiry_time)} · {place} · {data.lead.country_code || '—'}
          </p>
          {data.saved && phone && amount !== null && (
            <p className="mt-1.5 text-xs font-semibold text-green-800">
              Saved · {phone} · AED {amount.toLocaleString()}
            </p>
          )}
        </div>
        {data.saved && (
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-green-200/80 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-green-900">
            <CheckCircle2 className="h-3 w-3" />
            Saved
          </span>
        )}
      </div>
    </div>
  )
}

const selectStyles: StylesConfig<LeadOption, false> = {
  control: (base, state) => ({
    ...base,
    minHeight: 48,
    borderRadius: 12,
    borderColor: state.isFocused ? 'rgba(212, 175, 55, 0.5)' : '#e5e7eb',
    boxShadow: state.isFocused ? '0 0 0 3px rgba(212, 175, 55, 0.2)' : 'none',
    '&:hover': { borderColor: state.isFocused ? 'rgba(212, 175, 55, 0.5)' : '#d1d5db' },
    backgroundColor: '#fff',
    cursor: 'pointer',
  }),
  valueContainer: (base) => ({ ...base, padding: '4px 12px' }),
  placeholder: (base) => ({ ...base, color: '#9ca3af', fontSize: 14 }),
  singleValue: (base) => ({ ...base, color: '#171717', fontSize: 14, fontWeight: 500 }),
  input: (base) => ({ ...base, color: '#171717', fontSize: 14 }),
  menu: (base) => ({
    ...base,
    borderRadius: 12,
    overflow: 'hidden',
    border: '1px solid #e5e7eb',
    boxShadow: '0 16px 40px rgba(0,0,0,0.12)',
    zIndex: 50,
  }),
  menuList: (base) => ({ ...base, padding: 0, maxHeight: 320 }),
  option: () => ({ padding: 0 }),
  indicatorSeparator: () => ({ display: 'none' }),
  dropdownIndicator: (base) => ({ ...base, color: '#6b7280', paddingRight: 12 }),
  clearIndicator: (base) => ({ ...base, color: '#6b7280' }),
  noOptionsMessage: (base) => ({ ...base, fontSize: 14, color: '#6b7280', padding: 16 }),
  loadingMessage: (base) => ({ ...base, fontSize: 14, color: '#6b7280', padding: 16 }),
}

type LeadSelectProps = {
  options: LeadOption[]
  value: string
  onChange: (leadId: string) => void
  loading?: boolean
  disabled?: boolean
  placeholder?: string
}

export function LeadSelect({
  options,
  value,
  onChange,
  loading = false,
  disabled = false,
  placeholder = 'Search leads by date, city, country, VIP code, GCLID…',
}: LeadSelectProps) {
  const selected = options.find((opt) => opt.value === value) ?? null

  function handleChange(next: SingleValue<LeadOption>) {
    onChange(next?.value ?? '')
  }

  return (
    <Select<LeadOption, false>
      instanceId="close-deal-lead-select"
      options={options}
      value={selected}
      onChange={handleChange}
      isSearchable
      isClearable
      isLoading={loading}
      isDisabled={disabled || loading}
      placeholder={loading ? 'Loading leads…' : placeholder}
      noOptionsMessage={() => 'No leads match your search'}
      filterOption={(option, input) => {
        if (!input) return true
        const q = input.toLowerCase()
        return (
          option.label.toLowerCase().includes(q) ||
          option.data.searchText.includes(q)
        )
      }}
      components={{ Option: LeadOptionRow }}
      styles={selectStyles}
      maxMenuHeight={320}
    />
  )
}

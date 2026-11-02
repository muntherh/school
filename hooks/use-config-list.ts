'use client'
import { useEffect, useState } from 'react'

/** Reads a school-configured list (Settings) so forms follow the approved values (FR-AUD-03). */
export function useConfigList(key: 'INCIDENT_CATEGORIES' | 'ACTION_TYPES' | 'INTERVENTION_TYPES') {
  const [items, setItems] = useState<string[]>([])
  useEffect(() => {
    fetch(`/api/configuration/${key}`)
      .then((r) => r.json())
      .then((r) => { if (r.success && Array.isArray(r.data?.value)) setItems(r.data.value) })
      .catch(() => {})
  }, [key])
  return items
}

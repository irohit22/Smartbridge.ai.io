/**
 * Date formatting utilities for SMART BRIDGE
 * Safely handles missing, legacy, and malformed dates without throwing errors.
 */

export function formatNoteDate(dateStr?: string | null): string {
  if (!dateStr || typeof dateStr !== 'string') {
    return 'Legacy Note';
  }

  const trimmed = dateStr.trim();
  if (!trimmed || trimmed.toLowerCase() === 'invalid date') {
    return 'Legacy Note';
  }

  // Preserve recognized human labels
  if (trimmed === 'Sample Note' || trimmed === 'Legacy Note') {
    return trimmed;
  }

  // Check if string can be parsed as a valid date
  const parsedMs = Date.parse(trimmed);
  if (isNaN(parsedMs)) {
    // Non-ISO string (e.g., custom format "22:45, 28 Oct")
    return trimmed;
  }

  try {
    const d = new Date(parsedMs);
    // Double check year is sane
    if (isNaN(d.getTime())) {
      return trimmed;
    }
    return `${d.toLocaleDateString([], {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })} at ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  } catch {
    return trimmed;
  }
}

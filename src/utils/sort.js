export function sortMissions(missions, sortBy) {
  return [...missions].sort((a, b) => {
    if (sortBy === 'newest') return dateValue(b.launch_date) - dateValue(a.launch_date);
    if (sortBy === 'oldest') return dateValue(a.launch_date) - dateValue(b.launch_date);
    return String(a.name ?? '').localeCompare(String(b.name ?? ''));
  });
}
function dateValue(value) {
  return value ? new Date(value).getTime() : 0;
}

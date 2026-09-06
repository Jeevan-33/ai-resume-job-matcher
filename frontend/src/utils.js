/** Two-letter monogram for the avatar: initials when we know a name,
 *  otherwise the first characters of the email handle. */
export function initialsFor(user) {
  if (!user) return '?';
  const source = user.full_name?.trim() || user.email || '';
  const parts = source.split(/[\s@._-]+/).filter(Boolean);
  if (!parts.length) return '?';
  const letters = parts.length > 1 ? parts[0][0] + parts[1][0] : parts[0].slice(0, 2);
  return letters.toUpperCase();
}

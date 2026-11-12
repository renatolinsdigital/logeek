/** Joins the truthy class names with a space: `classNames('a', isOn && 'b')`. */
export function classNames(...classNameParts: Array<string | false | null | undefined>): string {
  return classNameParts.filter(Boolean).join(' ');
}

const escapeRegExp = (string: string): string => {
  // any characters that match following symbols
  //  . * + ? ^ $ { } ( ) | [ ] \
  // will be replaced with \\

  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') // $& means the whole matched string
}

export default escapeRegExp

const createTwoInitials = (name: string): string => {
  const cleanedName = name.trim().replace(/\s+/g, ' ');
  
  const nameParts = cleanedName.split(' ');
  
  let initials = nameParts.filter(Boolean).slice(0, 2).map(part => part[0].toUpperCase()).join('');
  
  while (initials.length < 2) {
  initials += ''; 
  }
  
  return initials;
  };
  
export default createTwoInitials;

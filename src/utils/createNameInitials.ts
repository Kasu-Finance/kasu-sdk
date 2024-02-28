const createNameInitials = (name: string): string => 
  name.split(' ').reduce((initials, namePart) => initials += namePart[0] || '', '').toUpperCase();

export default createNameInitials;

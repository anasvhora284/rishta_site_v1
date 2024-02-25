export function calculateAge(dateString) {
  // Convert unformatted date to a standardized format (dd-mm-yyyy)
  const formattedDate = convertToDateObject(dateString);

  // Get current date
  const currentDate = new Date();

  // Calculate age
  let age = currentDate.getFullYear() - formattedDate.getFullYear();

  // Check if birthday has occurred for the current year
  if (
    currentDate.getMonth() < formattedDate.getMonth() ||
    (currentDate.getMonth() === formattedDate.getMonth() &&
      currentDate.getDate() < formattedDate.getDate())
  ) {
    age--;
  }

  return age;
}

export function convertToDateObject(unformattedDate) {
  // Replace both '-' and '/' with a consistent separator, e.g., '-'
  const standardizedDateStr = unformattedDate.replace(/[/]/g, "-");

  // Split the standardized date string into day, month, and year
  const dateComponents = standardizedDateStr.split("-");

  // Ensure each component is parsed as an integer
  const day = parseInt(dateComponents[0], 10);
  const month = parseInt(dateComponents[1], 10) - 1; // Months are 0-based in JavaScript Date
  const year = parseInt(dateComponents[2], 10);

  // Create a Date object from the parsed components
  const formattedDate = new Date(year, month, day);

  return formattedDate;
}

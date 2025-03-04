export function randomPass(length: number, char: string) {
  var result = "";
  var characters =
    char ||
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()";
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

export function onlyUnique(value, index, array) {
  return array.indexOf(value) === index;
}

// Function to remove duplicates based on a property (e.g., id)
export function removeDuplicates(array, key) {
  return array.filter(
    (item, index, self) => index === self.findIndex((t) => t[key] === item[key])
  );
}

export const getCurrentMillisecondsFromDate = (date): number => {
  return new Date(date).getTime();
};

export function compareArraysByName(array1, array2) {
  // Extract names from each array
  const names1 = array1.map((obj) => obj.name);
  const names2 = array2.map((obj) => obj.name);

  // Use Sets to store unique names
  const uniqueNamesSet = new Set([...names1, ...names2]);

  // Use an array to store common names
  const commonNames = names1.filter((name) => names2.includes(name));

  // Use filter to get unique objects based on the name property
  const uniqueArray =
    uniqueNamesSet.size > 0
      ? Array.from(uniqueNamesSet).map(
          (name) =>
            array1.find((obj) => obj.name === name) ||
            array2.find((obj) => obj.name === name)
        )
      : [];

  return { unique: uniqueArray, common: commonNames };
}

export function adjustDatesToStartAndEndOfDay(startDate, endDate) {
  // Parse the input dates to Date objects
  const start = new Date(startDate);
  const end = new Date(endDate);

  // Set start of the day for startDate
  start.setHours(0, 0, 0, 0); // 00:00:00.000

  // Set end of the day for endDate
  end.setHours(23, 59, 59, 999);

  return {
    startOfDay: start.toISOString(), // ISO 8601 formatted start of the day
    endOfDay: end.toISOString(), // ISO 8601 formatted end of the day
  };
}

export function calculateTimeDifference(timeStr2, timeStr1) {
  // Parse the time strings into Date objects
  const time1: any = new Date(timeStr1);
  const time2: any = new Date(timeStr2);

  // Calculate the time difference in milliseconds
  const timeDifference = time2 - time1;

  // Convert the time difference to various units
  const diffInMilliseconds = timeDifference;
  const diffInSeconds = timeDifference / 1000;
  const diffInMinutes = diffInSeconds / 60;
  const diffInHours = diffInMinutes / 60;

  return {
    milliseconds: diffInMilliseconds,
    seconds: diffInSeconds,
    minutes: diffInMinutes,
    hours: diffInHours,
  };
}

export function formatDateToDMY(isoString) {
  const date = new Date(isoString);

  // Get individual components of the date
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-indexed
  const year = date.getFullYear();

  // Format the date string
  return `${day}/${month}/${year}`;
}

export function doesStringExist(searchString, array) {
  if (!array) {
    return false;
  }
  for (let item of array) {
    if (item.toLowerCase() === searchString.toLowerCase()) {
      return true;
    }
  }
  return false;
}

export const fixDateIfShorter = (date) => {
  const newDate = new Date(date);
  newDate.setDate(newDate.getDate() + 1);
  return newDate.toISOString();
};

// Function to sort an array based on dateCreated field
export const sortByDateCreated = (array: any[]) => {
  return array.sort((a, b) => {
    const dateA = new Date(a.dateCreated).getTime();
    const dateB = new Date(b.dateCreated).getTime();
    return dateA - dateB;
  });
};

// program to convert first letter of a string to uppercase
export function capitalizeFirstLetter(str: string) {
  // converting first letter to uppercase
  const capitalized = str.charAt(0).toUpperCase() + str.slice(1);

  return capitalized;
}

export function capitalizeFirst(str) {
  if (str.length === 0) {
    return str; // Return the original string if it's empty
  }
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export function getFormattedDate(date: any) {
  return new Date(date).toLocaleDateString("en-US");
}

export function getFormattedDateWithTimeStamp(date: any) {
  const d = new Date(date);
  const dateString = d.toLocaleDateString("en-US");
  const timeString = d.toLocaleTimeString("en-US");
  return `${dateString} ${timeString}`;
}

export function generateRandomPassword(length = 12) {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+[]{}|;:',.<>?";
  let password = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    password += chars[randomIndex];
  }

  return password;
}

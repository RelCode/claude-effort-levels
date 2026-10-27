// Reference implementation of the ground-truth spec in the root README.
// Used to prove scorecard/cases.json is correct (it must score 100%).
// It is NOT part of any variant's context; never copy it into an id-validator-* run.

const CITIZENSHIP = { 0: 'citizen', 1: 'permanent_resident', 2: 'refugee' };

export function validate(id, today = new Date()) {
  if (typeof id !== 'string' || !/^[0-9]{13}$/.test(id)) {
    return { valid: false, errors: ['must be exactly 13 digits (0-9), no spaces or separators'] };
  }

  const errors = [];
  const yy = Number(id.slice(0, 2));
  const mm = Number(id.slice(2, 4));
  const dd = Number(id.slice(4, 6));

  // Century: the 2000s unless that would put the birth date after today.
  const todayKey = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
  const year = (2000 + yy) * 10000 + mm * 100 + dd > todayKey ? 1900 + yy : 2000 + yy;

  if (!isRealDate(year, mm, dd)) errors.push('date of birth is not a real calendar date');

  const citizenshipDigit = Number(id[10]);
  if (!(citizenshipDigit in CITIZENSHIP)) errors.push('citizenship digit must be 0, 1 or 2');

  if (!passesLuhn(id)) errors.push('check digit does not match (Luhn)');

  if (errors.length) return { valid: false, errors };

  return {
    valid: true,
    errors: [],
    dateOfBirth: `${year}-${pad(mm)}-${pad(dd)}`,
    gender: Number(id.slice(6, 10)) < 5000 ? 'female' : 'male',
    citizenship: CITIZENSHIP[citizenshipDigit],
  };
}

function isRealDate(year, month, day) {
  if (month < 1 || month > 12 || day < 1) return false;
  const leap = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  const daysInMonth = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month - 1];
  return day <= daysInMonth;
}

function passesLuhn(digits) {
  let sum = 0;
  for (let i = 0; i < digits.length; i++) {
    let d = Number(digits[digits.length - 1 - i]);
    if (i % 2 === 1) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
  }
  return sum % 10 === 0;
}

function pad(n) {
  return String(n).padStart(2, '0');
}

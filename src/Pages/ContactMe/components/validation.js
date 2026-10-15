export const fieldRules = {
  firstName: { label: "First name", required: true, max: 80, autocomplete: "given-name" },
  lastName: { label: "Last name", required: false, max: 80, autocomplete: "family-name" },
  email: { label: "Email", required: true, max: 254, autocomplete: "email" },
  phone: { label: "Phone", required: false, autocomplete: "tel" },
  subject: { label: "Subject", required: true, max: 120 },
  message: { label: "Message", required: true, max: 1200 },
};

export const validateForm = values => {
  const errors = {};
  Object.entries(fieldRules).forEach(([name, rule]) => {
    const raw = values[name] || "";
    const value = raw.trim();
    if (rule.required && !value) errors[name] = `${rule.label} is required`;
    else if (rule.max && raw.length > rule.max) errors[name] = `${rule.label} must be ${rule.max} characters or fewer`;
    else if (name === "email" && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) errors[name] = "Enter a valid email address";
    else if (name === "phone" && value && (!/^\+?[\d\s().-]+$/.test(value) || !/^\d{10,15}$/.test(value.replace(/\D/g, "")))) errors[name] = "Enter a phone number with 10–15 digits";
  });
  return errors;
};

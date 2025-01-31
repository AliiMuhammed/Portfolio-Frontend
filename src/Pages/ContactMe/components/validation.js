export const validateForm = (values) => {
    let errors = {};
  
    if (!values.firstName.trim()) {
      errors.firstName = "First Name is required";
    }
  
    if (!values.lastName.trim()) {
      errors.lastName = "Last Name is required";
    }
  
    if (!values.email) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(values.email)) {
      errors.email = "Email address is invalid";
    }
  
    if (!values.phone) {
      errors.phone = "Phone Number is required";
    } else if (!/^\d{10,15}$/.test(values.phone)) {
      errors.phone = "Phone Number is invalid";
    }
  
    if (!values.subject.trim()) {
      errors.subject = "Subject is required";
    }
  
    if (!values.message.trim()) {
      errors.message = "Message is required";
    }
  
    return errors;
  };
  
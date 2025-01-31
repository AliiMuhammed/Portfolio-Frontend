import React, { useState } from "react";
import { FaPhoneAlt } from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import { FaLocationDot } from "react-icons/fa6";
import { Link } from "react-router-dom";
import { validateForm } from "./components/validation";
import "./style/contact.css";
import emailjs from "emailjs-com";
const ContactMe = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validateForm(formData);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      // Send the email using EmailJS
      emailjs
        .sendForm(
          "service_o2o2h4p", // Replace with your EmailJS service ID
          "template_cahhqro", // Replace with your EmailJS template ID
          e.target, // The form element
          "DwMax_6jhXFwlDPp5",
          {
            reply_to: formData.email,
          }
        )
        .then(
          (result) => {
            console.log(result.text); // Handle success
            setSubmitted(true);
            alert("Form submitted successfully!");
          },
          (error) => {
            console.error(error.text); // Handle error
          }
        );
    }
  };

  return (
    <section className="contact-section">
      <div className="container">
        <div className="contact-form">
          <h1 className="form-heading">Let's get in touch</h1>
          <p className="form-desc">
            Feel free to reach out if you have any questions, need help with a
            project, or simply want to say hi. I'm always here to help!
          </p>
          <form onSubmit={handleSubmit} className="form">
            <div className="inputs-container">
              <div className="input-error">
                <input
                  type="text"
                  name="firstName"
                  placeholder="First Name"
                  value={formData.firstName}
                  onChange={handleChange}
                />
                {errors.firstName && (
                  <p className="error">{errors.firstName}</p>
                )}
              </div>
              <div className="input-error">
                <input
                  type="text"
                  name="lastName"
                  placeholder="Last Name"
                  value={formData.lastName}
                  onChange={handleChange}
                />
                {errors.lastName && <p className="error">{errors.lastName}</p>}
              </div>
            </div>

            <div className="inputs-container">
              <div className="input-error">
                <input
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={handleChange}
                />
                {errors.email && <p className="error">{errors.email}</p>}
              </div>
              <div className="input-error">
                <input
                  type="text"
                  name="phone"
                  placeholder="Phone Number"
                  value={formData.phone}
                  onChange={handleChange}
                />
                {errors.phone && <p className="error">{errors.phone}</p>}
              </div>
            </div>
            <div className="input-error">
              <input
                type="text"
                name="subject"
                placeholder="Subject"
                value={formData.subject}
                onChange={handleChange}
              />
              {errors.subject && <p className="error">{errors.subject}</p>}
            </div>
            <div className="input-error">
              <textarea
                name="message"
                cols="30"
                rows="10"
                placeholder="Message"
                value={formData.message}
                onChange={handleChange}
              ></textarea>
              {errors.message && <p className="error">{errors.message}</p>}
            </div>

            <button className="main-btn" type="submit">
              Send Message
            </button>

            {submitted && (
              <p className="success-msg">Form submitted successfully!</p>
            )}
          </form>
        </div>

        <div className="contacts-info">
          <div className="contact-info">
            <div className="contact-icon">
              <FaPhoneAlt />
            </div>
            <div className="contact-text">
              <span>Phone</span>
              <p>(+02) 1066567630</p>
            </div>
          </div>
          <div className="contact-info">
            <div className="contact-icon">
              <MdEmail />
            </div>
            <div className="contact-text">
              <span>Email</span>
              <p>
                <Link
                  target="_blank"
                  rel="noopener noreferrer"
                  to="mailto:ali.muhammed.dev@gmail.com"
                >
                  ali.muhammed.dev@gmail.com
                </Link>
              </p>
            </div>
          </div>
          <div className="contact-info">
            <div className="contact-icon">
              <FaLocationDot />
            </div>
            <div className="contact-text">
              <span>Location</span>
              <p>Cairo, Egypt</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactMe;

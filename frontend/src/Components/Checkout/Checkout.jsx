import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Checkout.css";

const Checkout = () => {
  const [customer, setCustomer] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCustomer((prevCustomer) => ({
      ...prevCustomer,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Customer Details:", customer);
    // Add logic for saving customer details or proceeding with the payment
    navigate("/payment"); // Navigate to the payment page after submission
  };

  return (
    <div className="checkout">
      <h1>Checkout</h1>
      <form onSubmit={handleSubmit} className="checkout-form">
        <div className="form-group">
          <label htmlFor="name">Full Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={customer.name}
            onChange={handleChange}
            placeholder="Enter your full name"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="email">Email Address</label>
          <input
            type="email"
            id="email"
            name="email"
            value={customer.email}
            onChange={handleChange}
            placeholder="Enter your email"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="phone">Phone Number</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={customer.phone}
            onChange={handleChange}
            placeholder="Enter your phone number"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="address">Address</label>
          <input
            type="text"
            id="address"
            name="address"
            value={customer.address}
            onChange={handleChange}
            placeholder="Enter your address"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="city">City</label>
          <input
            type="text"
            id="city"
            name="city"
            value={customer.city}
            onChange={handleChange}
            placeholder="Enter your city"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="postalCode">Postal Code</label>
          <input
            type="text"
            id="postalCode"
            name="postalCode"
            value={customer.postalCode}
            onChange={handleChange}
            placeholder="Enter your postal code"
            required
          />
        </div>
        <button type="submit" className="submit-button">
          Proceed to Payment
        </button>
      </form>
    </div>
  );
};

export default Checkout;

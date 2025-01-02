import React, { useContext, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./Payment.css";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardNumberElement, CardExpiryElement, CardCvcElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { ShopContext } from "../../Context/ShopContext";
import { saveOrderToDatabase } from "../../Utils/orderHelpers";

// Load Stripe with your public key
const stripePromise = loadStripe("pk_test_51QPsLNGG1Y34r33ifSAIRIuDcvBJI7zY5ay4pzcQ4VtscQk2PxvqgolSa4xYlg55hul3eMcSLToQGcd6SAjuPzNl00qpwd0bK8");

const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const { cartItems, getTotalCartAmount, clearCart, userId } = useContext(ShopContext);

  const [customerDetails, setCustomerDetails] = useState({ name: "", email: "" });
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [orderId, setOrderId] = useState(null);

  // Fetch client secret when the component loads
  useEffect(() => {
    const fetchClientSecret = async () => {
      const token = localStorage.getItem("auth-token"); // Get the auth-token

      try {
        const response = await fetch("http://localhost:4000/create-payment-intent", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "auth-token": token, // Add the auth-token in the request
          },
          body: JSON.stringify({ amount: getTotalCartAmount() * 100 }), // Amount in cents
        });

        if (!response.ok) {
          throw new Error(`HTTP Error: ${response.status}`);
        }

        const data = await response.json();
        console.log("Client Secret:", data.clientSecret);
        setClientSecret(data.clientSecret);
      } catch (error) {
        console.error("Error fetching client secret:", error.message);
      }
    };

    fetchClientSecret();
  }, [getTotalCartAmount]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    setIsProcessing(true);

    const card = elements.getElement(CardNumberElement);

    try {
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card,
          billing_details: {
            name: customerDetails.name,
            email: customerDetails.email,
          },
        },
      });

      if (error) {
        console.error("Payment failed:", error.message);
        setPaymentStatus("Payment failed: " + error.message);
      } else if (paymentIntent && paymentIntent.status === "succeeded") {
        console.log("Payment successful!");
        setPaymentStatus("Payment successful!");

        // Save the order to the backend
        await saveOrderToDatabase(paymentIntent.id, cartItems, userId, getTotalCartAmount());

        // Clear the cart
        await clearCart();

        // Save orderId for redirection
        setOrderId(paymentIntent.id);
      }
    } catch (error) {
      console.error("Error during payment:", error);
      setPaymentStatus("Payment failed: " + error.message);
    }

    setIsProcessing(false);
  };

  return (
    <form onSubmit={handleSubmit} className="payment-form">
      <h1>Payment</h1>
      <div className="form-group">
        <label>Name</label>
        <input
          type="text"
          value={customerDetails.name}
          onChange={(e) => setCustomerDetails({ ...customerDetails, name: e.target.value })}
          required
        />
      </div>
      <div className="form-group">
        <label>Email</label>
        <input
          type="email"
          value={customerDetails.email}
          onChange={(e) => setCustomerDetails({ ...customerDetails, email: e.target.value })}
          required
        />
      </div>
      <div className="form-group">
        <label>Card Number</label>
        <CardNumberElement />
      </div>
      <div className="form-group">
        <label>Expiry Date</label>
        <CardExpiryElement />
      </div>
      <div className="form-group">
        <label>CVV</label>
        <CardCvcElement />
      </div>
      <button type="submit" disabled={!stripe || isProcessing || !clientSecret}>
        {isProcessing ? "Processing..." : "Pay Now"}
      </button>
      {paymentStatus && <p>{paymentStatus}</p>}
      {orderId && (
        <Link to={`/confirmation/${orderId}`} className="confirmation-link">
          Go to Confirmation Page
        </Link>
      )}
    </form>
  );
};

const Payment = () => (
  <div className="payment-container">
    <Elements stripe={stripePromise}>
      <CheckoutForm />
    </Elements>
  </div>
);

export default Payment;

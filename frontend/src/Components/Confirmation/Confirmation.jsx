import React from "react";
import { useLocation, useParams, Link } from "react-router-dom";
import "./Confirmation.css";

const Confirmation = () => {
  const { orderId } = useParams(); // Retrieve orderId from the URL
  const location = useLocation(); // Access additional state if passed
  const paymentIntent = location.state?.paymentIntent;

  return (
    <div className="confirmation-container">
      <h1>Thank You for Your Purchase!</h1>
      <p>Your order has been successfully placed.</p>
      <p>
        <strong>Order ID:</strong> {orderId}
      </p>
      {paymentIntent && (
        <p>
          <strong>Amount Paid:</strong> ${(paymentIntent.amount / 100).toFixed(2)}
        </p>
      )}
      <Link to="/shop">
        <button className="continue-shopping-btn">Continue Shopping</button>
      </Link>
    </div>
  );
};

export default Confirmation;

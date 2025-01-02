

export const saveOrderToDatabase = async (paymentIntentId, cartItems, userId, totalAmount) => {
    try {
      const response = await fetch("http://localhost:4000/save-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: paymentIntentId,
          userId,
          items: cartItems,
          totalAmount,
        }),
      });
  
      const data = await response.json();
      if (!data.success) {
        console.error("Failed to save order:", data.error);
      }
    } catch (error) {
      console.error("Error saving order to database:", error.message);
    }
  };
  
  export const clearCart = async () => {
    try {
      const response = await fetch("http://localhost:4000/clear-cart", {
        method: "POST",
        headers: {
          "auth-token": localStorage.getItem("token"), // Add token if authentication is required
        },
      });
  
      const data = await response.json();
      if (!data.success) {
        console.error("Failed to clear cart:", data.error);
      }
    } catch (error) {
      console.error("Error clearing cart:", error.message);
    }
  };
  
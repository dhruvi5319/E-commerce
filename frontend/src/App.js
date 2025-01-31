import "./App.css";
import axios from 'axios';
import Navbar from "./Components/Nevbar/Navbar";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ShopCategory from "./Pages/ShopCategory";
import Product from "./Pages/Product";
import Shop from "./Pages/Shop";
import Cart from "./Pages/Cart";
import Checkout from "./Pages/CheckoutDetails";
import PaymentMethod from "./Pages/PaymentMethod";
import ConfirmOrder from "./Pages/ConfirmOrder";
import LoginSignup from "./Pages/LoginSignup";
import Footer from "./Components/Footer/Footer";
import men_banner from './Components/Assets/banner_mens.png';
import women_banner from './Components/Assets/banner_women.png';
import kid_banner from './Components/Assets/banner_kids.png';

function App() {
  axios.defaults.withCredentials = true;
  const handleSubmit = (e) => {
  e.preventDefault();
      axios.post('https://e-commerce-five-drab.vercel.app/')
           .then(result => console. log(result))
           .catch(err => console. log(err))
}

  return (
    <div>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Shop />} />
          <Route path="/mens" element={<ShopCategory banner={men_banner} category="men" />} />
          <Route path="/womens" element={<ShopCategory banner={women_banner} category="women" />} />
          <Route path="/kids" element={<ShopCategory banner={kid_banner} category="kid" />} />
          <Route path="/product" element={<Product/>}/>
            <Route path='/product/:productId' element={<Product/>}/>
          <Route path="/cart" element={<Cart />} />
          <Route path="/login" element={<LoginSignup/>} />
          <Route path="/checkout" element={<Checkout/>} />
          <Route path="/payment" element={<PaymentMethod/>} />
          <Route path="/confirmation/:orderId" element={<ConfirmOrder />} />        
        </Routes>
        <Footer/>
      </BrowserRouter>
    </div>
  );
}

export default App;

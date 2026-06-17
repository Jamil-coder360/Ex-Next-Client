// app/order/page.jsx  (or pages/order.jsx for Pages Router)
"use client";

import { useState } from "react";

const INITIAL = {
  firstName: "", lastName: "", email: "", phone: "",
  productName: "", category: "", quantity: "", price: "", payment: "",
  address: "", city: "", state: "", zip: "", country: "", notes: "",
};

export default function OrderForm() {
  const [form, setForm] = useState(INITIAL);
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const set = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const validate = () => {
    const e = {};
    if (!form.firstName.trim()) e.firstName = "First name is required";
    if (!form.lastName.trim()) e.lastName = "Last name is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Valid email is required";
    if (!form.productName.trim()) e.productName = "Product name is required";
    if (!form.category) e.category = "Please select a category";
    if (!form.quantity || parseInt(form.quantity) < 1) e.quantity = "Quantity must be at least 1";
    if (!form.address.trim()) e.address = "Address is required";
    if (!form.city.trim()) e.city = "City is required";
    if (!form.country) e.country = "Please select a country";
    return e;
  };

  const handleSubmit = async(e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    console.log("Order submitted:", form);
    setSubmitted(true);
    setForm(INITIAL);
    setTimeout(() => setSubmitted(false), 3000);

   const res = await fetch("https://ex-next-server.vercel.app/contact",{
        method :"POST" ,
        headers:{
            "content-type": "application/json"
        },
        body:JSON.stringify(form)
    })
    const data = await res.json();
    console.log(data);
  };

  const field = (id, label, props, required = false) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <input
        id={id} value={form[id]} onChange={set(id)}
        className={`w-full border rounded-lg px-4 py-2.5 text-sm text-gray-800 transition-all focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-500 ${errors[id] ? "border-red-400" : "border-gray-200"}`}
        {...props}
      />
      {errors[id] && <p className="text-red-400 text-xs mt-1">{errors[id]}</p>}
    </div>
  );

  const selectField = (id, label, options, required = false) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <select
        id={id} value={form[id]} onChange={set(id)}
        className={`w-full border rounded-lg px-4 py-2.5 text-sm text-gray-700 bg-white appearance-none cursor-pointer transition-all focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-500 ${errors[id] ? "border-red-400" : "border-gray-200"}`}
      >
        <option value="">Select...</option>
        {options.map((o) => <option key={o}>{o}</option>)}
      </select>
      {errors[id] && <p className="text-red-400 text-xs mt-1">{errors[id]}</p>}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex items-start justify-center py-10 px-4">
      <div className="w-full max-w-2xl">

        {/* Logo */}
        <div className="flex items-center gap-2 mb-6">
          <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
            <path d="M8 24 C8 16 16 10 24 8" stroke="#22c016" strokeWidth="3" strokeLinecap="round"/>
            <path d="M8 24 C12 20 20 18 24 8" stroke="#4ade80" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <span className="text-xl font-bold text-gray-900 tracking-tight">Ecobazar</span>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="px-8 pt-7 pb-5 border-b border-gray-100">
            <h1 className="text-2xl font-bold text-gray-900">Place Your Order</h1>
            <p className="text-sm text-gray-400 mt-1">Fill in the details below to complete your order</p>
          </div>

          <form onSubmit={handleSubmit} className="px-8 py-7 space-y-6">

            {/* Customer Info */}
            <section>
              <h2 className="text-xs font-bold uppercase tracking-widest text-green-500 mb-4">Customer Information</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {field("firstName", "First Name", { placeholder: "John" }, true)}
                {field("lastName", "Last Name", { placeholder: "Doe" }, true)}
                {field("email", "Email Address", { type: "email", placeholder: "john@example.com" }, true)}
                {field("phone", "Phone Number", { type: "tel", placeholder: "+1 (219) 555-0114" })}
              </div>
            </section>

            <hr className="border-gray-100" />

            {/* Product Details */}
            <section>
              <h2 className="text-xs font-bold uppercase tracking-widest text-green-500 mb-4">Product Details</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  {field("productName", "Product Name", { placeholder: "e.g. Organic Mango Box" }, true)}
                </div>
                {selectField("category", "Category", ["Fruit & Vegetables", "Meat & Fish", "Bread & Bakery", "Beauty & Health", "Dairy & Eggs"], true)}
                {field("quantity", "Quantity", { type: "number", placeholder: "1", min: "1" }, true)}
                {field("price", "Unit Price ($)", { type: "number", placeholder: "0.00", step: "0.01", min: "0" })}
                {selectField("payment", "Payment Method", ["Credit / Debit Card", "Apple Pay", "Cash on Delivery", "Bank Transfer"])}
              </div>
            </section>

            <hr className="border-gray-100" />

            {/* Delivery Address */}
            <section>
              <h2 className="text-xs font-bold uppercase tracking-widest text-green-500 mb-4">Delivery Address</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  {field("address", "Street Address", { placeholder: "123 Market Street, Apt 4B" }, true)}
                </div>
                {field("city", "City", { placeholder: "New York" }, true)}
                {field("state", "State / Province", { placeholder: "NY" })}
                {field("zip", "ZIP / Postal Code", { placeholder: "10001" })}
                {selectField("country", "Country", ["United States", "United Kingdom", "Canada", "Australia", "Bangladesh", "India", "Germany", "France", "Other"], true)}
              </div>
            </section>

            <hr className="border-gray-100" />

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Order Notes <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <textarea
                value={form.notes} onChange={set("notes")} rows={3}
                placeholder="Special instructions, delivery preferences..."
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-800 resize-none focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-500 transition-all"
              />
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-1">
              <button type="submit"
                className="flex-1 bg-green-500 hover:bg-green-600 active:bg-green-700 text-white font-bold py-3 rounded-xl transition-colors text-sm tracking-wide">
                Place Order
              </button>
              <button type="button" onClick={() => { setForm(INITIAL); setErrors({}); }}
                className="px-6 py-3 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 text-sm font-medium transition-colors">
                Clear Form
              </button>
            </div>

            {/* Success message */}
            {submitted && (
              <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-xl">
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                Order placed successfully!
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
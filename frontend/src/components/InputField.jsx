import React from "react";

export default function InputField({ label, type = "text", value, onChange, placeholder }) {
  return (
    <div className="input-wrapper">
      <label className="label-field">{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="input-field"
      />
    </div>
  );
}

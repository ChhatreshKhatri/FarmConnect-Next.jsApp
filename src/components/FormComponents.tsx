"use client";

import React from "react";

interface FormFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}

export const FormField: React.FC<FormFieldProps> = ({ label, required = false, error, children }) => {
  return (
    <div className="space-y-1">
      <label className="block text-sm font-bold text-gray-900">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {error && <p className="text-sm font-semibold text-red-600">{error}</p>}
    </div>
  );
};

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const Input: React.FC<InputProps> = ({ error = false, className = "", ...props }) => {
  const baseClasses = "mt-1 block w-full px-3 py-2 border rounded-md shadow-sm text-gray-900 font-medium text-base placeholder-gray-500 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500";
  const errorClasses = error ? "border-red-300" : "border-gray-300";

  return <input className={`${baseClasses} ${errorClasses} ${className}`} {...props} />;
};

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

export const Textarea: React.FC<TextareaProps> = ({ error = false, className = "", ...props }) => {
  const baseClasses = "mt-1 block w-full px-3 py-2 border rounded-md shadow-sm text-gray-900 font-medium text-base placeholder-gray-500 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500";
  const errorClasses = error ? "border-red-300" : "border-gray-300";

  return <textarea className={`${baseClasses} ${errorClasses} ${className}`} {...props} />;
};

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
}

export const Select: React.FC<SelectProps> = ({ error = false, className = "", children, ...props }) => {
  const baseClasses = "mt-1 block w-full px-3 py-2 border rounded-md shadow-sm text-gray-900 font-medium text-base bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500";
  const errorClasses = error ? "border-red-300" : "border-gray-300";

  return (
    <select className={`${baseClasses} ${errorClasses} ${className}`} {...props}>
      {children}
    </select>
  );
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "success";
  size?: "sm" | "md" | "lg";
}

export const Button: React.FC<ButtonProps> = ({ variant = "primary", size = "md", className = "", children, ...props }) => {
  const baseClasses = "font-semibold rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed";

  const variantClasses = {
    primary: "bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500",
    secondary: "bg-gray-600 hover:bg-gray-700 text-white focus:ring-gray-500",
    danger: "bg-red-600 hover:bg-red-700 text-white focus:ring-red-500",
    success: "bg-green-600 hover:bg-green-700 text-white focus:ring-green-500",
  };

  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  };

  return (
    <button className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`} {...props}>
      {children}
    </button>
  );
};

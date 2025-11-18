export default function Input({ className, ...props }) {
    return (
      <input
        {...props}
        className={`border border-gray-600  text-black placeholder-gray-400 p-2 rounded-md w-full focus:ring-2 focus:ring-blue-500 ${className}`}
      />
    );
  }
  
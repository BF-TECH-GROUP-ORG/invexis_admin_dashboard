"use client";

import { useRouter } from "next/navigation";

/**
 * NavButton Component
 * A reusable button that handles navigation with prefetch
 * Ensures fast page transitions throughout the app
 * 
 * @param {Object} props - Component props
 * @param {string} props.href - The path to navigate to
 * @param {string} props.children - Button content
 * @param {string} props.variant - Button style variant: 'primary', 'secondary', 'danger', 'outline'
 * @param {string} props.size - Button size: 'sm', 'md', 'lg'
 * @param {boolean} props.disabled - Disable the button
 * @param {Function} props.onClick - Additional onClick handler
 * @param {string} props.className - Additional CSS classes
 * @param {boolean} props.prefetch - Enable prefetch (default: true)
 * @returns {JSX.Element}
 */
export default function NavButton({
    href,
    children,
    variant = "primary",
    size = "md",
    disabled = false,
    onClick,
    className = "",
    prefetch = true,
}) {
    const router = useRouter();

    const variantStyles = {
        primary: "bg-orange-500 hover:bg-orange-600 text-white",
        secondary: "bg-gray-200 hover:bg-gray-300 text-gray-900",
        danger: "bg-red-500 hover:bg-red-600 text-white",
        outline: "border border-gray-300 hover:bg-gray-50 text-gray-900",
        ghost: "hover:bg-gray-100 text-gray-900",
    };

    const sizeStyles = {
        sm: "px-3 py-1.5 text-sm",
        md: "px-4 py-2 text-base",
        lg: "px-6 py-3 text-lg",
    };

    const handleClick = async (e) => {
        e.preventDefault();

        // Call custom onClick handler if provided
        if (onClick) {
            onClick(e);
        }

        // Prefetch and navigate
        if (href && !disabled) {
            if (prefetch) {
                router.prefetch(href);
            }
            router.push(href);
        }
    };

    return (
        <button
            onClick={handleClick}
            disabled={disabled}
            className={`
        rounded-lg
        transition-colors
        duration-200
        font-medium
        active:scale-95
        disabled:opacity-50
        disabled:cursor-not-allowed
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `}
        >
            {children}
        </button>
    );
}

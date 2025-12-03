/**
 * Navigation Prefetch Helper
 * 
 * Use this utility to create navigation Links with prefetch enabled
 * Next.js will automatically prefetch the page when hovering over the link
 * 
 * IMPORTANT: Next.js Link component automatically prefetches by default in production
 */

/**
 * Example usage in components:
 * 
 * import Link from "next/link";
 * import { useRouter } from "next/navigation";
 * 
 * // In your component:
 * 
 * // 1. Using Next.js Link (recommended - prefetch is on by default)
 * <Link href="/clients/list" prefetch={true}>
 *   All Companies
 * </Link>
 * 
 * // 2. Using a button with router.push
 * const router = useRouter();
 * 
 * const handleNavigate = () => {
 *   router.prefetch("/clients/list"); // Prefetch the route
 *   router.push("/clients/list");
 * };
 * 
 * <button onClick={handleNavigate}>
 *   Go to Companies
 * </button>
 */

import { useRouter } from "next/navigation";

/**
 * Hook for programmatic navigation with prefetch
 * Use this when you need to navigate via button click or other event
 * 
 * @returns {Object} Navigation helpers
 */
export const useNavigation = () => {
    const router = useRouter();

    /**
     * Navigate to a path with prefetch
     * @param {string} path - The path to navigate to
     */
    const navigateTo = async (path) => {
        // Prefetch first to ensure page is ready
        router.prefetch(path);
        // Then navigate
        router.push(path);
    };

    /**
     * Navigate with a slight delay to ensure prefetch completes
     * Useful for better UX
     */
    const navigateToWithDelay = async (path, delay = 100) => {
        router.prefetch(path);
        await new Promise((resolve) => setTimeout(resolve, delay));
        router.push(path);
    };

    return {
        navigateTo,
        navigateToWithDelay,
    };
};

export default useNavigation;

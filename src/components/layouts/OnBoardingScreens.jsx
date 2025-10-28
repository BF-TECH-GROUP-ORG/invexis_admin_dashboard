"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { HiArrowLeft, HiArrowRight } from "react-icons/hi";
import { useDispatch, useSelector } from "react-redux";
import {
  completeOnboarding,
  loadOnboarding,
  setActiveStep,
} from "@/features/onboarding/onboardingSlice";
import { redirect } from "next/navigation";

export default function OnBoardingScreens({ steps }) {
  const dispatch = useDispatch();
  const { activeStep, completed } = useSelector((state) => state.onboarding);

  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    dispatch(loadOnboarding());
  }, [dispatch]);

  if (!mounted) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col md:flex-row w-3/4 h-1/2 space-y-6 md:space-y-0 md:space-x-6">
          <div className="flex-1 bg-gray-200 animate-pulse rounded-lg"></div>
          <div className="flex-1 space-y-4">
            <div className="h-6 w-3/4 bg-gray-200 animate-pulse rounded"></div>
            <div className="h-4 w-2/3 bg-gray-200 animate-pulse rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (completed) {
    return redirect("/auth/login");
  }

  const handleNext = () => {
    setLoading(true);
    setTimeout(() => {
      dispatch(setActiveStep(activeStep + 1));
      setLoading(false);
    }, 600);
  };

  const handleBack = () => {
    dispatch(setActiveStep(activeStep - 1));
  };

  return (
    <div className="w-screen h-screen flex flex-col md:flex-row bg-white relative">
      {/* Skip Button - top-right of screen */}
      <button
        onClick={() => dispatch(completeOnboarding())}
        className={`fixed top-4 right-4 md:top-20 md:right-20 z-20 px-4 py-2 rounded-lg font-medium transition
          ${window.innerWidth < 768 ? "bg-white/30 hover:bg-white/50 text-black" : "bg-gray-100 hover:bg-gray-200 text-black"}`}
      >
        Skip
      </button>

      {/* Left Side - Image */}
      <div className="w-full md:w-1/2 h-1/2 md:h-full flex items-center justify-center bg-orange-100">
        {steps[activeStep]?.image && (
          <Image
            src={steps[activeStep].image}
            alt={steps[activeStep].title}
            width={600}
            height={600}
            className="object-contain max-h-[80%] md:max-h-[90%] px-4"
            priority
          />
        )}
      </div>

      {/* Right Side - Content */}
      <div className="w-full md:w-1/2 h-1/2 md:h-full flex flex-col justify-between p-6 md:p-20">
        {/* Step content */}
        <div className="flex-1 flex flex-col justify-center space-y-4 text-center md:text-left">
          {loading ? (
            <>
              <div className="h-6 w-3/4 bg-gray-200 animate-pulse rounded mx-auto md:mx-0"></div>
              <div className="h-4 w-2/4 bg-gray-200 animate-pulse rounded mx-auto md:mx-0"></div>
            </>
          ) : (
            <>
              <h2 className="text-xl md:text-3xl font-extrabold">
                {steps[activeStep]?.title}
              </h2>
              <p className="text-gray-600 text-sm md:text-base max-w-md mx-auto md:mx-0">
                {steps[activeStep]?.description}
              </p>
            </>
          )}
        </div>

        {/* Stepper */}
        {activeStep < steps.length - 1 && (
          <div className="flex flex-row items-center justify-between mt-6 md:mt-0">
            <button
              onClick={handleBack}
              disabled={activeStep === 0}
              className="flex items-center px-4 py-2 bg-gray-100 rounded-lg disabled:opacity-50 mb-2 md:mb-0"
            >
              <HiArrowLeft className="mr-1" /> Back
            </button>

            <div className="flex space-x-2 items-center justify-center mb-2 md:mb-0">
              {steps.map((_, i) => (
                <span
                  key={i}
                  className={`w-[4px] md:w-10 h-[4px] rounded-full ${
                    i === activeStep ? "bg-orange-600" : "bg-gray-300"
                  }`}
                ></span>
              ))}
            </div>

            <button
              onClick={handleNext}
              disabled={activeStep === steps.length - 1}
              className="flex items-center px-4 py-2 bg-[#081422] text-white rounded-lg disabled:opacity-50"
            >
              Next <HiArrowRight className="ml-1" />
            </button>
          </div>
        )}

        {/* Final Get Started button */}
        {activeStep === steps.length - 1 && (
          <button
            onClick={() => dispatch(completeOnboarding())}
            className="mt-6 w-full py-3 bg-[#ff782d] text-[#081422] rounded-lg font-semibold"
          >
            Get Started
          </button>
        )}
      </div>
    </div>
  );
}


// d
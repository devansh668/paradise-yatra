"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  Calendar,
  CheckCircle,
  Loader2,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  User,
  X,
  Sparkles
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import PhoneInput from "react-phone-input-international";
import "react-phone-input-international/lib/style.css";

interface LeadCaptureFormProps {
  isOpen: boolean;
  onClose: () => void;
  packageTitle?: string;
  packagePrice?: string;
}

interface FormData {
  fullName: string;
  email: string;
  phone: string;
  destination: string;
  travelDate?: Date;
  message: string;
  newsletterConsent: boolean;
}

interface FormErrors {
  fullName?: string;
  email?: string;
  phone?: string;
  destination?: string;
  travelDate?: string;
  message?: string;
  newsletterConsent?: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 400, damping: 30 } }
};

const inputClass =
  "w-full h-[48px] rounded-xl border border-slate-200/80 bg-white/60 backdrop-blur-md py-3 pl-11 pr-4 text-[13px] sm:text-sm text-slate-800 outline-none transition-all duration-300 focus:border-blue-500 focus:bg-white focus:shadow-[0_0_0_4px_rgba(59,130,246,0.1)] placeholder:text-slate-400";

const textAreaClass =
  "w-full min-h-[90px] rounded-xl border border-slate-200/80 bg-white/60 backdrop-blur-md py-3 pl-11 pr-4 text-[13px] sm:text-sm text-slate-800 outline-none transition-all duration-300 focus:border-blue-500 focus:bg-white focus:shadow-[0_0_0_4px_rgba(59,130,246,0.1)] placeholder:text-slate-400 resize-none";

const labelClass = "mb-1.5 block text-xs font-semibold text-slate-700 tracking-wide";

function FieldError({ message }: { message?: string }) {
  if (!message) return null;

  return (
    <div className="relative z-20 mt-1 overflow-hidden ml-1">
      <AnimatePresence initial={false} mode="wait">
        <motion.p
          key={message}
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          transition={{ duration: 0.3 }}
          className="text-[11px] font-medium leading-none !text-red-500 flex items-center gap-1"
        >
          <AlertCircle className="w-3 h-3" />
          {message}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}

export default function LeadCaptureForm({
  isOpen,
  onClose,
  packageTitle,
  packagePrice,
}: LeadCaptureFormProps) {
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    email: "",
    phone: "",
    destination: "",
    travelDate: undefined,
    message: "",
    newsletterConsent: true,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">(
    "idle"
  );
  const [phoneDialCode, setPhoneDialCode] = useState("+91");

  useEffect(() => {
    if (!isOpen) return;

    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    const fullName = formData.fullName.trim();
    if (!fullName) {
      newErrors.fullName = "Please enter your full name.";
    } else if (fullName.length < 3) {
      newErrors.fullName = "Full name should be at least 3 characters.";
    } else if (!/^[a-zA-Z.\s]+$/.test(fullName)) {
      newErrors.fullName = "Name can contain only letters, spaces, and dots.";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email.trim() && !emailRegex.test(formData.email.trim())) {
      newErrors.email = "Please enter a valid email address.";
    }

    const phoneDigits = formData.phone.replace(/\D/g, "");
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is mandatory.";
    } else if (phoneDigits.length < 10 || phoneDigits.length > 13) {
      newErrors.phone = "Enter a valid mobile number (10-13 digits).";
    }

    if (formData.destination.trim() && formData.destination.trim().length < 2) {
      newErrors.destination = "Destination name looks too short.";
    }

    if (formData.message.trim() && formData.message.trim().length < 10) {
      newErrors.message = "Please add at least 10 characters in requirements.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (
    field: keyof FormData,
    value: string | boolean | Date | undefined
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setSubmitStatus("idle");

    const travelDateText = formData.travelDate
      ? format(formData.travelDate, "MMM dd, yyyy")
      : "Not specified";
    const enhancedMessage = `Travel Date: ${travelDateText}\n\n${formData.message}`;

    try {
      const response = await fetch("/api/lead-capture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          phone: `${phoneDialCode.replace(/\D/g, "")}${formData.phone}`,
          message: enhancedMessage,
          travelDate: formData.travelDate?.toISOString(),
          packageTitle,
          packagePrice,
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit form");
      }

      setSubmitStatus("success");
      setFormData({
        fullName: "",
        email: "",
        phone: "",
        destination: "",
        travelDate: undefined,
        message: "",
        newsletterConsent: true,
      });

      setTimeout(() => {
        setSubmitStatus("idle");
        onClose();
      }, 2200);
    } catch (error) {
      console.error("Error submitting form:", error);
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
          animate={{ opacity: 1, backdropFilter: "blur(8px)" }}
          exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
          transition={{ duration: 0.4 }}
          className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/40 p-3 sm:p-6"
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.4, type: "spring", bounce: 0.2 }}
            className="relative w-full max-w-[800px] max-h-[90dvh] overflow-hidden rounded-3xl bg-white shadow-[0_32px_96px_rgba(0,0,0,0.25)] sm:max-h-[calc(100vh-3rem)] ring-1 ring-slate-200/50"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute right-4 top-4 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-slate-500 shadow-sm backdrop-blur-md transition-all hover:bg-white hover:text-slate-800 hover:shadow-md hover:scale-105 active:scale-95"
              aria-label="Close lead capture form"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex flex-col max-h-[90dvh] min-h-0 overflow-y-auto sm:max-h-[calc(100vh-3rem)]">
              {/* Top Banner - Image with Dynamic Overlay */}
              <div className="relative w-full h-[200px] sm:h-[240px] shrink-0 group">
                <Link
                  href="https://paradiseyatra.com/package/royal-egypt-nile-heritage-journey"
                  className="block h-full w-full overflow-hidden"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <motion.div 
                    whileHover={{ scale: 1.05 }} 
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="h-full w-full absolute inset-0"
                  >
                    <Image
                      src="/Home/Pop Up Form/Image.jpg"
                      alt="Travel planning"
                      fill
                      className="object-cover"
                      sizes="100vw"
                    />
                  </motion.div>
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent mix-blend-multiply" />
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-600/30 to-transparent" />

                  <div className="absolute inset-x-0 bottom-0 z-10 flex flex-col justify-end p-6 sm:p-8">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3, duration: 0.6 }}
                      className="space-y-3"
                    >
                      <h2 className="max-w-[95%] text-[28px] sm:text-[34px] font-extrabold leading-[1.15] text-white drop-shadow-md">
                        Relax in Egypt with Nile sunsets, <br className="hidden sm:block"/> timeless beauty, and calm escapes.
                      </h2>
                    </motion.div>
                  </div>
                </Link>
              </div>

              {/* Form Container */}
              <div
                className="relative min-h-0 bg-white p-6 sm:p-10 shrink-0 overflow-hidden"
              >
                {/* Decorative background blob */}
                <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-blue-400/10 blur-3xl" />
                <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-indigo-400/10 blur-3xl" />

                <div className="relative z-10">
                  {submitStatus === "success" ? (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex h-full min-h-[300px] sm:min-h-[460px] flex-col items-center justify-center text-center"
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", bounce: 0.5, delay: 0.1 }}
                      >
                        <CheckCircle className="mb-6 h-20 w-20 text-emerald-500 drop-shadow-lg" />
                      </motion.div>
                      <h4 className="mb-3 text-3xl font-extrabold text-slate-800">You are all set.</h4>
                      <p className="max-w-xs text-base text-slate-600 leading-relaxed">
                        Thank you for sharing your details. Our travel expert will call
                        you shortly with a personalized itinerary.
                      </p>
                    </motion.div>
                  ) : submitStatus === "error" ? (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex h-full min-h-[300px] sm:min-h-[460px] flex-col items-center justify-center text-center"
                    >
                      <AlertCircle className="mb-6 h-20 w-20 text-rose-500 drop-shadow-lg" />
                      <h4 className="mb-3 text-3xl font-extrabold text-slate-800">Submission Failed</h4>
                      <p className="max-w-xs text-base text-slate-600 leading-relaxed">
                        Something went wrong while sending your request. Please try again.
                      </p>
                      <button
                        onClick={() => setSubmitStatus("idle")}
                        className="mt-8 rounded-full bg-slate-900 px-8 py-3 text-sm font-semibold text-white transition-all hover:bg-slate-800 hover:shadow-lg active:scale-95"
                      >
                        Try again
                      </button>
                    </motion.div>
                  ) : (
                    <motion.div
                      variants={containerVariants}
                      initial="hidden"
                      animate="show"
                    >
                      <motion.div variants={itemVariants}>
                        <h2 className="text-[32px] sm:text-[40px] font-extrabold leading-tight text-slate-900 tracking-tight">
                          Plan My Trip
                        </h2>
                        <p className="mt-2 text-[15px] text-slate-600 font-medium">
                          Fill details and get a customized luxury itinerary.
                        </p>
                      </motion.div>

                      {(packageTitle || packagePrice) && (
                        <motion.div variants={itemVariants} className="mt-6 inline-flex items-center gap-3 rounded-2xl border border-indigo-100 bg-white px-4 py-3 shadow-sm">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-50">
                            <MapPin className="h-4 w-4 text-indigo-600" />
                          </div>
                          <div>
                            <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Selected</span>
                            <span className="font-bold text-slate-800">{packageTitle || "Selected Package"}</span>
                          </div>
                          {packagePrice && (
                            <div className="ml-4 pl-4 border-l border-slate-100">
                              <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Price</span>
                              <span className="font-bold text-indigo-600">{packagePrice}</span>
                            </div>
                          )}
                        </motion.div>
                      )}

                      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                          <motion.div variants={itemVariants} className="relative">
                            <label htmlFor="fullName" className={labelClass}>Full name</label>
                            <div className="relative">
                              <User className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 z-10" />
                              <input
                                type="text"
                                id="fullName"
                                value={formData.fullName}
                                onChange={(e) => handleInputChange("fullName", e.target.value)}
                                className={`${inputClass} ${errors.fullName ? "!border-red-500 focus:!shadow-[0_0_0_4px_rgba(239,68,68,0.1)]" : ""}`}
                                placeholder="Your name"
                                disabled={isSubmitting}
                              />
                            </div>
                            <FieldError message={errors.fullName} />
                          </motion.div>

                          <motion.div variants={itemVariants} className="relative">
                            <label htmlFor="email" className={labelClass}>Email address</label>
                            <div className="relative">
                              <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 z-10" />
                              <input
                                type="email"
                                id="email"
                                value={formData.email}
                                onChange={(e) => handleInputChange("email", e.target.value)}
                                className={`${inputClass} ${errors.email ? "!border-red-500 focus:!shadow-[0_0_0_4px_rgba(239,68,68,0.1)]" : ""}`}
                                placeholder="you@example.com"
                                disabled={isSubmitting}
                              />
                            </div>
                            <FieldError message={errors.email} />
                          </motion.div>
                        </div>

                        <motion.div variants={itemVariants} className="relative">
                          <label htmlFor="phone" className={labelClass}>Phone number</label>
                          <div className={`package-phone-input lead-phone-input flex gap-2 h-[48px] rounded-xl border bg-white/60 backdrop-blur-md transition-all duration-300 focus-within:bg-white focus-within:shadow-[0_0_0_4px_rgba(59,130,246,0.1)] focus-within:border-blue-500 ${errors.phone ? 'border-red-500' : 'border-slate-200/80'}`} data-dial-code={phoneDialCode}>
                            <PhoneInput
                              country="in"
                              containerStyle={{ width: 88, height: '100%', flexShrink: 0 }}
                              onChange={(value, data) => {
                                if (data && typeof data === "object" && "dialCode" in data) {
                                  const dialCode = (data as { dialCode?: string }).dialCode;
                                  if (dialCode) setPhoneDialCode(`+${dialCode}`);
                                }
                              }}
                              preferredCountries={["in", "ae", "us", "gb"]}
                              enableSearch={false}
                              disableSearchIcon
                              inputStyle={{ display: 'none' }}
                              buttonStyle={{
                                position: 'relative',
                                border: 'none',
                                background: 'transparent',
                                width: '100%',
                                height: '100%',
                                padding: '0 0 0 12px',
                                borderRadius: '12px 0 0 12px'
                              }}
                            />
                            <div className="relative flex-1 h-full border-l border-slate-200/60">
                              <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 z-10" />
                              <input
                                type="tel"
                                id="phone"
                                value={formData.phone}
                                onChange={(e) => handleInputChange("phone", e.target.value)}
                                className="w-full h-full bg-transparent pl-10 pr-4 text-[13px] sm:text-sm text-slate-800 outline-none placeholder:text-slate-400"
                                placeholder="Phone number"
                                disabled={isSubmitting}
                              />
                            </div>
                          </div>
                          <FieldError message={errors.phone} />
                        </motion.div>

                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                          <motion.div variants={itemVariants} className="relative">
                            <label htmlFor="destination" className={labelClass}>Destination</label>
                            <div className="relative">
                              <MapPin className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 z-10" />
                              <input
                                type="text"
                                id="destination"
                                value={formData.destination}
                                onChange={(e) => handleInputChange("destination", e.target.value)}
                                className={`${inputClass} ${errors.destination ? "!border-red-500 focus:!shadow-[0_0_0_4px_rgba(239,68,68,0.1)]" : ""}`}
                                placeholder="Where do you want to go?"
                                disabled={isSubmitting}
                              />
                            </div>
                            <FieldError message={errors.destination} />
                          </motion.div>

                          <motion.div variants={itemVariants} className="relative">
                            <label className={labelClass}>Travel Date</label>
                            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                              <PopoverTrigger asChild>
                                <button
                                  type="button"
                                  className={`w-full h-[48px] rounded-xl border border-slate-200/80 bg-white/60 backdrop-blur-md px-4 py-3 text-left text-[13px] sm:text-sm outline-none transition-all duration-300 hover:bg-white focus:border-blue-500 focus:bg-white focus:shadow-[0_0_0_4px_rgba(59,130,246,0.1)] flex items-center gap-3 cursor-pointer ${errors.travelDate ? "!border-red-500" : ""}`}
                                >
                                  <Calendar className={`h-4 w-4 ${formData.travelDate ? "text-blue-600" : "text-slate-400"}`} />
                                  <span className={formData.travelDate ? "text-slate-800 font-medium" : "text-slate-400"}>
                                    {formData.travelDate
                                      ? format(formData.travelDate, "MMM dd, yyyy")
                                      : "Pick a date"}
                                  </span>
                                </button>
                              </PopoverTrigger>
                              <PopoverContent className="z-[9999] w-auto p-0 !rounded-xl border-slate-200 shadow-xl" align="start">
                                <CalendarComponent
                                  mode="single"
                                  selected={formData.travelDate}
                                  classNames={{ day_button: "cursor-pointer rounded-full" }}
                                  onSelect={(d) => {
                                    handleInputChange("travelDate", d || undefined);
                                    setTimeout(() => setCalendarOpen(false), 150);
                                  }}
                                  disabled={{ before: new Date() }}
                                />
                              </PopoverContent>
                            </Popover>
                            <FieldError message={errors.travelDate} />
                          </motion.div>
                        </div>

                        <motion.div variants={itemVariants} className="relative">
                          <label htmlFor="message" className={labelClass}>Travel requirements</label>
                          <div className="relative">
                            <MessageSquare className="pointer-events-none absolute left-4 top-4 h-4 w-4 text-slate-400 z-10" />
                            <textarea
                              id="message"
                              value={formData.message}
                              onChange={(e) => handleInputChange("message", e.target.value)}
                              className={`${textAreaClass} ${errors.message ? "!border-red-500 focus:!shadow-[0_0_0_4px_rgba(239,68,68,0.1)]" : ""}`}
                              placeholder="Dates, number of travelers, preferences, etc."
                              disabled={isSubmitting}
                            />
                          </div>
                          <FieldError message={errors.message} />
                        </motion.div>

                        <motion.div variants={itemVariants}>
                          <p className="text-center text-[11px] font-medium leading-relaxed text-slate-500 px-4">
                            By proceeding, you agree to our{" "}
                            <Link
                              href="/terms-and-conditions"
                              className="font-bold text-slate-700 underline underline-offset-2 hover:text-blue-600 transition-colors"
                            >
                              Terms of Use
                            </Link>{" "}
                            and confirm you have read our{" "}
                            <Link
                              href="/privacy-policy"
                              className="font-bold text-slate-700 underline underline-offset-2 hover:text-blue-600 transition-colors"
                            >
                              Privacy and Cookie Statement
                            </Link>
                            .
                          </p>

                          <motion.button
                            whileHover={{ scale: 1.01, y: -1 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            disabled={isSubmitting}
                            className="relative mt-6 flex w-full cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-4 text-[15px] font-bold text-white shadow-[0_8px_20px_rgba(59,130,246,0.3)] transition-all hover:shadow-[0_12px_24px_rgba(59,130,246,0.4)] disabled:cursor-not-allowed disabled:opacity-70 group"
                          >
                            <div className="absolute inset-0 bg-white/20 translate-y-full transition-transform duration-300 group-hover:translate-y-0" />
                            {isSubmitting ? (
                              <>
                                <Loader2 className="h-5 w-5 animate-spin" />
                                <span>Crafting Your Plan...</span>
                              </>
                            ) : (
                              <>
                                <span>Get Custom Plan</span>
                                <Sparkles className="h-4 w-4" />
                              </>
                            )}
                          </motion.button>
                        </motion.div>
                      </form>
                    </motion.div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

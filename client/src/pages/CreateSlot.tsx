import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertCircle,
  Building2,
  CalendarDays,
  CheckCircle2,
  Clock3,
  ExternalLink,
  Hospital,
  Home,
  MapPin,
  Navigation,
  PawPrint,
  Stethoscope,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import api from "../lib/api";
import { slotSchema } from "../schemas/slot.schema";
import type { SlotFormData } from "../schemas/slot.schema";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import { openLocationInMaps } from "../lib/location";

export default function CreateSlot() {
  const navigate = useNavigate();

  const [serverError, setServerError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SlotFormData>({
    resolver: zodResolver(slotSchema),
    defaultValues: {
      appointmentType: undefined,
      appointmentLocationName: "",
      appointmentAddress: "",
      appointmentLatitude: undefined,
      appointmentLongitude: undefined,
    },
  });

  const appointmentType = watch("appointmentType");
  const address = watch("appointmentAddress");
  const latitude = watch("appointmentLatitude");
  const longitude = watch("appointmentLongitude");

  const useCurrentLocation = () => {
    setLocationError("");

    if (!navigator.geolocation) {
      setLocationError(
        "Location services are not supported by your browser."
      );
      return;
    }

    setLocationLoading(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        setValue("appointmentLatitude", lat, {
          shouldValidate: true,
        });

        setValue("appointmentLongitude", lon, {
          shouldValidate: true,
        });

        try {
          const response = await api.get(
            "/location/reverse-geocode",
            {
              params: {
                lat,
                lon,
              },
            }
          );

          const data = response.data;

          setValue(
            "appointmentLocationName",
            data.locationName || "",
            {
              shouldValidate: true,
            }
          );

          setValue(
            "appointmentAddress",
            data.address || data.displayName || "",
            {
              shouldValidate: true,
            }
          );
        } catch {
          setLocationError(
            "Location detected, but we couldn't find the address. You can enter it manually."
          );
        } finally {
          setLocationLoading(false);
        }
      },
      (error) => {
        setLocationLoading(false);

        if (error.code === error.PERMISSION_DENIED) {
          setLocationError(
            "Location permission was denied. Please allow location access or enter the address manually."
          );
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          setLocationError(
            "Your current location could not be determined."
          );
        } else {
          setLocationError(
            "Unable to detect your current location."
          );
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  };

  const onSubmit = async (data: SlotFormData) => {
    try {
      setServerError("");
      setSuccessMessage("");

      await api.post("/vets/slots", {
        startTime: new Date(data.startTime).toISOString(),
        endTime: new Date(data.endTime).toISOString(),
        appointmentType: data.appointmentType,

        appointmentLocationName:
          data.appointmentType === "FARM_VISIT"
            ? null
            : data.appointmentLocationName || null,

        appointmentAddress:
          data.appointmentType === "FARM_VISIT"
            ? null
            : data.appointmentAddress || null,

        appointmentLatitude:
          data.appointmentType === "FARM_VISIT"
            ? null
            : data.appointmentLatitude ?? null,

        appointmentLongitude:
          data.appointmentType === "FARM_VISIT"
            ? null
            : data.appointmentLongitude ?? null,
      });

      setSuccessMessage(
        "Appointment slot created successfully."
      );
    } catch (error: any) {
      setServerError(
        error?.response?.data?.error ||
          "Failed to create appointment slot."
      );
    }
  };

  const handleCreateAnother = () => {
    reset({
      appointmentType: undefined,
      appointmentLocationName: "",
      appointmentAddress: "",
      appointmentLatitude: undefined,
      appointmentLongitude: undefined,
    });

    setSuccessMessage("");
    setServerError("");
    setLocationError("");
  };

  if (successMessage) {
    return (
      <div className="min-h-screen bg-[#F8FBF7] px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl">
          <div className="mb-7">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E8F5F7] text-[#0D5E72]">
                <CalendarDays size={22} />
              </div>

              <div>
                <p className="text-sm font-semibold text-[#0D5E72]">
                  Vet Schedule
                </p>

                <h1 className="text-2xl font-bold text-[#1F2937] sm:text-3xl">
                  Create Appointment Slot
                </h1>
              </div>
            </div>
          </div>

          <Card className="overflow-hidden">
            <div className="px-5 py-10 text-center sm:px-8 sm:py-14">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600">
                <CheckCircle2 size={36} />
              </div>

              <h2 className="mt-5 text-2xl font-bold text-[#1F2937]">
                Slot Created Successfully
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
                Your appointment slot has been created and is now
                available for farmers to book.
              </p>

              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleCreateAnother}
                  icon={<CalendarDays size={17} />}
                >
                  Create Another Slot
                </Button>

                <Button
                  type="button"
                  onClick={() => navigate("/vet/appointments")}
                  icon={<CalendarDays size={17} />}
                >
                  View Appointments
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FBF7] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-7">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E8F5F7] text-[#0D5E72]">
              <CalendarDays size={22} />
            </div>

            <div>
              <p className="text-sm font-semibold text-[#0D5E72]">
                Vet Schedule
              </p>

              <h1 className="text-2xl font-bold text-[#1F2937] sm:text-3xl">
                Create Appointment Slot
              </h1>
            </div>
          </div>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500 sm:text-base">
            Set your availability and choose how the appointment
            will take place.
          </p>
        </div>

        {serverError && (
          <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <AlertCircle
              size={18}
              className="mt-0.5 shrink-0"
            />
            <span>{serverError}</span>
          </div>
        )}

        <Card className="overflow-hidden">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="p-5 sm:p-7 lg:p-8">
              <div className="mb-8">
                <div className="mb-5 flex items-center gap-2">
                  <Clock3
                    size={19}
                    className="text-[#0D5E72]"
                  />

                  <div>
                    <h2 className="font-bold text-[#1F2937]">
                      Appointment date & time
                    </h2>

                    <p className="text-sm text-gray-500">
                      Choose when this slot will be available.
                    </p>
                  </div>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Start date & time
                    </label>

                    <div className="relative">
                      <CalendarDays
                        size={18}
                        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                      />

                      <input
                        type="datetime-local"
                        {...register("startTime")}
                        className="h-12 w-full rounded-xl border border-gray-300 bg-white pl-10 pr-3 text-sm text-gray-700 outline-none transition focus:border-[#0D5E72] focus:ring-2 focus:ring-[#0D5E72]/10"
                      />
                    </div>

                    {errors.startTime && (
                      <p className="mt-2 text-sm text-red-600">
                        {errors.startTime.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      End date & time
                    </label>

                    <div className="relative">
                      <CalendarDays
                        size={18}
                        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                      />

                      <input
                        type="datetime-local"
                        {...register("endTime")}
                        className="h-12 w-full rounded-xl border border-gray-300 bg-white pl-10 pr-3 text-sm text-gray-700 outline-none transition focus:border-[#0D5E72] focus:ring-2 focus:ring-[#0D5E72]/10"
                      />
                    </div>

                    {errors.endTime && (
                      <p className="mt-2 text-sm text-red-600">
                        {errors.endTime.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="mb-8 border-t border-gray-100 pt-8">
                <div className="mb-5 flex items-center gap-2">
                  <Stethoscope
                    size={19}
                    className="text-[#0D5E72]"
                  />

                  <div>
                    <h2 className="font-bold text-[#1F2937]">
                      Appointment type
                    </h2>

                    <p className="text-sm text-gray-500">
                      Choose where and how you will meet the farmer.
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <label
                    className={`relative cursor-pointer rounded-xl border-2 p-4 transition ${
                      appointmentType === "CLINIC"
                        ? "border-[#0D5E72] bg-[#E8F5F7]"
                        : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                  >
                    <input
                      type="radio"
                      value="CLINIC"
                      {...register("appointmentType")}
                      className="sr-only"
                    />

                    <div className="flex items-start gap-3">
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                          appointmentType === "CLINIC"
                            ? "bg-[#0D5E72] text-white"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        <Hospital size={20} />
                      </div>

                      <div className="pr-5">
                        <p className="font-semibold text-[#1F2937]">
                          Clinic / Hospital
                        </p>

                        <p className="mt-1 text-xs leading-5 text-gray-500">
                          Farmer visits your clinic or hospital.
                        </p>
                      </div>
                    </div>

                    {appointmentType === "CLINIC" && (
                      <CheckCircle2
                        size={18}
                        className="absolute right-3 top-3 text-[#0D5E72]"
                      />
                    )}
                  </label>

                  <label
                    className={`relative cursor-pointer rounded-xl border-2 p-4 transition ${
                      appointmentType === "FARM_VISIT"
                        ? "border-[#0D5E72] bg-[#E8F5F7]"
                        : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                  >
                    <input
                      type="radio"
                      value="FARM_VISIT"
                      {...register("appointmentType")}
                      className="sr-only"
                    />

                    <div className="flex items-start gap-3">
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                          appointmentType === "FARM_VISIT"
                            ? "bg-[#0D5E72] text-white"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        <PawPrint size={20} />
                      </div>

                      <div className="pr-5">
                        <p className="font-semibold text-[#1F2937]">
                          Farm Visit
                        </p>

                        <p className="mt-1 text-xs leading-5 text-gray-500">
                          You visit the farmer's location.
                        </p>
                      </div>
                    </div>

                    {appointmentType === "FARM_VISIT" && (
                      <CheckCircle2
                        size={18}
                        className="absolute right-3 top-3 text-[#0D5E72]"
                      />
                    )}
                  </label>

                  <label
                    className={`relative cursor-pointer rounded-xl border-2 p-4 transition ${
                      appointmentType === "OTHER"
                        ? "border-[#0D5E72] bg-[#E8F5F7]"
                        : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                  >
                    <input
                      type="radio"
                      value="OTHER"
                      {...register("appointmentType")}
                      className="sr-only"
                    />

                    <div className="flex items-start gap-3">
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                          appointmentType === "OTHER"
                            ? "bg-[#0D5E72] text-white"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        <Building2 size={20} />
                      </div>

                      <div className="pr-5">
                        <p className="font-semibold text-[#1F2937]">
                          Other Location
                        </p>

                        <p className="mt-1 text-xs leading-5 text-gray-500">
                          Use another location of your choice.
                        </p>
                      </div>
                    </div>

                    {appointmentType === "OTHER" && (
                      <CheckCircle2
                        size={18}
                        className="absolute right-3 top-3 text-[#0D5E72]"
                      />
                    )}
                  </label>
                </div>

                {errors.appointmentType && (
                  <p className="mt-3 text-sm text-red-600">
                    {errors.appointmentType.message}
                  </p>
                )}
              </div>

              {appointmentType && (
                <div className="border-t border-gray-100 pt-8">
                  {appointmentType === "FARM_VISIT" ? (
                    <div className="rounded-xl border border-[#B7DDE3] bg-[#F1FAFB] p-5">
                      <div className="flex items-start gap-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#D9F0F3] text-[#0D5E72]">
                          <Home size={20} />
                        </div>

                        <div>
                          <h2 className="font-bold text-[#1F2937]">
                            Farmer will provide the visit location
                          </h2>

                          <p className="mt-1 text-sm leading-6 text-gray-600">
                            You don't need to enter a location for a
                            farm visit. When booking this slot, the
                            farmer will choose the actual location where
                            you should visit.
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-2">
                          <MapPin
                            size={19}
                            className="text-[#0D5E72]"
                          />

                          <div>
                            <h2 className="font-bold text-[#1F2937]">
                              Appointment location
                            </h2>

                            <p className="text-sm text-gray-500">
                              Where should the farmer come?
                            </p>
                          </div>
                        </div>

                        <Button
                          type="button"
                          variant="secondary"
                          icon={<Navigation size={16} />}
                          loading={locationLoading}
                          onClick={useCurrentLocation}
                        >
                          Use Current Location
                        </Button>
                      </div>

                      {locationError && (
                        <div className="mb-5 flex items-start gap-2 rounded-lg bg-amber-50 p-3 text-sm text-amber-700">
                          <AlertCircle
                            size={17}
                            className="mt-0.5 shrink-0"
                          />

                          <span>{locationError}</span>
                        </div>
                      )}

                      <div className="grid gap-5">
                        <div>
                          <label className="mb-2 block text-sm font-semibold text-gray-700">
                            Location name
                          </label>

                          <input
                            type="text"
                            placeholder="e.g. Shree Vet Care Clinic"
                            {...register("appointmentLocationName")}
                            className="h-12 w-full rounded-xl border border-gray-300 bg-white px-4 text-sm text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-[#0D5E72] focus:ring-2 focus:ring-[#0D5E72]/10"
                          />

                          {errors.appointmentLocationName && (
                            <p className="mt-2 text-sm text-red-600">
                              {errors.appointmentLocationName.message}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="mb-2 block text-sm font-semibold text-gray-700">
                            Full address
                          </label>

                          <textarea
                            rows={3}
                            placeholder="Enter the complete appointment address"
                            {...register("appointmentAddress")}
                            className="w-full resize-none rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-[#0D5E72] focus:ring-2 focus:ring-[#0D5E72]/10"
                          />

                          {errors.appointmentAddress && (
                            <p className="mt-2 text-sm text-red-600">
                              {errors.appointmentAddress.message}
                            </p>
                          )}
                        </div>
                      </div>

                      {latitude !== undefined &&
                        latitude !== null &&
                        longitude !== undefined &&
                        longitude !== null && (
                          <div className="mt-5 flex flex-col gap-4 rounded-xl border border-green-200 bg-green-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-start gap-3">
                              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-700">
                                <CheckCircle2 size={17} />
                              </div>

                              <div>
                                <p className="text-sm font-semibold text-green-800">
                                  Location detected
                                </p>

                                <p className="mt-1 text-xs text-green-700">
                                  Coordinates:{" "}
                                  {latitude.toFixed(6)},{" "}
                                  {longitude.toFixed(6)}
                                </p>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() =>
                                openLocationInMaps(
                                  latitude,
                                  longitude,
                                  address
                                )
                              }
                              className="inline-flex items-center gap-2 self-start text-sm font-semibold text-[#0D5E72] transition hover:text-[#094A5A] hover:underline sm:self-auto"
                            >
                              <MapPin size={16} />
                              Open in Maps
                              <ExternalLink size={14} />
                            </button>
                          </div>
                        )}
                    </>
                  )}
                </div>
              )}
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-gray-100 bg-gray-50/70 px-5 py-5 sm:flex-row sm:items-center sm:justify-end sm:px-7 lg:px-8">
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate(-1)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                loading={isSubmitting}
                icon={<CalendarDays size={17} />}
              >
                Create Slot
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
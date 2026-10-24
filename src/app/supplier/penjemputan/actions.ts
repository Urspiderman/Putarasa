
"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export type PickupActionState = {
  success: boolean;
  message: string;
};

export async function createPickupRequest(
  _previousState: PickupActionState,
  formData: FormData
): Promise<PickupActionState> {
  const { user } = await requireRole("supplier");
  const supabase = await createClient();

  const wasteType = String(
    formData.get("waste_type") ?? ""
  ).trim();

  const weightRaw = String(
    formData.get("estimated_weight_kg") ?? ""
  ).trim();

  const pickupDate = String(
    formData.get("pickup_date") ?? ""
  ).trim();

  const pickupTime = String(
    formData.get("pickup_time") ?? ""
  ).trim();

  const address = String(
    formData.get("address") ?? ""
  ).trim();

  const notes = String(
    formData.get("notes") ?? ""
  ).trim();

  const weight = Number(weightRaw);

  if (!wasteType || wasteType.length > 100) {
    return {
      success: false,
      message: "Pilih jenis sampah yang valid.",
    };
  }

  if (
    !weightRaw ||
    !Number.isFinite(weight) ||
    weight <= 0 ||
    weight > 100000
  ) {
    return {
      success: false,
      message: "Masukkan estimasi berat yang valid.",
    };
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(pickupDate)) {
    return {
      success: false,
      message: "Tanggal penjemputan tidak valid.",
    };
  }

  const parsedDate = new Date(
    `${pickupDate}T00:00:00Z`
  );

  if (
    Number.isNaN(parsedDate.getTime()) ||
    parsedDate.toISOString().slice(0, 10) !== pickupDate
  ) {
    return {
      success: false,
      message: "Tanggal penjemputan tidak valid.",
    };
  }

  const today = new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "Asia/Jakarta",
  }).format(new Date());

  if (pickupDate < today) {
    return {
      success: false,
      message:
        "Tanggal penjemputan tidak boleh sebelum hari ini.",
    };
  }

  if (
    pickupTime &&
    !/^([01]\d|2[0-3]):[0-5]\d$/.test(pickupTime)
  ) {
    return {
      success: false,
      message: "Format waktu tidak valid.",
    };
  }

  if (address.length < 10 || address.length > 1000) {
    return {
      success: false,
      message:
        "Alamat harus berisi 10 sampai 1000 karakter.",
    };
  }

  if (notes.length > 2000) {
    return {
      success: false,
      message: "Catatan terlalu panjang.",
    };
  }

  const { error } = await supabase
    .from("pickup_requests")
    .insert({
      supplier_id: user.id,
      courier_id: null,
      waste_type: wasteType,
      estimated_weight_kg: weight,
      actual_weight_kg: null,
      pickup_date: pickupDate,
      pickup_time: pickupTime || null,
      address,
      notes: notes || null,
      status: "pending",
    });

  if (error) {
    console.error(
      "Gagal membuat permintaan penjemputan:",
      error.message
    );

    return {
      success: false,
      message:
        "Permintaan gagal disimpan. Periksa data dan coba lagi.",
    };
  }

  revalidatePath("/supplier/penjemputan");
  revalidatePath("/supplier/dashboard");
  revalidatePath("/supplier/jadwal");
  revalidatePath("/supplier/riwayat");

  return {
    success: true,
    message: "Permintaan penjemputan berhasil diajukan!",
  };
}

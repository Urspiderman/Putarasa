
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useEffect,
  useMemo,
  useState,
  useTransition,
  type FormEvent,
} from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  Leaf,
  MapPin,
  Package,
  Phone,
  ShieldCheck,
  ShoppingBag,
  Sprout,
  Truck,
  UserRound,
} from "lucide-react";

import {
  createCheckoutOrder as createBuyerCheckoutOrder,
} from "@/app/buyer/checkout/actions";

import {
  createCheckoutOrder as createSupplierCheckoutOrder,
} from "@/app/supplier/checkout/actions";

type CheckoutItem = {
  cartItemId: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  unit: string;
  imageUrl: string | null;
  isActive: boolean;
  stock: number;
};

type Props = {
  initialItems: CheckoutItem[];
  defaultName: string;
  defaultPhone: string;
  defaultAddress: string;
  role?: "buyer" | "supplier";
};

const rupiah = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);

export default function CheckoutWorkspace({
  initialItems,
  defaultName,
  defaultPhone,
  defaultAddress,
  role = "buyer",
}: Props) {
  const router = useRouter();

  const [isPending, startTransition] = useTransition();

  const basePath = `/${role}`;

  const storageKey =
    role === "supplier"
      ? "putarasa_supplier_checkout_items"
      : "putarasa_checkout_items";

  const [name, setName] = useState(defaultName);
  const [phone, setPhone] = useState(defaultPhone);
  const [address, setAddress] = useState(defaultAddress);
  const [notes, setNotes] = useState("");

  const [selectedIds, setSelectedIds] = useState<
    string[] | null
  >(null);

  const [error, setError] = useState("");

  useEffect(() => {
    setName(defaultName);
    setPhone(defaultPhone);
    setAddress(defaultAddress);
  }, [defaultName, defaultPhone, defaultAddress]);

  useEffect(() => {
    // Mendukung key lama yang digunakan keranjang Supplier.
    const saved =
      sessionStorage.getItem(storageKey) ??
      (role === "supplier"
        ? sessionStorage.getItem("putarasa_checkout_items")
        : null);

    if (!saved) {
      setSelectedIds(
        initialItems
          .filter(
            (item) =>
              item.isActive &&
              item.quantity > 0 &&
              item.stock >= item.quantity
          )
          .map((item) => item.cartItemId)
      );
      return;
    }

    try {
      const parsed: unknown = JSON.parse(saved);

      if (!Array.isArray(parsed)) {
        throw new Error("Pilihan tidak valid");
      }

      const ids = parsed
        .filter(
          (
            value
          ): value is {
            cartItemId: string;
            productId: string;
          } =>
            typeof value === "object" &&
            value !== null &&
            "cartItemId" in value &&
            typeof value.cartItemId === "string" &&
            "productId" in value &&
            typeof value.productId === "string"
        )
        .filter((savedItem) =>
          initialItems.some(
            (item) =>
              item.cartItemId === savedItem.cartItemId &&
              item.productId === savedItem.productId
          )
        )
        .map((item) => item.cartItemId);

      setSelectedIds([...new Set(ids)]);
    } catch {
      setSelectedIds([]);
      setError(
        "Pilihan checkout tidak valid. Silakan pilih ulang produk dari keranjang."
      );
    }
  }, [initialItems, role, storageKey]);

  const selectedItems = useMemo(() => {
    if (selectedIds === null) return [];

    return initialItems.filter((item) =>
      selectedIds.includes(item.cartItemId)
    );
  }, [initialItems, selectedIds]);

  const invalidItems = selectedItems.filter(
    (item) =>
      !item.isActive ||
      item.quantity <= 0 ||
      item.quantity > item.stock
  );

  const subtotal = selectedItems.reduce(
    (total, item) =>
      total + item.price * item.quantity,
    0
  );

  const totalQuantity = selectedItems.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const canCheckout =
    selectedIds !== null &&
    selectedItems.length > 0 &&
    invalidItems.length === 0 &&
    !isPending;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canCheckout) {
      setError(
        "Periksa kembali pilihan produk dan ketersediaan stok."
      );
      return;
    }

    if (name.trim().length < 2 || name.trim().length > 150) {
      setError("Nama penerima harus terdiri dari 2–150 karakter.");
      return;
    }

    if (!/^\+?[0-9\s()-]{8,30}$/.test(phone.trim())) {
      setError("Nomor telepon tidak valid.");
      return;
    }

    if (
      address.trim().length < 10 ||
      address.trim().length > 1000
    ) {
      setError(
        "Alamat pengiriman harus terdiri dari 10–1000 karakter."
      );
      return;
    }

    if (notes.trim().length > 2000) {
      setError("Catatan terlalu panjang.");
      return;
    }

    setError("");

    startTransition(async () => {
      const checkoutAction =
        role === "supplier"
          ? createSupplierCheckoutOrder
          : createBuyerCheckoutOrder;

      try {
        const result = await checkoutAction({
          cartItemIds: selectedItems.map(
            (item) => item.cartItemId
          ),
          customerName: name.trim(),
          customerPhone: phone.trim(),
          shippingAddress: address.trim(),
          notes: notes.trim(),
        });

        if (!result.success || !result.orderId) {
          setError(result.message);
          return;
        }

        sessionStorage.removeItem(storageKey);

        if (role === "supplier") {
          sessionStorage.removeItem(
            "putarasa_checkout_items"
          );
        }

        router.push(
          `${basePath}/pesanan/${result.orderId}`
        );
        router.refresh();
      } catch {
        setError(
          "Terjadi kesalahan saat membuat pesanan. Silakan coba lagi."
        );
      }
    });
  }

  return (
    <main className="mx-auto w-full max-w-[1500px] space-y-7 px-4 pb-16 pt-6 text-[#332417] sm:px-6 lg:px-8">
      {/* BREADCRUMB */}
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <Link
          href={`${basePath}/keranjang`}
          className="inline-flex items-center gap-2 font-bold text-[#47763A] hover:underline"
        >
          <ArrowLeft size={17} />
          Keranjang
        </Link>

        <ChevronRight
          size={16}
          className="text-[#B7A995]"
        />

        <span className="font-bold">Checkout</span>
      </div>

      {/* HEADER */}
      <section>
        <span className="inline-flex items-center gap-2 rounded-full bg-[#FFF0BF] px-4 py-2 text-xs font-black text-[#47763A]">
          <ShoppingBag size={15} />
          CHECKOUT PUTARASA
        </span>

        <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">
          Selesaikan{" "}
          <span className="text-[#47763A]">
            Pesananmu
          </span>
        </h1>

        <p className="mt-2 text-sm leading-6 text-[#8C7A65]">
          Lengkapi informasi penerima dan alamat pengiriman.
          Data yang tersedia dari profil akun akan terisi
          otomatis dan tetap bisa kamu ubah.
        </p>
      </section>

      {/* ERROR */}
      {error && (
        <div
          role="alert"
          className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700"
        >
          {error}
        </div>
      )}

      {selectedIds === null ? (
        <div className="rounded-3xl bg-white p-10 text-center text-sm text-[#8C7A65]">
          Menyiapkan checkout...
        </div>
      ) : selectedItems.length === 0 ? (
        <section className="rounded-[30px] border border-[#EFE5D4] bg-white px-6 py-16 text-center">
          <ShoppingBag
            size={52}
            className="mx-auto text-[#47763A]"
          />

          <h2 className="mt-5 text-2xl font-black">
            Belum Ada Produk untuk Checkout
          </h2>

          <p className="mt-3 text-sm text-[#8C7A65]">
            Pilih produk dari keranjang terlebih dahulu.
          </p>

          <Link
            href={`${basePath}/keranjang`}
            className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-[#47763A] px-6 py-4 text-sm font-black text-white"
          >
            Kembali ke Keranjang
            <ArrowRight size={18} />
          </Link>
        </section>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_390px]"
        >
          {/* KOLOM KIRI */}
          <div className="space-y-5">
            {/* INFORMASI PENERIMA */}
            <section className="rounded-[26px] border border-[#EFE5D4] bg-white p-6 shadow-sm sm:p-8">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-[#EAF3DF] p-3">
                  <UserRound
                    size={23}
                    className="text-[#47763A]"
                  />
                </div>

                <div>
                  <h2 className="text-lg font-black">
                    Informasi Penerima
                  </h2>

                  <p className="text-xs text-[#8C7A65]">
                    Data penerima dan kontak pengiriman.
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <label className="block space-y-2">
                  <span className="text-sm font-extrabold">
                    Nama Penerima
                  </span>

                  <div className="relative">
                    <UserRound
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8C7A65]"
                    />

                    <input
                      type="text"
                      required
                      minLength={2}
                      maxLength={150}
                      value={name}
                      onChange={(event) =>
                        setName(event.target.value)
                      }
                      placeholder="Nama lengkap penerima"
                      className="w-full rounded-xl border border-[#E8DFD0] bg-[#FFFBF1] py-3.5 pl-11 pr-4 text-sm outline-none focus:border-[#47763A]"
                    />
                  </div>
                </label>

                <label className="block space-y-2">
                  <span className="text-sm font-extrabold">
                    Nomor Telepon
                  </span>

                  <div className="relative">
                    <Phone
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8C7A65]"
                    />

                    <input
                      type="tel"
                      required
                      minLength={8}
                      maxLength={30}
                      value={phone}
                      onChange={(event) =>
                        setPhone(event.target.value)
                      }
                      placeholder="08xxxxxxxxxx"
                      className="w-full rounded-xl border border-[#E8DFD0] bg-[#FFFBF1] py-3.5 pl-11 pr-4 text-sm outline-none focus:border-[#47763A]"
                    />
                  </div>
                </label>
              </div>

              <div className="mt-5 rounded-xl bg-[#F0F7E9] px-4 py-3 text-xs leading-5 text-[#47763A]">
                <CheckCircle2
                  size={16}
                  className="mr-2 inline-block align-middle"
                />
                Informasi penerima dapat disesuaikan
                untuk setiap pesanan.
              </div>
            </section>

            {/* ALAMAT PENGIRIMAN */}
            <section className="rounded-[26px] border border-[#EFE5D4] bg-white p-6 shadow-sm sm:p-8">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-[#FFF0BF] p-3">
                  <MapPin
                    size={23}
                    className="text-[#47763A]"
                  />
                </div>

                <div>
                  <h2 className="text-lg font-black">
                    Alamat Pengiriman
                  </h2>

                  <p className="text-xs text-[#8C7A65]">
                    Pastikan alamat tujuan sudah benar.
                  </p>
                </div>
              </div>

              <label className="mt-6 block space-y-2">
                <span className="text-sm font-extrabold">
                  Alamat Lengkap
                </span>

                <textarea
                  required
                  minLength={10}
                  maxLength={1000}
                  rows={5}
                  value={address}
                  onChange={(event) =>
                    setAddress(event.target.value)
                  }
                  placeholder="Nama jalan, nomor rumah, RT/RW, kelurahan, kecamatan, kota, provinsi, dan kode pos"
                  className="w-full resize-none rounded-xl border border-[#E8DFD0] bg-[#FFFBF1] px-4 py-3.5 text-sm leading-6 outline-none focus:border-[#47763A]"
                />
              </label>

              <p className="mt-3 text-xs leading-5 text-[#8C7A65]">
                Isi alamat tujuan pengiriman dengan lengkap
                agar pesanan mudah diproses.
              </p>

              <label className="mt-5 block space-y-2">
                <span className="text-sm font-extrabold">
                  Catatan Pesanan
                  <span className="ml-2 font-normal text-[#9A8974]">
                    (Opsional)
                  </span>
                </span>

                <textarea
                  rows={3}
                  maxLength={2000}
                  value={notes}
                  onChange={(event) =>
                    setNotes(event.target.value)
                  }
                  placeholder="Contoh: Patokan rumah atau instruksi pengiriman."
                  className="w-full resize-none rounded-xl border border-[#E8DFD0] bg-[#FFFBF1] px-4 py-3.5 text-sm leading-6 outline-none focus:border-[#47763A]"
                />
              </label>
            </section>

            {/* STATUS PEMBAYARAN */}
            <section className="rounded-[26px] border border-[#EFE5D4] bg-white p-6 shadow-sm sm:p-8">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-[#EAF3DF] p-3">
                  <CreditCard
                    size={23}
                    className="text-[#47763A]"
                  />
                </div>

                <div>
                  <h2 className="text-lg font-black">
                    Status Pembayaran
                  </h2>

                  <p className="text-xs text-[#8C7A65]">
                    Informasi pembayaran pesanan.
                  </p>
                </div>
              </div>

              <div className="mt-6 rounded-2xl border border-[#DCE9D1] bg-[#F0F7E9] p-5">
                <div className="flex items-start gap-3">
                  <CheckCircle2
                    size={22}
                    className="shrink-0 text-[#47763A]"
                  />

                  <div>
                    <h3 className="font-black">
                      Buat Pesanan Terlebih Dahulu
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-[#74695B]">
                      Pesanan akan tercatat dengan status
                      belum dibayar. Proses pembayaran
                      dilakukan setelah pesanan dibuat.
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* KOLOM KANAN */}
          <aside className="space-y-4 lg:sticky lg:top-28">
            <section className="rounded-[26px] border border-[#EFE5D4] bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-[#FFF0BF] p-3">
                  <Package
                    size={23}
                    className="text-[#47763A]"
                  />
                </div>

                <div>
                  <h2 className="text-lg font-black">
                    Ringkasan Pesanan
                  </h2>

                  <p className="text-xs text-[#8C7A65]">
                    {selectedItems.length} produk dipilih
                  </p>
                </div>
              </div>

              <div className="mt-6 max-h-[320px] space-y-4 overflow-y-auto pr-1">
                {selectedItems.map((item) => {
                  const valid =
                    item.isActive &&
                    item.quantity > 0 &&
                    item.quantity <= item.stock;

                  return (
                    <div
                      key={item.cartItemId}
                      className="flex gap-3 border-b border-[#F2EADF] pb-4 last:border-b-0"
                    >
                      <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#EAF3DF]">
                        {item.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <Sprout
                            size={29}
                            className="text-[#47763A]"
                          />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-2 text-sm font-black">
                          {item.name}
                        </p>

                        <p className="mt-1 text-xs text-[#8C7A65]">
                          {item.quantity} {item.unit}
                        </p>

                        <p className="mt-1 text-sm font-black text-[#47763A]">
                          {rupiah(
                            item.price * item.quantity
                          )}
                        </p>

                        {!valid && (
                          <p className="mt-1 text-xs font-bold text-red-600">
                            Stok atau produk tidak tersedia.
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-5 space-y-4 border-t border-[#F2EADF] pt-5 text-sm">
                <div className="flex justify-between gap-3">
                  <span className="text-[#8C7A65]">
                    Jumlah Produk
                  </span>

                  <span className="font-extrabold">
                    {totalQuantity}
                  </span>
                </div>

                <div className="flex justify-between gap-3">
                  <span className="text-[#8C7A65]">
                    Subtotal
                  </span>

                  <span className="font-extrabold">
                    {rupiah(subtotal)}
                  </span>
                </div>

                <div className="flex justify-between gap-3">
                  <span className="text-[#8C7A65]">
                    Ongkos Kirim
                  </span>

                  <span className="text-xs font-bold text-[#47763A]">
                    Belum termasuk
                  </span>
                </div>
              </div>

              <div className="mt-5 border-t border-[#F2EADF] pt-5">
                <p className="text-sm font-bold text-[#8C7A65]">
                  Total Produk
                </p>

                <p className="mt-2 text-3xl font-black text-[#47763A]">
                  {rupiah(subtotal)}
                </p>

                <p className="mt-1 text-xs text-[#9A8974]">
                  Belum termasuk ongkos kirim.
                </p>
              </div>

              <button
                type="submit"
                disabled={!canCheckout}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#47763A] px-5 py-4 text-sm font-black text-white transition hover:bg-[#315F2E] disabled:cursor-not-allowed disabled:bg-[#A8B5A1]"
              >
                {isPending
                  ? "Memproses Pesanan..."
                  : "Buat Pesanan Sekarang"}

                <ArrowRight size={19} />
              </button>

              <p className="mt-4 text-center text-xs leading-5 text-[#9A8974]">
                Harga dan stok akan diperiksa kembali
                sebelum pesanan dibuat.
              </p>
            </section>

            <div className="rounded-[24px] bg-[#FFF0BF] p-5">
              <div className="flex items-start gap-3">
                <Leaf
                  size={24}
                  className="shrink-0 text-[#47763A]"
                />

                <div>
                  <h3 className="font-black">
                    Belanja dengan Manfaat
                  </h3>

                  <p className="mt-2 text-xs leading-6 text-[#74695B]">
                    Dukung pemanfaatan sampah organik
                    menjadi produk yang lebih berguna
                    bersama PUTARASA.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-[#EFE5D4] bg-white p-4">
                <ShieldCheck
                  size={23}
                  className="text-[#47763A]"
                />

                <p className="mt-3 text-xs font-black">
                  Data Pesanan
                </p>
              </div>

              <div className="rounded-2xl border border-[#EFE5D4] bg-white p-4">
                <Truck
                  size={23}
                  className="text-[#47763A]"
                />

                <p className="mt-3 text-xs font-black">
                  Pengiriman
                </p>
              </div>
            </div>
          </aside>
        </form>
      )}

      <footer className="border-t border-[#EDE5D6] pt-6 text-center text-xs text-[#9A8974]">
        PUTARASA — Dari Dapur, Untuk Bumi
      </footer>
    </main>
  );
}

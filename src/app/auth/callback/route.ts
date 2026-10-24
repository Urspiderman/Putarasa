
import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { EmailOtpType } from "@supabase/supabase-js";

function safeNext(value: string | null): string {
  if (!value) return "/dashboard";

  if (
    !value.startsWith("/") ||
    value.startsWith("//") ||
    value.includes("\\")
  ) {
    return "/dashboard";
  }

  return value;
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url);

  const code = url.searchParams.get("code");
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type");

  const next = safeNext(url.searchParams.get("next"));
  const supabase = await createClient();

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(
      code
    );

    if (!error) {
      return NextResponse.redirect(new URL(next, url.origin));
    }
  }

  if (tokenHash && type) {
    const allowedTypes: EmailOtpType[] = [
      "signup",
      "invite",
      "magiclink",
      "recovery",
      "email_change",
      "email",
    ];

    if (allowedTypes.includes(type as EmailOtpType)) {
      const { error } = await supabase.auth.verifyOtp({
        token_hash: tokenHash,
        type: type as EmailOtpType,
      });

      if (!error) {
        const destination =
          type === "recovery"
            ? "/auth/reset-password"
            : next;

        return NextResponse.redirect(
          new URL(destination, url.origin)
        );
      }
    }
  }

  return NextResponse.redirect(
    new URL("/auth/login?error=callback", url.origin)
  );
}

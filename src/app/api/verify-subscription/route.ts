// src/app/api/verify-subscription/route.ts
import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get("session_id");

  if (!sessionId) {
    return NextResponse.json(
      { active: false, message: "Missing session_id" },
      { status: 400 }
    );
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["subscription"],
    });

    const subscription = session.subscription;

    if (
      subscription &&
      typeof subscription === "object" &&
      "status" in subscription
    ) {
      const isActive =
        subscription.status === "active" ||
        subscription.status === "trialing";

      return NextResponse.json({ active: isActive });
    } else {
      return NextResponse.json(
        { active: false, message: "No subscription found" },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error("verify-subscription error:", error);
    return NextResponse.json(
      { active: false, message: "Internal error" },
      { status: 500 }
    );
  }
}

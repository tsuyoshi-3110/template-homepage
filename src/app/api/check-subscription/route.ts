// src/app/api/check-subscription/route.ts
import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { adminDb } from "@/lib/firebase-admin"; // ✅ 修正

export async function GET(req: NextRequest) {
  const siteKey = req.nextUrl.searchParams.get("siteKey");

  if (!siteKey) {
    return NextResponse.json({ active: false }, { status: 400 });
  }

  const docSnap = await adminDb.doc(`siteSettings/${siteKey}`).get();

  if (!docSnap.exists) {
    return NextResponse.json({ active: false }, { status: 404 });
  }

  const stripeCustomerId = docSnap.data()?.stripeCustomerId;
  if (!stripeCustomerId) {
    return NextResponse.json({ active: false }, { status: 404 });
  }

  const subscriptions = await stripe.subscriptions.list({
    customer: stripeCustomerId,
    status: "all",
    limit: 5,
  });

  const isActive = subscriptions.data.some(
    (sub) => sub.status === "active" || sub.status === "trialing"
  );

  return NextResponse.json({ active: isActive });
}

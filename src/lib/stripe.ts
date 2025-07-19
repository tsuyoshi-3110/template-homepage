import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  // ← apiVersion は書かない（最新SDKに任せる）
});

export async function isStripeCustomerActive(customerId: string): Promise<boolean> {
  try {
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "all", // キャンセル済みなども含めて取得
      expand: ["data.default_payment_method"],
      limit: 5,
    });

    return subscriptions.data.some(
      (sub) => sub.status === "active" || sub.status === "trialing"
    );
  } catch (error) {
    console.error("[Stripe Payment Check Error]", error);
    return false;
  }
}

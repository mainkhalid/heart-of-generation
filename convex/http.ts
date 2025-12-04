import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";

const http = httpRouter();


http.route({
  path: "/mpesa/callback",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const body = await request.json();
      
      // FIX: Use optional chaining to safely access nested properties and avoid crashes on bad payload
      const stkCallback = body?.Body?.stkCallback;
      
      if (!stkCallback) {
        // Return 200 to M-Pesa to stop retries, even if the payload is invalid
        console.error("M-Pesa callback error: Invalid callback body structure.", { body });
        return new Response(JSON.stringify({ ResultCode: 0, ResultDesc: "Invalid callback received" }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }
      
      const checkoutRequestId = stkCallback.CheckoutRequestID;
      const resultCode = stkCallback.ResultCode;
      
      if (resultCode === 0) {
        // Success
        const callbackMetadata = stkCallback.CallbackMetadata;
        
        // FIX: Use optional chaining and nullish coalescing for safe access to items
        const items: any[] = callbackMetadata?.Item ?? []; 
        
        const receiptNumber = items.find(
          (item: any) => item.Name === "MpesaReceiptNumber"
        )?.Value;
        
        await ctx.runMutation(internal.mpesaInternal.updateDonationStatus, {
          checkoutRequestId,
          status: "completed",
          mpesaReceiptNumber: receiptNumber,
        });
      } else {
        // Failed
        await ctx.runMutation(internal.mpesaInternal.updateDonationStatus, {
          checkoutRequestId,
          status: "failed",
        });
      }
      
      return new Response(JSON.stringify({ ResultCode: 0, ResultDesc: "Success" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error("M-Pesa callback error:", error);
      return new Response(JSON.stringify({ ResultCode: 1, ResultDesc: "Failed" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  }),
});

export default http;  
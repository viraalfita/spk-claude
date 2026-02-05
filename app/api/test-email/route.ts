import { NextResponse } from "next/server";
import { sendTestEmail } from "@/lib/email";

export async function POST(request: Request) {
  try {
    const { to } = await request.json();

    if (!to) {
      return NextResponse.json(
        { error: "Email 'to' is required" },
        { status: 400 }
      );
    }

    const result = await sendTestEmail(to);

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: "Email terkirim!",
        data: result.data,
      });
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error in test-email API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

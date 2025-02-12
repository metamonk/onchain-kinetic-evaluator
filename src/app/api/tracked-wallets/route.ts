import { NextResponse } from "next/server";
import { z } from "zod";

import {
  createTrackedWallet,
  deleteTrackedWallet,
  updateTrackedWallet,
} from "@/lib/api/trackedWallets/mutations";
import { getTrackedWallets } from "@/lib/api/trackedWallets/queries";
import {
  trackedWalletIdSchema,
  insertTrackedWalletParams,
  updateTrackedWalletParams,
} from "@/lib/db/schema/trackedWallets";

export async function GET() {
  try {
    const { trackedWallets } = await getTrackedWallets();
    return NextResponse.json(trackedWallets, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: err }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const validatedData = insertTrackedWalletParams.parse(await req.json());

    const { trackedWallet } = await createTrackedWallet(validatedData);

    return NextResponse.json(trackedWallet, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues }, { status: 400 });
    } else {
      return NextResponse.json({ error: err }, { status: 500 });
    }
  }
}

export async function PUT(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    const validatedData = updateTrackedWalletParams.parse(await req.json());
    const validatedParams = trackedWalletIdSchema.parse({ id });

    const { trackedWallet } = await updateTrackedWallet(validatedParams.id, validatedData);

    return NextResponse.json(trackedWallet, { status: 200 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues }, { status: 400 });
    } else {
      return NextResponse.json(err, { status: 500 });
    }
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    const validatedParams = trackedWalletIdSchema.parse({ id });
    const { trackedWallet } = await deleteTrackedWallet(validatedParams.id);

    return NextResponse.json(trackedWallet, { status: 200 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues }, { status: 400 });
    } else {
      return NextResponse.json(err, { status: 500 });
    }
  }
}

import { NextRequest, NextResponse } from "next/server";

import { withOutboxWrite, editComment, deleteComment } from "@/lib/prisma/api";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    let comment: { mutationId: string; content: string };
    let id: number;
    try {
      comment = await request.json();
      id = Number(params.id);
    } catch (error) {
      return NextResponse.json(
        { message: "failed to read json request body", error },
        { status: 400 }
      );
    }
    const data = await withOutboxWrite(
      editComment,
      comment.mutationId,
      id,
      comment.content
    );
    return NextResponse.json({ data });
  } catch (error) {
    console.error("failed to update comment", error);
    return NextResponse.json(
      { message: "failed to update comment", error },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    let id: number;
    let mutationId: string;
    try {
      id = Number(params.id);
      mutationId = request.headers.get("x-mutation-id") || "missing";
    } catch (error) {
      return NextResponse.json(
        { message: "failed to read :id url parameter", error },
        { status: 400 }
      );
    }
    const data = await withOutboxWrite(deleteComment, mutationId, id);
    return NextResponse.json({ data });
  } catch (error) {
    console.error("failed to delete comment", error);
    return NextResponse.json(
      { message: "failed to delete comment", error },
      { status: 500 }
    );
  }
}

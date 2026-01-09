import { prisma } from "@/lib/prisma";
import { NextResponse, NextRequest } from "next/server";
import { Post } from "@/generated/prisma/client";

export const GET = async (
  req: NextRequest,
  { params }: {params: Promise<{ id: string }> }
) => {
  try {
     const { id: postId } = await params;

    if (Number.isNaN(postId)) {
      return NextResponse.json(
        { error: "不正なIDです" },
        { status: 400 }
      );
    }

    const post = await prisma.post.findUnique({
      where: { id: postId }, // ← 必須
      select: {
        id: true,
        title: true,
        content: true,
        coverImageURL: true,
        createdAt: true,
        categories: {
          select: {
            category: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });


    if (!post) {
      return NextResponse.json(
        { error: "投稿が見つかりません" },
        { status: 404 }
      );
    }

    const formattedPost = {
  id: post.id,
  title: post.title,
  content: post.content,
  coverImage: {
    url: post.coverImageURL,
    width: 1200,
    height: 630,
  },
  categories: post.categories.map((pc) => pc.category),
};

    return NextResponse.json(formattedPost);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "投稿記事の取得に失敗しました" },
      { status: 500 }
    );
  }
};

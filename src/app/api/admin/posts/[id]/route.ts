import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export const DELETE = async (
  req: NextRequest,
  { params }: {params: Promise<{ id: string }> }
) => {
  try {
    const { id: postId } = await params;

    // 存在確認（任意だが推奨）
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { id: true },
    });

    if (!post) {
      return NextResponse.json(
        { error: "投稿が見つかりません" },
        { status: 404 }
      );
    }

    // ★ 本当に削除する処理
    await prisma.post.delete({
      where: { id: postId },
    });

    return NextResponse.json(
      { message: "投稿を削除しました" },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "投稿記事の削除に失敗しました" },
      { status: 500 }
    );
  }
};

export const GET = async (
  req: NextRequest,
  { params }: {params: Promise<{ id: string }> }
) => {
  try {
    const { id: postId } = await params;

    if (!postId) {
      return NextResponse.json(
        { error: "不正なIDです" },
        { status: 400 }
      );
    }

    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: {
        id: true,
        title: true,
        content: true,
        coverImageURL: true,
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

    // ✅ 編集用レスポンス
    const formattedPost = {
      id: post.id,
      title: post.title,
      content: post.content,
      coverImageURL: post.coverImageURL,
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



export const PUT = async (
  req: NextRequest,
  { params }: {params: Promise<{ id: string }> }
) => {
  try {
    const { id: postId } = await params;
    const body = await req.json();

    const {
      title,
      content,
      coverImageURL,
      categoryIds,
    }: {
      title: string;
      content: string;
      coverImageURL?: string;
      categoryIds: string[];
    } = body;


    if (!Array.isArray(categoryIds)) {
      return NextResponse.json(
        { error: "categoryIds が不正です" },
        { status: 400 }
      );
    }

    // 存在するカテゴリだけ取得
    const validCategories = await prisma.category.findMany({
      where: {
        id: { in: categoryIds },
      },
      select: { id: true },
    });

    if (validCategories.length !== categoryIds.length) {
      // 不正なIDが混ざっている
      return NextResponse.json(
        { error: "存在しないカテゴリIDが含まれています" },
        { status: 400 }
      );
    }

    const updatedPost = await prisma.$transaction(async (tx) => {
      // 投稿が存在するか確認しつつ更新
      const post = await tx.post.update({
        where: { id: postId },
        data: {
          title,
          content,
          coverImageURL,
        },
        select: {
          id: true,
          title: true,
          content: true,
          coverImageURL: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      // 中間テーブルを一旦削除
      await tx.postCategory.deleteMany({
        where: { postId },
      });

      // 新しい紐付けを追加
      await tx.postCategory.createMany({
        data: categoryIds.map((categoryId) => ({
          postId,
          categoryId,
        })),
      });

      return post;
    });


    return NextResponse.json(updatedPost, { status: 200 });

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "投稿記事の更新に失敗しました" },
      { status: 500 }
    );
  }
};
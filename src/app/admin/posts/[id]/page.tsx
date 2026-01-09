"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type Category = {
  id: string;
  name: string;
};

type EditPostResponse = {
  id: string;
  title: string;
  content: string;
  coverImageURL?: string;
  categories: {
    id: string;
    name: string;
  }[];
};

const EditPostPage = () => {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [coverImageURL, setCoverImageURL] = useState<string | undefined>();
  const [categoryIds, setCategoryIds] = useState<string[]>([]);
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // 初期データ取得
  useEffect(() => {
    const fetchData = async () => {
      try {
        // 投稿取得
        const postRes = await fetch(`/api/admin/posts/${id}`, {
          cache: "no-store",
        });
        if (!postRes.ok) throw new Error("投稿取得失敗");

        const post: EditPostResponse = await postRes.json();

        setTitle(post.title);
        setContent(post.content);
        setCoverImageURL(post.coverImageURL ?? undefined);
        setCategoryIds(
        post.categories.map((cat) => cat.id)
        );

        // カテゴリ一覧取得
        const catRes = await fetch("/api/categories", {
          cache: "no-store",
        });
        if (!catRes.ok) throw new Error("カテゴリ取得失敗");

        const categories = await catRes.json();
        setAllCategories(categories);
      } catch (e) {
        alert("データの取得に失敗しました");
        router.push("/admin/posts");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, router]);

  // チェックボックス切り替え
  const toggleCategory = (categoryId: string) => {
    setCategoryIds((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  // 更新
  const handleUpdate = async () => {
    const res = await fetch(`/api/admin/posts/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        content,
        coverImageURL,
        categoryIds,
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      alert(err.error ?? "更新に失敗しました");
      return;
    }

    router.push("/admin/posts");
  };

  // 削除
  const handleDelete = async () => {
    if (!confirm("この投稿を削除しますか？")) return;

    const res = await fetch(`/api/admin/posts/${id}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      alert("削除に失敗しました");
      return;
    }

    router.push("/admin/posts");
  };

  if (loading) return <div>Loading...</div>;

  return (
    <main className="space-y-6 max-w-2xl">
      <h1 className="text-xl font-bold">投稿編集</h1>

      {/* タイトル */}
      <div>
        <label className="block font-semibold">タイトル</label>
        <input
          className="border p-2 w-full"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      {/* 内容 */}
      <div>
        <label className="block font-semibold">本文</label>
        <textarea
          className="border p-2 w-full h-40"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
      </div>

      {/* カバー画像URL */}
      <div>
        <label className="block font-semibold">カバー画像URL</label>
        <input
          className="border p-2 w-full"
          value={coverImageURL ?? ""}
          onChange={(e) => setCoverImageURL(e.target.value || undefined)}
        />
      </div>

      {/* カテゴリ */}
      <div>
        <label className="block font-semibold mb-1">カテゴリ</label>
        <div className="space-y-1">
          {allCategories.map((cat) => (
            <label key={cat.id} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={categoryIds.includes(cat.id)}
                onChange={() => toggleCategory(cat.id)}
              />
              <span>{cat.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* 操作 */}
      <div className="flex space-x-4">
        <button
          onClick={handleUpdate}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          更新
        </button>

        <button
          onClick={handleDelete}
          className="px-4 py-2 bg-red-600 text-white rounded"
        >
          削除
        </button>
      </div>
    </main>
  );
};

export default EditPostPage;

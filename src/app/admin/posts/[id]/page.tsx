"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

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

type CategoryView = "col2" | "col3";

const EditPostPage = () => {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [coverImageURL, setCoverImageURL] =
    useState<string | undefined>();
  const [categoryIds, setCategoryIds] = useState<string[]>([]);
  const [allCategories, setAllCategories] =
    useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // カテゴリ表示モード
  const [categoryView, setCategoryView] =
    useState<CategoryView>("col2");

  // ★ 追加：カテゴリ検索
  const [categorySearch, setCategorySearch] =
    useState("");

  // 初期データ取得
  useEffect(() => {
    const fetchData = async () => {
      try {
        const postRes = await fetch(
          `/api/admin/posts/${id}`,
          { cache: "no-store" }
        );
        if (!postRes.ok) throw new Error();

        const post: EditPostResponse =
          await postRes.json();

        setTitle(post.title);
        setContent(post.content);
        setCoverImageURL(post.coverImageURL);
        setCategoryIds(post.categories.map((c) => c.id));

        const catRes = await fetch("/api/categories", {
          cache: "no-store",
        });
        if (!catRes.ok) throw new Error();

        setAllCategories(await catRes.json());
      } catch {
        alert("データの取得に失敗しました");
        router.push("/admin/posts");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, router]);

  // カテゴリ検索結果
  const filteredCategories = useMemo(() => {
    return allCategories.filter((cat) =>
      cat.name
        .toLowerCase()
        .includes(categorySearch.toLowerCase())
    );
  }, [allCategories, categorySearch]);

  const toggleCategory = (categoryId: string) => {
    setCategoryIds((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

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
      {/* 上部ナビ */}
      <header className="flex gap-2">
        <Link
          href="/admin/posts"
          className="px-3 py-2 rounded bg-gray-200 hover:bg-gray-300"
        >
          投稿記事一覧
        </Link>

        <Link
          href="/admin"
          className="px-3 py-2 rounded bg-gray-200 hover:bg-gray-300"
        >
          管理画面トップ
        </Link>
      </header>

      <h1 className="text-xl font-bold">投稿編集</h1>

      {/* タイトル */}
      <div>
        <label className="block font-semibold">
          タイトル
        </label>
        <input
          className="border p-2 w-full"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      {/* 本文 */}
      <div>
        <label className="block font-semibold">
          本文
        </label>
        <textarea
          className="border p-2 w-full h-40"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
      </div>

      {/* カバー画像 */}
      <div>
        <label className="block font-semibold">
          カバー画像URL
        </label>
        <input
          className="border p-2 w-full"
          value={coverImageURL ?? ""}
          onChange={(e) =>
            setCoverImageURL(
              e.target.value || undefined
            )
          }
        />
      </div>

      {/* カテゴリ */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="font-semibold">
            カテゴリ
          </label>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setCategoryView("col2")}
              className={`px-2 py-1 border rounded text-sm ${
                categoryView === "col2"
                  ? "bg-blue-600 text-white"
                  : ""
              }`}
            >
              縦2列
            </button>

            <button
              type="button"
              onClick={() => setCategoryView("col3")}
              className={`px-2 py-1 border rounded text-sm ${
                categoryView === "col3"
                  ? "bg-blue-600 text-white"
                  : ""
              }`}
            >
              縦3列
            </button>
          </div>
        </div>

        {/* ★ カテゴリ検索 */}
        <input
          type="text"
          placeholder="カテゴリ検索"
          value={categorySearch}
          onChange={(e) =>
            setCategorySearch(e.target.value)
          }
          className="border px-2 py-1 rounded w-full mb-2"
        />

        <div
          className={`grid gap-1 ${
            categoryView === "col2"
              ? "grid-cols-2"
              : "grid-cols-3"
          }`}
        >
          {filteredCategories.map((cat) => (
            <label
              key={cat.id}
              className="flex items-center space-x-2"
            >
              <input
                type="checkbox"
                checked={categoryIds.includes(cat.id)}
                onChange={() =>
                  toggleCategory(cat.id)
                }
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

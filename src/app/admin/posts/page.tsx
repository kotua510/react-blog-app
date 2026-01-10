"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type AdminPost = {
  id: string;
  title: string;
  createdAt: string;
  categories: {
    id: string;
    category: {
      id: string;
      name: string;
    };
  }[];
};

type ViewMode = "list" | "grid";
type SortKey = "new" | "old" | "title";

const ITEMS_PER_PAGE = 8;

const AdminPostsPage = () => {
  const [posts, setPosts] = useState<AdminPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [sortKey, setSortKey] = useState<SortKey>("new");

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await fetch("/api/admin/posts", { cache: "no-store" });
        if (!res.ok) throw new Error("投稿一覧の取得に失敗しました");
        const data: AdminPost[] = await res.json();
        setPosts(data);
      } catch (e) {
        setError(e instanceof Error ? e.message : "不明なエラー");
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const handleDelete = async (postId: string, title: string) => {
    if (!window.confirm(`「${title}」を削除しますか？`)) return;

    const res = await fetch(`/api/admin/posts/${postId}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      alert("削除に失敗しました");
      return;
    }

    setPosts((prev) => prev.filter((p) => p.id !== postId));
  };

  // 検索
  const filteredPosts = useMemo(() => {
    return posts.filter((post) =>
      post.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [posts, searchTerm]);

  // 並び替え
  const sortedPosts = useMemo(() => {
    const copy = [...filteredPosts];

    switch (sortKey) {
      case "new":
        return copy.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() -
            new Date(a.createdAt).getTime()
        );
      case "old":
        return copy.sort(
          (a, b) =>
            new Date(a.createdAt).getTime() -
            new Date(b.createdAt).getTime()
        );
      case "title":
        return copy.sort((a, b) =>
          a.title.localeCompare(b.title, "ja")
        );
      default:
        return copy;
    }
  }, [filteredPosts, sortKey]);

  // ページ分割
  const totalPages = Math.ceil(sortedPosts.length / ITEMS_PER_PAGE);

  const paginatedPosts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return sortedPosts.slice(start, start + ITEMS_PER_PAGE);
  }, [sortedPosts, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortKey]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <main className="space-y-6">
      <header className="flex gap-2">
        <Link
          href="/admin/posts/new"
          className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
        >
          記事新規作成
        </Link>

        <Link
          href="/admin"
          className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
        >
          管理画面トップ
        </Link>
      </header>

      <h1 className="text-2xl font-bold">投稿管理</h1>

      <div className="flex flex-wrap gap-2 items-center">
        <input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="タイトルで検索"
          className="border px-3 py-2 rounded max-w-sm w-full"
        />

        <select
          value={sortKey}
          onChange={(e) => setSortKey(e.target.value as SortKey)}
          className="border px-2 py-2 rounded"
        >
          <option value="new">新しい順</option>
          <option value="old">古い順</option>
          <option value="title">タイトル順</option>
        </select>

        <button
          onClick={() => setViewMode("list")}
          className={`px-3 py-2 border rounded ${
            viewMode === "list" ? "bg-blue-600 text-white" : ""
          }`}
        >
          縦1列
        </button>

        <button
          onClick={() => setViewMode("grid")}
          className={`px-3 py-2 border rounded ${
            viewMode === "grid" ? "bg-blue-600 text-white" : ""
          }`}
        >
          縦2列
        </button>
      </div>

      <ul
        className={
          viewMode === "grid"
            ? "grid grid-cols-1 sm:grid-cols-2 gap-4"
            : "space-y-2"
        }
      >
        {paginatedPosts.map((post) => (
          <li
            key={post.id}
            className={`border rounded flex items-center justify-between ${
              viewMode === "list" ? "p-3" : "p-2"
            }`}
          >
            <div className="flex flex-col gap-1">
              <span className="font-medium">{post.title}</span>

              {post.categories?.length > 0 && (
  <div className="flex flex-wrap gap-1">
    {post.categories.map((pc) => (
      <span
        key={pc.id}
        className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-700"
      >
        {pc.category.name}
      </span>
    ))}
  </div>
)}

            </div>

            <div className="flex gap-2 shrink-0">
              <Link
                href={`/admin/posts/${post.id}`}
                className="px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700"
              >
                編集
              </Link>

              <button
                onClick={() => handleDelete(post.id, post.title)}
                className="px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700"
              >
                削除
              </button>
            </div>
          </li>
        ))}
      </ul>

      {totalPages > 1 && (
        <div className="flex gap-2 flex-wrap">
          {Array.from({ length: totalPages }).map((_, i) => {
            const page = i + 1;
            return (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-1 border rounded ${
                  page === currentPage
                    ? "bg-blue-600 text-white"
                    : "bg-white"
                }`}
              >
                {page}
              </button>
            );
          })}
        </div>
      )}
    </main>
  );
};

export default AdminPostsPage;

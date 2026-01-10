"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";

type AdminCategory = {
  id: string;
  name: string;
  createdAt: string;
};

type ViewMode = "list" | "grid";

const ITEMS_PER_PAGE = 8;

const AdminCategoriesPage = () => {
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<ViewMode>("list");

  // カテゴリ取得
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/categories", {
          cache: "no-store",
        });

        if (!res.ok) {
          throw new Error("カテゴリ一覧の取得に失敗しました");
        }

        const data: AdminCategory[] = await res.json();
        setCategories(data);
      } catch (e) {
        setError(
          e instanceof Error ? e.message : "不明なエラーが発生しました"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // 削除処理
  const handleDelete = async (categoryId: string, categoryName: string) => {
    if (!window.confirm(`カテゴリ「${categoryName}」を本当に削除しますか？`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/categories/${categoryId}`, {
        method: "DELETE",
        cache: "no-store",
      });

      if (!res.ok) {
        throw new Error(`${res.status}: ${res.statusText}`);
      }

      setCategories((prev) =>
        prev.filter((cat) => cat.id !== categoryId)
      );
    } catch (error) {
      const errorMsg =
        error instanceof Error
          ? `カテゴリの削除に失敗しました\n${error.message}`
          : `予期せぬエラーが発生しました\n${error}`;

      console.error(errorMsg);
      window.alert(errorMsg);
    }
  };

  // 検索
  const filteredCategories = useMemo(() => {
    return categories.filter((cat) =>
      cat.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [categories, searchTerm]);

  // ページネーション
  const totalPages = Math.ceil(
    filteredCategories.length / ITEMS_PER_PAGE
  );

  const paginatedCategories = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredCategories.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredCategories, currentPage]);

  // 検索時は1ページ目に戻す
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <main className="space-y-6">
      <header className="flex gap-2">
        <Link
          href="/admin/categories/new"
          className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
        >
          カテゴリ新規作成
        </Link>

        <Link
          href="/admin"
          className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
        >
          管理画面トップ
        </Link>
      </header>

      <h1 className="text-2xl font-bold">カテゴリ管理</h1>

      <div className="flex items-center gap-2 flex-wrap">
        <input
          type="text"
          placeholder="カテゴリ名で検索"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-sm border px-3 py-2 rounded"
        />

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
        {paginatedCategories.map((cat) => (
          <li
            key={cat.id}
            className={`border rounded flex items-center justify-between ${
              viewMode === "list" ? "p-3" : "p-2"
            }`}
          >
            <span
              className={`font-medium ${
                viewMode === "grid" ? "leading-tight" : ""
              }`}
            >
              {cat.name}
            </span>

            <div className="flex gap-2 shrink-0">
              <Link
                href={`/admin/categories/${cat.id}`}
                className="px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700"
              >
                編集
              </Link>

              <button
                onClick={() => handleDelete(cat.id, cat.name)}
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
                className={`px-3 py-1 rounded border ${
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

export default AdminCategoriesPage;

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type AdminCategory = {
  id: string;
  name: string;
  createdAt: string;
};

const AdminCategoriesPage = () => {
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { // この中には描画のために必要となる処理を書く(データ取得など)
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
    
    
      // 「削除」のボタンが押下されたときにコールされる関数
  const handleDelete = async (categoryId: string, categoryName: string) => {
  if (
    !window.confirm(`カテゴリ「${categoryName}」を本当に削除しますか？`)
  ) {
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

    // ✅ 一覧から削除（再取得しない）
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

    

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <main className="space-y-4">
      <h1 className="text-2xl font-bold">カテゴリ管理</h1>

      <ul className="space-y-2">
        {categories.map((cat) => (
          <li
            key={cat.id}
            className="flex items-center justify-between border p-3 rounded"
          >
            <span>{cat.name}</span>

            <div className="space-x-3">
              {/* 編集 */}
              <Link
                href={`/admin/categories/${cat.id}`}
                className="text-blue-600 underline"
              >
                編集
            </Link>
                    
            <button
    onClick={() => handleDelete(cat.id, cat.name)}
    className="text-red-600 underline"
            >
                削除
            </button>

            </div>
          </li>
        ))}
      </ul>
    </main>
  );
};

export default AdminCategoriesPage;

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type AdminPost = {
  id: string;
  title: string;
  createdAt: string;
};

const AdminPostsPage = () => {
  const [posts, setPosts] = useState<AdminPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await fetch("/api/admin/posts", { cache: "no-store" });
        if (!res.ok) {
          throw new Error("投稿一覧の取得に失敗しました");
        }
        const data = await res.json();
        setPosts(data);
      } catch (e) {
        setError(
          e instanceof Error ? e.message : "不明なエラーが発生しました"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const handleDelete = async (postId: string) => {
    const ok = window.confirm("この投稿を削除しますか？");
    if (!ok) return;

    try {
      const res = await fetch(`/api/admin/posts/${postId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("削除に失敗しました");
      }

      setPosts((prev) => prev.filter((p) => p.id !== postId));
    } catch (e) {
      alert(
        e instanceof Error ? e.message : "削除中にエラーが発生しました"
      );
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <main className="space-y-4">
      <h1 className="text-2xl font-bold">投稿管理</h1>

      <ul className="space-y-2">
        {posts.map((post) => (
          <li
            key={post.id}
            className="flex items-center justify-between border p-3 rounded"
          >
            <span>{post.title}</span>

            <div className="space-x-3">
              <Link
                href={`/admin/posts/${post.id}`}
                className="text-blue-600 underline"
              >
                編集
              </Link>

              <button
                onClick={() => handleDelete(post.id)}
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

export default AdminPostsPage;
